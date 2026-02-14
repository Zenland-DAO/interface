"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useReadContract,
  useChainId,
  useConnection,
} from "wagmi";
import { parseUnits, type Address, type Hex } from "viem";

import {
  agentRegistryAbi,
  getContractAddresses,
  isNonZeroAddress,
  getTokenConfig,
  getDaoToken,
  type TokenConfig,
  type StablecoinType,
} from "@/lib/contracts";
import {
  MIN_STABLECOIN_STAKE_USD,
  MIN_DAO_TOKEN_STAKE,
  MIN_FEE_BPS,
  MAX_FEE_BPS,
  MAX_DESCRIPTION_LENGTH,
  DEFAULT_ASSIGNMENT_FEE_BPS,
  DEFAULT_DISPUTE_FEE_BPS,
  calculateMav,
} from "@/lib/constants/agent";
import { validateContactStringStrict } from "@/lib/agents/contactCodec";
import { humanizeBlockchainError } from "@/lib/blockchain/errors";
import { byteLengthUtf8 } from "@/lib/agents/contactCodec";
import { useTokenApproval } from "./useTokenApproval";
import { useTokenBalance } from "./useTokenBalance";
import { parseUserAmountToUnits } from "@/lib/utils";
import { useWeb3Transaction } from "@/components/shared/web3/useWeb3Transaction";
import { invalidateAgentQueries } from "./invalidateAgentQueries";

import { toPermitParams } from "@/lib/contracts/permit";

// Defer state updates to avoid `react-hooks/set-state-in-effect`.
function defer(fn: () => void) {
  setTimeout(fn, 0);
}

function safeParseUnits(value: string, decimals: number): bigint | null {
  // Backwards-compatible wrapper; keep local name for readability.
  return parseUserAmountToUnits(value, decimals);
}

/**
 * Registration status.
 */
export type RegistrationStatus =
  | "idle"
  | "checking"
  | "ready"
  | "approving-stablecoin"
  | "approving-dao"
  | "registering"
  | "success"
  | "error";

/**
 * Registration form data.
 */
export interface RegistrationFormData {
  stablecoinType: StablecoinType;
  stablecoinAmount: string; // Human-readable amount
  daoTokenAmount: string; // Human-readable amount
  assignmentFeeBps: string; // Percentage string (e.g. "2.5")
  disputeFeeBps: string; // Percentage string (e.g. "3")
  description: string;
  contact: string;
}

/**
 * Validation errors.
 */
export interface ValidationErrors {
  stablecoinAmount?: string;
  daoTokenAmount?: string;
  assignmentFeeBps?: string;
  disputeFeeBps?: string;
  description?: string;
  contact?: string;
}

/**
 * Hook return type.
 */
export interface UseAgentRegistrationReturn {
  /** Current registration status */
  status: RegistrationStatus;
  /** Whether the user is already an agent */
  isAlreadyAgent: boolean;
  /** Whether the user can register (wallet connected, not already agent) */
  canRegister: boolean;
  /** Validation errors */
  errors: ValidationErrors;
  /** Whether form is valid */
  isValid: boolean;
  /** Stablecoin approval state */
  stablecoinApproval: {
    isApproved: boolean;
    isApproving: boolean;
    approve: () => Promise<boolean>;
  };
  /** DAO token approval state */
  daoTokenApproval: {
    isApproved: boolean;
    isApproving: boolean;
    approve: () => Promise<boolean>;
  };
  /** User's stablecoin balance */
  stablecoinBalance: bigint | undefined;
  /** User's DAO token balance */
  daoTokenBalance: bigint | undefined;
  /** Selected stablecoin config */
  stablecoinConfig: TokenConfig | undefined;
  /** DAO token config */
  daoTokenConfig: TokenConfig | undefined;
  /** Calculated MAV */
  calculatedMav: number;
  /** Transaction hash */
  txHash: Hex | undefined;
  /** Raw tx error object (useful for diagnostics / copy-paste reports). */
  rawError: unknown | null;
  /** Error message */
  error: string | null;
  /** Validate form data */
  validate: (data: RegistrationFormData) => ValidationErrors;
  /** Register as agent */
  register: (data: RegistrationFormData) => Promise<boolean>;
  /** Reset state */
  reset: () => void;
}

/**
 * Hook for managing the agent registration process.
 *
 * Features:
 * - Checks if user is already registered
 * - Validates form data
 * - Manages token approvals (with permit support)
 * - Executes registration transaction
 * - Tracks registration status
 */
