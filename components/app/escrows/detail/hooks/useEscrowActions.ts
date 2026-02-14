"use client";

/**
 * useEscrowActions Hook
 *
 * Provides all escrow contract write operations with error handling and toast notifications.
 */

import { useCallback } from "react";
import { type Address } from "viem";

import { escrowImplementationAbi } from "@/lib/contracts/abis/escrowImplementation";
import { useWeb3Transaction } from "@/components/shared/web3/useWeb3Transaction";
import { type EscrowAction } from "../types";
import { ACTION_LABELS } from "../constants";

type EscrowWriteFunctionName = Extract<
  (typeof escrowImplementationAbi)[number],
  { type: "function"; stateMutability: "nonpayable" | "payable" }
>["name"];

// =============================================================================
// TYPES
// =============================================================================

export interface UseEscrowActionsParams {
  /** Escrow contract address */
  escrowAddress: Address;
  /** Callback after successful transaction */
  onSuccess?: (action: EscrowAction, txHash: string) => void;
  /** Callback after failed transaction */
  onError?: (action: EscrowAction, error: unknown) => void;
}

export interface UseEscrowActionsReturn {
  // Simple actions (no params)
  accept: () => Promise<void>;
  decline: () => Promise<void>;
  cancelExpired: () => Promise<void>;
  confirmFulfillment: () => Promise<void>;
  release: () => Promise<void>;
  releaseAfterProtection: () => Promise<void>;
  openDispute: () => Promise<void>;
  inviteAgent: () => Promise<void>;
  claimAgentTimeout: () => Promise<void>;
  approveSplit: (expectedBuyerBps: number, expectedSellerBps: number) => Promise<void>;
  sellerRefund: () => Promise<void>;

  // Parameterized actions
  proposeSplit: (buyerBps: number, sellerBps: number) => Promise<void>;
  agentResolve: (buyerBps: number, sellerBps: number) => Promise<void>;

  // State
  isPending: boolean;
  pendingAction: EscrowAction | null;
}

// =============================================================================
// HOOK
// =============================================================================

/**
 * Hook providing all escrow contract write operations.
 *
 * @example
 * ```tsx
 * const {
 *   release,
 *   confirmFulfillment,
 *   proposeSplit,
 *   isPending,
 *   pendingAction,
 * } = useEscrowActions({
 *   escrowAddress: escrow.id,
 *   onSuccess: (action, txHash) => {
 *     console.log(`${action} succeeded: ${txHash}`);
 *     refetchEscrow();
 *   },
 * });
 *
 * // Simple action
 * <Button onClick={release} disabled={isPending}>
 *   {pendingAction === 'release' ? 'Releasing...' : 'Release Funds'}
 * </Button>
 *
 * // Parameterized action
 * <Button onClick={() => proposeSplit(5000, 5000)}>
 *   Propose 50/50 Split
 * </Button>
 * ```
 */
