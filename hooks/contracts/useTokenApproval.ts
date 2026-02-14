"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import {
  useReadContract,
  useWriteContract,
  useSignTypedData,
  useChainId,
  useConnection,
  useWaitForTransactionReceipt,
} from "wagmi";
import { type Address, type Hex } from "viem";

import {
  erc20Abi,
  PERMIT_TYPES,
  tokenSupportsPermit,
  getTokenByAddress,
} from "@/lib/contracts";
import { humanizeBlockchainError } from "@/lib/blockchain/errors";

// Defer state updates to avoid `react-hooks/set-state-in-effect`.
function defer(fn: () => void) {
  setTimeout(fn, 0);
}

/**
 * Approval status for a token.
 */
export type ApprovalStatus =
  | "idle"
  | "checking"
  | "needs-approval"
  | "approving"
  | "signing-permit"
  | "approved"
  | "error";

/**
 * Permit signature data.
 */
export interface PermitSignature {
  v: number;
  r: Hex;
  s: Hex;
  deadline: bigint;
}

type PermitApproval = {
  signature: PermitSignature;
  value: bigint;
};

/**
 * Hook return type for token approval.
 */
export interface UseTokenApprovalReturn {
  /** Current approval status */
  status: ApprovalStatus;
  /** Current allowance amount */
  allowance: bigint | undefined;
  /** Whether the token is approved for the required amount */
  isApproved: boolean;
  /** Whether an approval transaction is pending */
  isApproving: boolean;
  /** Whether this token supports ERC20Permit (EIP-2612) */
  supportsPermit: boolean;
  /** Error message if any */
  error: string | null;
  /** Permit signature if using permit */
  permitSignature: PermitSignature | null;
  /**
   * Whether the current approval is satisfied via permit (signature cached) instead of allowance.
   * Useful for choosing `*WithPermit` contract methods.
   */
  isPermit: boolean;
  /** Approve the token (uses permit if supported, otherwise standard approve) */
  approve: () => Promise<boolean>;
  /** Refetch allowance */
  refetch: () => void;
}

/**
 * Hook for managing ERC20 token approvals with permit support.
 *
 * Features:
 * - Checks current allowance
 * - Uses EIP-2612 permit for supported tokens (gasless approval)
 * - Falls back to standard approve for other tokens
 * - Tracks approval status
 *
 * @param tokenAddress - The token contract address
 * @param spenderAddress - The address to approve spending
 * @param amount - The amount to approve (in token's native decimals)
 * @param enabled - Whether to enable the hook
 */