export function useAgentRegistration(
  formData: RegistrationFormData
): UseAgentRegistrationReturn {
  const chainId = useChainId();
  const { address: userAddress, isConnected } = useConnection();

  const [status, setStatus] = useState<RegistrationStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const queryClient = useQueryClient();

  // Shared receipt-aware tx helper for the final register tx.
  // Get contract addresses
  const contracts = useMemo(() => getContractAddresses(chainId), [chainId]);
  const agentRegistryAddress =
    isNonZeroAddress(contracts?.agentRegistry) ? (contracts.agentRegistry as Address) : undefined;

  const {
    executeTransaction,
    isPending: isRegisterTxPending,
    txHash: confirmedRegisterTxHash,
    lastError: registerTxError,
    state: registerTxState,
  } = useWeb3Transaction({
    onSuccess: () => {
      if (!userAddress) return;
      invalidateAgentQueries(queryClient, userAddress);
      // Also invalidate the isAgent wagmi key if present.
      queryClient.invalidateQueries({
        queryKey: ["wagmi", "readContract", agentRegistryAddress, "isAgent"],
      });
    },
  });

  // If the registry address changes (chain switch), clear any previous register error.
  useEffect(() => {
    defer(() => setError(null));
  }, [agentRegistryAddress]);

  // Get token configs
  const stablecoinConfig = useMemo(
    () => getTokenConfig(chainId, formData.stablecoinType),
    [chainId, formData.stablecoinType]
  );
  const daoTokenConfig = useMemo(() => getDaoToken(chainId), [chainId]);

  // Parse amounts to bigint
  const stablecoinAmountBigInt = useMemo(() => {
    if (!stablecoinConfig) return undefined;
    const parsed = safeParseUnits(formData.stablecoinAmount, stablecoinConfig.decimals);
    return parsed ?? undefined;
  }, [formData.stablecoinAmount, stablecoinConfig]);

  const daoTokenAmountBigInt = useMemo(() => {
    if (!daoTokenConfig) return undefined;
    const parsed = safeParseUnits(formData.daoTokenAmount, daoTokenConfig.decimals);
    return parsed ?? undefined;
  }, [formData.daoTokenAmount, daoTokenConfig]);

  // Check if already registered
  const { data: isAlreadyAgent = false, isLoading: isCheckingAgent } = useReadContract({
    address: agentRegistryAddress,
    abi: agentRegistryAbi,
    functionName: "isAgent",
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!agentRegistryAddress && !!userAddress,
    },
  });

  // Get balances (shared hook)
  const { balance: stablecoinBalance } = useTokenBalance({
    tokenAddress: stablecoinConfig?.address,
    ownerAddress: userAddress as Address | undefined,
    enabled: !!stablecoinConfig && !!userAddress,
  });

  const { balance: daoTokenBalance } = useTokenBalance({
    tokenAddress: daoTokenConfig?.address,
    ownerAddress: userAddress as Address | undefined,
    enabled: !!daoTokenConfig && !!userAddress,
  });

  // Stablecoin approval
  const stablecoinApprovalHook = useTokenApproval(
    stablecoinConfig?.address,
    agentRegistryAddress,
    stablecoinAmountBigInt,
    !!stablecoinConfig && !!stablecoinAmountBigInt && !!agentRegistryAddress
  );

  // DAO token approval
  const daoTokenApprovalHook = useTokenApproval(
    daoTokenConfig?.address,
    agentRegistryAddress,
    daoTokenAmountBigInt,
    !!daoTokenConfig && !!daoTokenAmountBigInt && !!agentRegistryAddress
  );

  // Surface register-tx errors as persistent UI error.
  useEffect(() => {
    if (!registerTxError) return;
    defer(() => {
      setError(humanizeBlockchainError(registerTxError, "Registration failed"));
      setStatus("error");
    });
  }, [registerTxError]);

  // Calculate MAV
  const calculatedMav = useMemo(() => {
    const amount = parseFloat(formData.stablecoinAmount) || 0;
    return calculateMav(amount);
  }, [formData.stablecoinAmount]);

  // Validate form data
  const validate = useCallback((data: RegistrationFormData): ValidationErrors => {
    const newErrors: ValidationErrors = {};

    const stablecoinAmountBigIntLocal = stablecoinConfig
      ? safeParseUnits(data.stablecoinAmount, stablecoinConfig.decimals)
      : null;
    const daoTokenAmountBigIntLocal = daoTokenConfig
      ? safeParseUnits(data.daoTokenAmount, daoTokenConfig.decimals)
      : null;

    // Validate stablecoin amount
    const stablecoinAmount = parseFloat(data.stablecoinAmount) || 0;
    if (stablecoinAmount < MIN_STABLECOIN_STAKE_USD) {
      newErrors.stablecoinAmount = `Minimum stake is $${MIN_STABLECOIN_STAKE_USD}`;
    } else if (
      stablecoinBalance !== undefined &&
      stablecoinAmountBigIntLocal !== null &&
      stablecoinAmountBigIntLocal > stablecoinBalance
    ) {
      newErrors.stablecoinAmount = "Insufficient balance";
    }

    // Validate DAO token amount
    const daoAmount = parseFloat(data.daoTokenAmount) || 0;
    if (daoAmount < MIN_DAO_TOKEN_STAKE) {
      newErrors.daoTokenAmount = `Minimum stake is ${MIN_DAO_TOKEN_STAKE} ${daoTokenConfig?.symbol || "ZEN"}`;
    } else if (
      daoTokenBalance !== undefined &&
      daoTokenAmountBigIntLocal !== null &&
      daoTokenAmountBigIntLocal > daoTokenBalance
    ) {
      newErrors.daoTokenAmount = "Insufficient balance";
    }

    // Validate fees
    const assignmentFeePercent = parseFloat(data.assignmentFeeBps);
    const assignmentFeeBpsValue = isNaN(assignmentFeePercent) ? 0 : Math.round(assignmentFeePercent * 100);

    if (data.assignmentFeeBps && (assignmentFeeBpsValue < MIN_FEE_BPS || assignmentFeeBpsValue > MAX_FEE_BPS)) {
      newErrors.assignmentFeeBps = `Fee must be between ${MIN_FEE_BPS / 100}% and ${MAX_FEE_BPS / 100}%`;
    }

    const disputeFeePercent = parseFloat(data.disputeFeeBps);
    const disputeFeeBpsValue = isNaN(disputeFeePercent) ? 0 : Math.round(disputeFeePercent * 100);

    if (data.disputeFeeBps && (disputeFeeBpsValue < MIN_FEE_BPS || disputeFeeBpsValue > MAX_FEE_BPS)) {
      newErrors.disputeFeeBps = `Fee must be between ${MIN_FEE_BPS / 100}% and ${MAX_FEE_BPS / 100}%`;
    }

    // Validate description (contract enforces UTF-8 bytes length)
    const description = data.description.trim();
    const descriptionBytes = byteLengthUtf8(description);
    if (description.length === 0) {
      newErrors.description = "Description is required";
    } else if (descriptionBytes > MAX_DESCRIPTION_LENGTH) {
      newErrors.description = `Maximum ${MAX_DESCRIPTION_LENGTH} bytes (${descriptionBytes}/${MAX_DESCRIPTION_LENGTH})`;
    }

    // Validate contact (contract enforces UTF-8 bytes length via EscrowErrors.Agent__ContactTooLong)
    const contact = data.contact.trim();
    const contactErrors = validateContactStringStrict(contact, { requirePrimary: true });
    if (contactErrors.length > 0) {
      // Prefer combined errors; fall back to first error.
      const combined = contactErrors.find((e) => e.field === "combined")?.message;
      newErrors.contact = combined ?? contactErrors[0].message;
    }

    return newErrors;
  }, [stablecoinBalance, daoTokenBalance, daoTokenConfig, stablecoinConfig]);

  // Keep validation errors live so the UI can disable actions early (approve/register).
  const liveErrors = useMemo(() => validate(formData), [validate, formData]);
  const isValid = useMemo(() => Object.keys(liveErrors).length === 0, [liveErrors]);

  // Can register check
  const canRegister = isConnected && !!agentRegistryAddress && !isAlreadyAgent && !isCheckingAgent;

  // Register function
  const register = useCallback(async (data: RegistrationFormData): Promise<boolean> => {
    if (!canRegister || !agentRegistryAddress || !stablecoinConfig || !daoTokenConfig) {
      setError("Cannot register: missing requirements");
      return false;
    }

    // Validate
    const validationErrors = validate(data);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      setError("Please fix validation errors");
      return false;
    }

    setError(null);

    try {
      // Step 1: Approve stablecoin if needed
      if (!stablecoinApprovalHook.isApproved) {
        setStatus("approving-stablecoin");
        const approved = await stablecoinApprovalHook.approve();
        if (!approved) {
          setError("Stablecoin approval failed");
          setStatus("error");
          return false;
        }
      }

      // Step 2: Approve DAO token if needed
      if (!daoTokenApprovalHook.isApproved) {
        setStatus("approving-dao");
        const approved = await daoTokenApprovalHook.approve();
        if (!approved) {
          setError("DAO token approval failed");
          setStatus("error");
          return false;
        }
      }

      // Step 3: Register
      setStatus("registering");

      const stablecoinAmount = parseUnits(data.stablecoinAmount, stablecoinConfig.decimals);
      const daoAmount = parseUnits(data.daoTokenAmount, daoTokenConfig.decimals);

      const stablecoinPermit = toPermitParams(stablecoinApprovalHook.permitSignature);
      const daoTokenPermit = toPermitParams(daoTokenApprovalHook.permitSignature);

      const usePermitPath =
        stablecoinPermit.deadline !== BigInt(0) || daoTokenPermit.deadline !== BigInt(0);

      // Parse fees or use protocol defaults
      const assignmentFeePercent = parseFloat(data.assignmentFeeBps);
      const assignmentFeeBps = isNaN(assignmentFeePercent)
        ? DEFAULT_ASSIGNMENT_FEE_BPS
        : Math.round(assignmentFeePercent * 100);

      const disputeFeePercent = parseFloat(data.disputeFeeBps);
      const disputeFeeBps = isNaN(disputeFeePercent)
        ? DEFAULT_DISPUTE_FEE_BPS
        : Math.round(disputeFeePercent * 100);

      const hash = await executeTransaction(
        (write) =>
          write({
            address: agentRegistryAddress,
            abi: agentRegistryAbi,
            functionName: usePermitPath ? "registerAgentWithPermit" : "registerAgent",
            args: usePermitPath
              ? [
                  stablecoinConfig.address,
                  stablecoinAmount,
                  daoAmount,
                  BigInt(assignmentFeeBps),
                  BigInt(disputeFeeBps),
                  data.description.trim(),
                  data.contact.trim(),
                  stablecoinPermit,
                  daoTokenPermit,
                ]
              : [
                  stablecoinConfig.address,
                  stablecoinAmount,
                  daoAmount,
                  BigInt(assignmentFeeBps),
                  BigInt(disputeFeeBps),
                  data.description.trim(),
                  data.contact.trim(),
                ],
          }),
        {
          action: "registerAgent",
          actionLabel: "Registering agent",
          onError: (err) => {
            // Non-user rejections will also toast via shared helper.
            setError(humanizeBlockchainError(err, "Registration failed"));
            setStatus("error");
          },
        }
      );

      return !!hash;
    } catch (err) {
      console.error("Registration error:", err);
      setError(humanizeBlockchainError(err, "Registration failed"));
      setStatus("error");
      return false;
    }
  }, [
    canRegister,
    agentRegistryAddress,
    stablecoinConfig,
    daoTokenConfig,
    validate,
    stablecoinApprovalHook,
    daoTokenApprovalHook,
    executeTransaction,
  ]);

  // Reset state
  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
    setErrors({});
  }, []);

  // Compute final status
  const computedStatus = useMemo((): RegistrationStatus => {
    if (registerTxState === "success") return "success";
    if (isRegisterTxPending) return "registering";
    if (status === "approving-stablecoin" || status === "approving-dao") return status;
    if (error) return "error";
    if (isCheckingAgent) return "checking";
    if (isAlreadyAgent) return "error";
    if (canRegister && isValid) return "ready";
    return "idle";
  }, [registerTxState, isRegisterTxPending, status, error, isCheckingAgent, isAlreadyAgent, canRegister, isValid]);

  return {
    status: computedStatus,
    isAlreadyAgent,
    canRegister,
    errors: Object.keys(errors).length > 0 ? errors : liveErrors,
    isValid,
    stablecoinApproval: {
      isApproved: stablecoinApprovalHook.isApproved,
      isApproving: stablecoinApprovalHook.isApproving,
      approve: stablecoinApprovalHook.approve,
    },
    daoTokenApproval: {
      isApproved: daoTokenApprovalHook.isApproved,
      isApproving: daoTokenApprovalHook.isApproving,
      approve: daoTokenApprovalHook.approve,
    },
    stablecoinBalance,
    daoTokenBalance,
    stablecoinConfig,
    daoTokenConfig,
    calculatedMav,
    txHash: (confirmedRegisterTxHash as Hex | null) ?? undefined,
    rawError: registerTxError,
    error,
    validate,
    register,
    reset,
  };
}
