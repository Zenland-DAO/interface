"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useChainId,
} from "wagmi";
import { type Address, type Hex, zeroAddress, decodeEventLog } from "viem";

import {
  escrowFactoryAbi,
  type CreateEscrowParams,
  type PermitParams,
} from "@/lib/contracts/abis/escrowFactory";
import { getContractAddresses } from "@/lib/contracts";
import { humanizeBlockchainError } from "@/lib/blockchain/errors";
import { trackEscrowCreated } from "@/lib/analytics/gtag";

/**
 * Status of the escrow creation process.
 */
export type CreateEscrowStatus =
  | "idle"
  | "preparing"
  | "pending"
  | "confirming"
  | "success"
  | "error";

/**
 * Return type for the useCreateEscrow hook.
 */
export interface UseCreateEscrowReturn {
  /** Create escrow with standard token approval */
  createEscrow: (params: CreateEscrowParams) => Promise<Address>;
  /** Create escrow with ERC20 permit signature */
  createEscrowWithPermit: (
    params: CreateEscrowParams,
    permit: PermitParams
  ) => Promise<Address>;
  /** Current status of the creation process */
  status: CreateEscrowStatus;
  /** Whether a transaction is in progress */
  isPending: boolean;
  /** Whether the transaction was successful */
  isSuccess: boolean;
  /** Whether there was an error */
  isError: boolean;
  /** Transaction hash */
  txHash: Hex | undefined;
  /** Created escrow address (extracted from event) */
  escrowAddress: Address | undefined;
  /** Error message if any */
  error: string | null;
  /** Reset the hook state */
  reset: () => void;
}

/**
 * Hook for creating escrow contracts.
 *
 * Handles both standard approval and permit-based escrow creation.
 * Extracts the created escrow address from the EscrowCreated event.
 *
 * @returns Functions and state for escrow creation
 *
 * @example
 * ```tsx
 * const { createEscrow, status, escrowAddress, error } = useCreateEscrow();
 *
 * const handleCreate = async () => {
 *   const address = await createEscrow({
 *     userSalt,
 *     seller: sellerAddress,
 *     agent: agentAddress,
 *     token: tokenAddress,
 *     amount: BigInt(amount),
 *     buyerProtectionTime: BigInt(protectionTime),
 *     termsHash,
 *     version: BigInt(0),
 *     expectedEscrow: predictedAddress,
 *   });
 *
 *   if (address) {
 *     router.push(`/escrows/${address}`);
 *   }
 * };
 * ```
 */