export function useTokenApproval(
  tokenAddress: Address | undefined,
  spenderAddress: Address | undefined,
  amount: bigint | undefined,
  enabled = true
): UseTokenApprovalReturn {
  const chainId = useChainId();
  const { address: userAddress, connector } = useConnection();

  const [status, setStatus] = useState<ApprovalStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [permitApproval, setPermitApproval] = useState<PermitApproval | null>(null);
  const approveInFlightRef = useRef<{
    amount: bigint;
    promise: Promise<boolean>;
    resolve: (value: boolean) => void;
    reject: (reason?: unknown) => void;
  } | null>(null);
  const didSendApproveTxRef = useRef(false);

  // NYKNYC is a 4337 smart wallet. EIP-2612 permit() expects an ECDSA (EOA) signature
  // and will generally not work with ERC-1271 smart account signatures.
  // Force the standard on-chain approve() flow for NYKNYC (USDT-like behavior).
  const isNyknyc = connector?.id === "nyknyc" || connector?.type === "nyknyc";

  // Check if token supports permit
  const supportsPermit = useMemo(() => {
    if (!tokenAddress) return false;
    if (isNyknyc) return false;
    return tokenSupportsPermit(chainId, tokenAddress);
  }, [chainId, tokenAddress, isNyknyc]);

  const permitVersion = useMemo(() => {
    if (!tokenAddress) return "1";
    const cfg = getTokenByAddress(chainId, tokenAddress);
    return cfg?.permitVersion ?? "1";
  }, [chainId, tokenAddress]);

  // Read current allowance
  const {
    data: allowance,
    isLoading: isCheckingAllowance,
    refetch: refetchAllowance,
  } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "allowance",
    args: userAddress && spenderAddress ? [userAddress, spenderAddress] : undefined,
    query: {
      enabled: enabled && !!tokenAddress && !!userAddress && !!spenderAddress,
    },
  });

  // Check if approved via allowance
  const isApproved = useMemo(() => {
    // NOTE: allowance can validly be 0n, so we must not treat it as "missing".
    if (allowance === undefined || amount === undefined) return false;
    return allowance >= amount;
  }, [allowance, amount]);

  // Check if approved via permit signature (value must cover the current amount)
  const isPermitApproved = useMemo(() => {
    // IMPORTANT: EIP-2612 signatures are bound to the exact `value` that was signed.
    // Even if the user signs a permit for a larger value, this hook currently
    // stores a single signature. If the UI later changes the amount (even to a
    // smaller value), reusing the same signature will fail on-chain.
    //
    // Therefore, treat a cached signature as valid ONLY for the exact amount
    // it was created for.
    if (!permitApproval || amount === undefined) return false;
    return permitApproval.value === amount;
  }, [permitApproval, amount]);

  // If token/spender/chain changes, the cached permit signature is no longer valid.
  useEffect(() => {
    defer(() => setPermitApproval(null));
  }, [chainId, tokenAddress, spenderAddress]);

  // Read token nonce (for permit)
  const { data: nonce } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "nonces",
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: enabled && supportsPermit && !!tokenAddress && !!userAddress,
    },
  });

  // Read token name (for permit domain)
  const { data: tokenName } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "name",
    query: {
      enabled: enabled && supportsPermit && !!tokenAddress,
    },
  });

  // Sign typed data (for permit)
  const { signTypedDataAsync } = useSignTypedData();

  // Write contract (for standard approve)
  const {
    mutateAsync,
    isPending: isWritePending,
    data: approveTxHash,
  } = useWriteContract();

  // Wait for approve transaction
  const {
    isLoading: isWaitingForTx,
    isSuccess: isApproveTxSuccess,
    isError: isApproveTxError,
    error: approveTxError,
  } = useWaitForTransactionReceipt({
    hash: approveTxHash,
    query: {
      enabled: !!approveTxHash,
    },
  });

  const isApproving = isWritePending || isWaitingForTx || status === "signing-permit";

  // Once the approve tx is confirmed, refetch allowance and complete any pending approve() promise.
  useEffect(() => {
    if (!didSendApproveTxRef.current) return;
    if (!approveTxHash) return;
    if (!approveInFlightRef.current) return;

    if (isApproveTxError) {
      approveInFlightRef.current.reject(approveTxError);
      approveInFlightRef.current = null;
      didSendApproveTxRef.current = false;

      setError(humanizeBlockchainError(approveTxError, "Approval transaction failed"));
      setStatus("error");
      return;
    }

    if (!isApproveTxSuccess) return;

    (async () => {
      try {
        const { data: nextAllowance } = await refetchAllowance();
        const requestedAmount = approveInFlightRef.current?.amount;
        const ok =
          nextAllowance !== undefined &&
          requestedAmount !== undefined &&
          nextAllowance >= requestedAmount;

        setStatus(ok ? "approved" : "needs-approval");
        approveInFlightRef.current?.resolve(ok);
      } catch (err) {
        approveInFlightRef.current?.reject(err);
      setError(humanizeBlockchainError(err, "Approval refetch failed"));
      setStatus("error");
    } finally {
        approveInFlightRef.current = null;
        didSendApproveTxRef.current = false;
      }
    })();
  }, [
    approveTxHash,
    isApproveTxSuccess,
    isApproveTxError,
    approveTxError,
    refetchAllowance,
  ]);

  // Approve function
  const approve = useCallback(async (): Promise<boolean> => {
    if (!tokenAddress || !spenderAddress || !amount || !userAddress) {
      setError("Missing required parameters");
      return false;
    }

    if (isApproved) {
      return true;
    }

    setError(null);

    try {
      if (supportsPermit && nonce !== undefined && tokenName) {
        // Use permit (gasless approval)
        setStatus("signing-permit");

        const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600); // 1 hour from now

        const domain = {
          name: tokenName,
          version: permitVersion,
          chainId: BigInt(chainId),
          verifyingContract: tokenAddress,
        };

        const message = {
          owner: userAddress,
          spender: spenderAddress,
          value: amount,
          nonce: nonce,
          deadline: deadline,
        };

        const signature = await signTypedDataAsync({
          domain,
          types: PERMIT_TYPES,
          primaryType: "Permit",
          message,
        });

        // Parse signature
        const r = `0x${signature.slice(2, 66)}` as Hex;
        const s = `0x${signature.slice(66, 130)}` as Hex;
        const v = parseInt(signature.slice(130, 132), 16);

        setPermitApproval({
          signature: { v, r, s, deadline },
          value: amount,
        });
        setStatus("approved");
        return true;
      } else {
        // Use standard approve
        setStatus("approving");

        // If an approval tx is already in-flight (e.g. user clicks Register while approving),
        // just await the existing one.
        if (approveInFlightRef.current) {
          return await approveInFlightRef.current.promise;
        }

        // Create a promise that resolves only after the tx is mined and allowance is updated.
        let resolve!: (value: boolean) => void;
        let reject!: (reason?: unknown) => void;
        const promise = new Promise<boolean>((res, rej) => {
          resolve = res;
          reject = rej;
        });

        approveInFlightRef.current = { amount, promise, resolve, reject };

        didSendApproveTxRef.current = true;
        await mutateAsync({
          address: tokenAddress,
          abi: erc20Abi,
          functionName: "approve",
          args: [spenderAddress, amount],
          chainId,
        });

        return await promise;
      }
    } catch (err) {
      console.error("Approval error:", err);

      // If we created a pending promise but failed before receipt handling, reject it.
      approveInFlightRef.current?.reject(err);
      approveInFlightRef.current = null;
      didSendApproveTxRef.current = false;

      setError(humanizeBlockchainError(err, "Approval failed"));
      setStatus("error");
      return false;
    }
  }, [
    tokenAddress,
    spenderAddress,
    amount,
    userAddress,
    isApproved,
    supportsPermit,
    nonce,
    tokenName,
    chainId,
    permitVersion,
    signTypedDataAsync,
    mutateAsync,
  ]);

  // Determine status
  const computedStatus = useMemo((): ApprovalStatus => {
    if (status === "signing-permit" || status === "approving") return status;
    if (error) return "error";
    if (isCheckingAllowance) return "checking";
    if (isApproved || isPermitApproved) return "approved";
    if (allowance !== undefined && amount !== undefined) return "needs-approval";
    return "idle";
  }, [status, error, isCheckingAllowance, isApproved, isPermitApproved, allowance, amount]);

  return {
    status: computedStatus,
    allowance,
    isApproved: isApproved || isPermitApproved,
    isApproving,
    supportsPermit,
    error,
    permitSignature: permitApproval?.signature ?? null,
    isPermit: isPermitApproved,
    approve,
    refetch: refetchAllowance,
  };
}

/**
 * Hook for managing multiple token approvals.
 * Useful for agent registration where we need to approve both stablecoin and DAO token.
 */
export interface MultiApprovalToken {
  address: Address;
  amount: bigint;
  symbol: string;
}

export interface UseMultiTokenApprovalReturn {
  /** Status of each token approval */
  approvals: Record<string, UseTokenApprovalReturn>;
  /** Whether all tokens are approved */
  allApproved: boolean;
  /** Whether any approval is in progress */
  anyApproving: boolean;
  /** Approve all tokens that need approval */
  approveAll: () => Promise<boolean>;
  /** Get permit signatures for tokens that support permit */
  getPermitSignatures: () => Record<string, PermitSignature>;
}