export function useEscrowActions(params: UseEscrowActionsParams): UseEscrowActionsReturn {
  const { escrowAddress, onSuccess, onError } = params;

  // Use the web3 transaction hook for toast handling
  const {
    executeTransaction,
    executeTransactionWithAction,
    isPending,
    pendingAction,
  } = useWeb3TransactionActions({
    escrowAddress,
    onSuccess,
    onError,
  });

  // ==========================================================================
  // SIMPLE ACTIONS (NO PARAMS)
  // ==========================================================================

  const accept = useCallback(async () => {
    await executeTransaction("accept", []);
  }, [executeTransaction]);

  const decline = useCallback(async () => {
    await executeTransaction("decline", []);
  }, [executeTransaction]);

  const cancelExpired = useCallback(async () => {
    await executeTransaction("cancelExpired", []);
  }, [executeTransaction]);

  const confirmFulfillment = useCallback(async () => {
    await executeTransaction("confirmFulfillment", []);
  }, [executeTransaction]);

  const release = useCallback(async () => {
    await executeTransaction("release", []);
  }, [executeTransaction]);

  const releaseAfterProtection = useCallback(async () => {
    // The on-chain contract exposes only `release()`.
    // `releaseAfterProtection` is a UI-only action name for the seller branch.
    await executeTransactionWithAction("releaseAfterProtection", "release", []);
  }, [executeTransactionWithAction]);

  const openDispute = useCallback(async () => {
    await executeTransaction("openDispute", []);
  }, [executeTransaction]);

  const inviteAgent = useCallback(async () => {
    await executeTransaction("inviteAgent", []);
  }, [executeTransaction]);

  const claimAgentTimeout = useCallback(async () => {
    await executeTransaction("claimAgentTimeout", []);
  }, [executeTransaction]);

  const approveSplit = useCallback(
    async (expectedBuyerBps: number, expectedSellerBps: number) => {
      await executeTransaction("approveSplit", [
        BigInt(expectedBuyerBps),
        BigInt(expectedSellerBps),
      ]);
    },
    [executeTransaction]
  );

  const sellerRefund = useCallback(async () => {
    await executeTransaction("sellerRefund", []);
  }, [executeTransaction]);

  // ==========================================================================
  // PARAMETERIZED ACTIONS
  // ==========================================================================

  const proposeSplit = useCallback(
    async (buyerBps: number, sellerBps: number) => {
      await executeTransaction("proposeSplit", [BigInt(buyerBps), BigInt(sellerBps)]);
    },
    [executeTransaction]
  );

  const agentResolve = useCallback(
    async (buyerBps: number, sellerBps: number) => {
      await executeTransaction("agentResolve", [BigInt(buyerBps), BigInt(sellerBps)]);
    },
    [executeTransaction]
  );

  return {
    accept,
    decline,
    cancelExpired,
    confirmFulfillment,
    release,
    releaseAfterProtection,
    openDispute,
    inviteAgent,
    claimAgentTimeout,
    approveSplit,
    sellerRefund,
    proposeSplit,
    agentResolve,
    isPending,
    pendingAction,
  };
}

// =============================================================================
// INTERNAL HOOK: Transaction Execution
// =============================================================================

interface UseWeb3TransactionActionsParams {
  escrowAddress: Address;
  onSuccess?: (action: EscrowAction, txHash: string) => void;
  onError?: (action: EscrowAction, error: unknown) => void;
}

interface UseWeb3TransactionActionsReturn {
  executeTransaction: (functionName: EscrowWriteFunctionName, args: readonly unknown[]) => Promise<void>;
  executeTransactionWithAction: (
    action: EscrowAction,
    functionName: EscrowWriteFunctionName,
    args: readonly unknown[]
  ) => Promise<void>;
  isPending: boolean;
  pendingAction: EscrowAction | null;
}

function useWeb3TransactionActions(
  params: UseWeb3TransactionActionsParams
): UseWeb3TransactionActionsReturn {
  const { escrowAddress, onSuccess, onError } = params;

  const { executeTransaction: executeWeb3Tx, isPending, currentAction } = useWeb3Transaction();

  const executeTransactionWithAction = useCallback(
    async (action: EscrowAction, functionName: EscrowWriteFunctionName, args: readonly unknown[]) => {
      const actionLabel = ACTION_LABELS[action] || functionName;

      await executeWeb3Tx(
        async (writeContract) => {
          const hash = await writeContract({
            address: escrowAddress,
            abi: escrowImplementationAbi,
            functionName,
            args: args as never,
          });
          return hash;
        },
        {
          action,
          actionLabel,
          onSuccess: (txHash) => onSuccess?.(action, txHash),
          onError: (error) => onError?.(action, error),
        }
      );
    },
    [escrowAddress, executeWeb3Tx, onSuccess, onError]
  );

  const executeTransaction = useCallback(
    async (functionName: EscrowWriteFunctionName, args: readonly unknown[]) => {
      await executeTransactionWithAction(functionName as EscrowAction, functionName, args);
    },
    [executeTransactionWithAction]
  );

  return {
    executeTransaction,
    executeTransactionWithAction,
    isPending,
    pendingAction: currentAction as EscrowAction | null,
  };
}