export function useCreateEscrow(): UseCreateEscrowReturn {
  const chainId = useChainId();

  // Get contract addresses for current chain
  const contractAddresses = useMemo(
    () => getContractAddresses(chainId),
    [chainId]
  );

  // Track if we initiated a creation
  const [didInitiate, setDidInitiate] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Promise bridge so createEscrow() can await confirmation and return the address.
  const createInFlightRef = useRef<{
    promise: Promise<Address>;
    resolve: (addr: Address) => void;
    reject: (reason?: unknown) => void;
  } | null>(null);
  const didSendCreateTxRef = useRef(false);

  // Write contract hook
  const {
    mutateAsync,
    data: txHash,
    isPending: isWritePending,
    reset: resetWrite,
    error: writeError,
  } = useWriteContract();

  // Wait for transaction receipt
  const {
    isLoading: isWaitingForTx,
    isSuccess: isTxSuccess,
    isError: isTxError,
    error: txError,
    data: receipt,
  } = useWaitForTransactionReceipt({
    hash: txHash,
    query: {
      enabled: !!txHash && didInitiate,
    },
  });

  // Extract escrow address from receipt logs
  const extractEscrowAddress = useCallback(
    (logs: readonly { data: Hex; topics: readonly Hex[] }[] | undefined): Address | undefined => {
      if (!logs) return undefined;

      for (const log of logs) {
        try {
          const decoded = decodeEventLog({
            abi: escrowFactoryAbi,
            data: log.data,
            topics: log.topics as [Hex, ...Hex[]],
          });

          if (decoded.eventName === "EscrowCreated") {
            // The escrow address is the first indexed parameter
            return decoded.args.escrow as Address;
          }
        } catch {
          // Not this event, continue
        }
      }

      return undefined;
    },
    []
  );

  // Derive escrow address from receipt (computed, not effect-based)
  const escrowAddress = useMemo<Address | undefined>(() => {
    if (!isTxSuccess || !receipt) return undefined;
    return extractEscrowAddress(receipt.logs);
  }, [isTxSuccess, receipt, extractEscrowAddress]);

  // Resolve/reject the in-flight promise once we have a receipt outcome.
  useEffect(() => {
    if (!didSendCreateTxRef.current) return;
    if (!createInFlightRef.current) return;
    if (!txHash) return;

    if (isTxError) {
      createInFlightRef.current.reject(txError);
      createInFlightRef.current = null;
      didSendCreateTxRef.current = false;
      return;
    }

    if (!isTxSuccess || !receipt) return;

    if (!escrowAddress) {
      createInFlightRef.current.reject(
        new Error("Transaction succeeded but escrow address not found in logs")
      );
      createInFlightRef.current = null;
      didSendCreateTxRef.current = false;
      return;
    }

    // Track successful escrow creation for analytics
    trackEscrowCreated();

    createInFlightRef.current.resolve(escrowAddress);
    createInFlightRef.current = null;
    didSendCreateTxRef.current = false;
  }, [txHash, isTxSuccess, isTxError, txError, receipt, escrowAddress]);

  // Derive status from wagmi state (computed, not effect-based)
  const status = useMemo<CreateEscrowStatus>(() => {
    if (localError || writeError || isTxError) return "error";
    if (isTxSuccess && receipt) {
      return escrowAddress ? "success" : "error";
    }
    if (isWaitingForTx) return "confirming";
    if (isWritePending) return "pending";
    if (didInitiate && txHash && !isTxSuccess && !isTxError) {
      return "confirming";
    }
    return "idle";
  }, [
    localError,
    writeError,
    isTxError,
    isTxSuccess,
    receipt,
    escrowAddress,
    isWaitingForTx,
    isWritePending,
    didInitiate,
    txHash,
  ]);

  // Derive error message
  const error = useMemo<string | null>(() => {
    if (localError) return localError;
    if (writeError) return humanizeBlockchainError(writeError);
    if (isTxError && txError) return humanizeBlockchainError(txError);
    if (isTxSuccess && receipt && !escrowAddress) {
      return "Transaction succeeded but escrow address not found in logs";
    }
    return null;
  }, [localError, writeError, isTxError, txError, isTxSuccess, receipt, escrowAddress]);

  /**
   * Create escrow with standard token approval.
   */
  const createEscrow = useCallback(
    async (params: CreateEscrowParams): Promise<Address> => {
      if (!contractAddresses?.escrowFactory) {
        const err = new Error("Factory address not found for current chain");
        setLocalError(err.message);
        throw err;
      }

      setLocalError(null);
      setDidInitiate(true);

      // If a creation tx is already in-flight, just await it.
      if (createInFlightRef.current) {
        return await createInFlightRef.current.promise;
      }

      // Create a promise that resolves only after the tx is mined AND we decode EscrowCreated.
      let resolve!: (addr: Address) => void;
      let reject!: (reason?: unknown) => void;
      const promise = new Promise<Address>((res, rej) => {
        resolve = res;
        reject = rej;
      });
      createInFlightRef.current = { promise, resolve, reject };

      try {
        didSendCreateTxRef.current = true;

        // Normalize agent address (null -> zeroAddress)
        const normalizedParams = {
          ...params,
          agent: params.agent || zeroAddress,
        };

        await mutateAsync({
          address: contractAddresses.escrowFactory as Address,
          abi: escrowFactoryAbi,
          functionName: "createEscrow",
          args: [normalizedParams],
          chainId,
        });

        return await promise;
      } catch (err) {
        console.error("Create escrow error:", err);

        // Reject the pending promise if we failed before receipt handling.
        createInFlightRef.current?.reject(err);
        createInFlightRef.current = null;
        didSendCreateTxRef.current = false;

        const message =
          err instanceof Error ? humanizeBlockchainError(err) : "Failed to create escrow";
        setLocalError(message);
        throw err instanceof Error ? err : new Error(message);
      }
    },
    [chainId, contractAddresses, mutateAsync]
  );

  /**
   * Create escrow with ERC20 permit signature.
   */
  const createEscrowWithPermit = useCallback(
    async (
      params: CreateEscrowParams,
      permit: PermitParams
    ): Promise<Address> => {
      if (!contractAddresses?.escrowFactory) {
        const err = new Error("Factory address not found for current chain");
        setLocalError(err.message);
        throw err;
      }

      setLocalError(null);
      setDidInitiate(true);

      // If a creation tx is already in-flight, just await it.
      if (createInFlightRef.current) {
        return await createInFlightRef.current.promise;
      }

      let resolve!: (addr: Address) => void;
      let reject!: (reason?: unknown) => void;
      const promise = new Promise<Address>((res, rej) => {
        resolve = res;
        reject = rej;
      });
      createInFlightRef.current = { promise, resolve, reject };

      try {
        didSendCreateTxRef.current = true;

        // Normalize agent address (null -> zeroAddress)
        const normalizedParams = {
          ...params,
          agent: params.agent || zeroAddress,
        };

        await mutateAsync({
          address: contractAddresses.escrowFactory as Address,
          abi: escrowFactoryAbi,
          functionName: "createEscrowWithPermit",
          args: [normalizedParams, permit],
          chainId,
        });

        return await promise;
      } catch (err) {
        console.error("Create escrow with permit error:", err);

        createInFlightRef.current?.reject(err);
        createInFlightRef.current = null;
        didSendCreateTxRef.current = false;

        const message =
          err instanceof Error
            ? humanizeBlockchainError(err)
            : "Failed to create escrow with permit";
        setLocalError(message);
        throw err instanceof Error ? err : new Error(message);
      }
    },
    [chainId, contractAddresses, mutateAsync]
  );

  /**
   * Reset hook state.
   */
  const reset = useCallback(() => {
    setLocalError(null);
    setDidInitiate(false);
    createInFlightRef.current = null;
    didSendCreateTxRef.current = false;
    resetWrite();
  }, [resetWrite]);

  // Computed states
  const isPending =
    status === "preparing" || status === "pending" || status === "confirming";
  const isSuccess = status === "success";
  const isError = status === "error";

  return {
    createEscrow,
    createEscrowWithPermit,
    status,
    isPending,
    isSuccess,
    isError,
    txHash,
    escrowAddress,
    error,
    reset,
  };
}

/**
 * Helper type for the tuple params expected by the contract.
 * Use this when constructing params for createEscrow.
 */
export interface CreateEscrowInput {
  userSalt: Hex;
  seller: Address;
  agent: Address | null; // Will be converted to zeroAddress if null
  token: Address;
  amount: bigint;
  buyerProtectionTime: bigint;
  termsHash: Hex;
  version: bigint;
  expectedEscrow: Address;
}

/**
 * Convert user-friendly input to contract params.
 */
export function toCreateEscrowParams(
  input: CreateEscrowInput
): CreateEscrowParams {
  return {
    userSalt: input.userSalt,
    seller: input.seller,
    agent: input.agent ?? zeroAddress,
    token: input.token,
    amount: input.amount,
    buyerProtectionTime: input.buyerProtectionTime,
    termsHash: input.termsHash,
    version: input.version,
    expectedEscrow: input.expectedEscrow,
  };
}
