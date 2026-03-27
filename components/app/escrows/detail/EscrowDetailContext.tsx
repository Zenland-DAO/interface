"use client";

/**
 * EscrowDetailContext
 *
 * Provides all escrow detail data and actions to child components via React Context.
 * Composes all the individual hooks into a single context for easy consumption.
 */

import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { type Address } from "viem";
import { useQueryClient } from "@tanstack/react-query";

import { useEscrowRole, type UseEscrowRoleReturn } from "./hooks/useEscrowRole";
import { useEscrowTimers, type UseEscrowTimersReturn } from "./hooks/useEscrowTimers";
import { useAvailableActions, type UseAvailableActionsReturn } from "./hooks/useAvailableActions";
import { useEscrowTransactions, type UseEscrowTransactionsReturn } from "./hooks/useEscrowTransactions";
import { useEscrowActions, type UseEscrowActionsReturn } from "./hooks/useEscrowActions";
import {
  useOptimisticEscrowUpdate,
  type OptimisticTransitionContext,
} from "./hooks";
import {
  type EscrowState,
  type SplitProposal,
  type EscrowAction,
  type EscrowData,
} from "./types";

export type { EscrowState, SplitProposal, EscrowAction, EscrowData };

// =============================================================================
// TYPES
// =============================================================================

/**
 * Token info for display.
 */
export interface TokenInfo {
  address: Address;
  symbol: string;
  decimals: number;
}

/**
 * Context value provided to consumers.
 */
export interface EscrowDetailContextValue {
  // Core data
  escrow: EscrowData;
  tokenInfo: TokenInfo;

  // Role information
  role: UseEscrowRoleReturn;

  // Timer states
  timers: UseEscrowTimersReturn;

  // Available actions
  actions: UseAvailableActionsReturn;

  // Transaction history
  transactions: UseEscrowTransactionsReturn;

  // Contract write functions
  write: UseEscrowActionsReturn;

  // Split proposal (derived from escrow)
  splitProposal: SplitProposal | null;

  // Loading states
  isLoading: boolean;

  // Refetch function
  refetch: () => Promise<void>;

  /**
   * Set additional context for the next action (e.g., split bps).
   * Call this before invoking a write function so the optimistic update
   * can apply the correct field patches.
   */
  setActionContext: (ctx: Partial<OptimisticTransitionContext>) => void;
}

// =============================================================================
// CONTEXT
// =============================================================================

const EscrowDetailContext = createContext<EscrowDetailContextValue | null>(null);

// =============================================================================
// PROVIDER PROPS
// =============================================================================

export interface EscrowDetailProviderProps {
  /** Escrow data from the indexer */
  escrow: EscrowData;
  /** Token information */
  tokenInfo: TokenInfo;
  /** Agent response time from factory config */
  agentResponseTime: bigint;
  /** Child components */
  children: ReactNode;
  /** Callback to refetch escrow data */
  onRefetch?: () => Promise<void>;
}

// =============================================================================
// PROVIDER COMPONENT
// =============================================================================

/**
 * Provider component that composes all escrow detail hooks.
 *
 * @example
 * ```tsx
 * <EscrowDetailProvider
 *   escrow={escrowData}
 *   tokenInfo={tokenInfo}
 *   agentResponseTime={factoryConfig.agentResponseTime}
 *   onRefetch={refetchEscrow}
 * >
 *   <EscrowDetailHeader />
 *   <EscrowDetailActions />
 *   <EscrowDetailTimeline />
 * </EscrowDetailProvider>
 * ```
 */
export function EscrowDetailProvider({
  escrow,
  tokenInfo,
  agentResponseTime,
  children,
  onRefetch,
}: EscrowDetailProviderProps) {
  const queryClient = useQueryClient();

  // ==========================================================================
  // ACTION CONTEXT REF
  // Stores extra context (e.g., split bps) for the current/next action.
  // Set by consumers (e.g., ActionsCard) before calling a write function,
  // then read in onSuccess to build the optimistic transition context.
  // ==========================================================================
  const actionContextRef = useRef<Partial<OptimisticTransitionContext>>({});

  const setActionContext = useCallback((ctx: Partial<OptimisticTransitionContext>) => {
    actionContextRef.current = ctx;
  }, []);

  // ==========================================================================
  // OPTIMISTIC ESCROW UPDATE
  // ==========================================================================
  const { applyOptimisticUpdate } = useOptimisticEscrowUpdate({
    escrowId: escrow.id,
  });

  // ==========================================================================
  // ROLE DETECTION
  // ==========================================================================
  const role = useEscrowRole({
    buyer: escrow.buyer,
    seller: escrow.seller,
    agent: escrow.agent,
  });

  // ==========================================================================
  // TIMERS
  // ==========================================================================
  const timers = useEscrowTimers({
    state: escrow.state,
    createdAt: escrow.createdAt,
    sellerAcceptDeadline: escrow.sellerAcceptDeadline,
    fulfilledAt: escrow.fulfilledAt,
    buyerProtectionTime: escrow.buyerProtectionTime,
    agentInvitedAt: escrow.agentInvitedAt,
    agentResponseTime,
  });

  // ==========================================================================
  // SPLIT PROPOSAL (derived from escrow data)
  // ==========================================================================
  const splitProposal = useMemo<SplitProposal | null>(() => {
    if (!escrow.splitProposer) return null;
    return {
      proposer: escrow.splitProposer,
      buyerBps: escrow.proposedBuyerBps ?? 0,
      sellerBps: escrow.proposedSellerBps ?? 0,
      buyerApproved: escrow.buyerApprovedSplit ?? false,
      sellerApproved: escrow.sellerApprovedSplit ?? false,
    };
  }, [
    escrow.splitProposer,
    escrow.proposedBuyerBps,
    escrow.proposedSellerBps,
    escrow.buyerApprovedSplit,
    escrow.sellerApprovedSplit,
  ]);

  // ==========================================================================
  // AVAILABLE ACTIONS
  // ==========================================================================
  const actions = useAvailableActions({
    state: escrow.state,
    role: role.role,
    isAcceptanceTimeoutExpired: timers.acceptanceTimer.isExpired,
    isProtectionExpired: timers.isProtectionExpired,
    isAgentTimeoutExpired: timers.isAgentTimeoutExpired,
    agent: escrow.agent,
    splitProposal,
    userAddress: role.userAddress,
    buyer: escrow.buyer,
    seller: escrow.seller,
  });

  // ==========================================================================
  // TRANSACTION HISTORY
  // ==========================================================================
  const transactions = useEscrowTransactions({
    escrowAddress: escrow.id,
  });

  // ==========================================================================
  // REFETCH HANDLER
  // ==========================================================================
  const refetch = useCallback(async () => {
    // Refetch escrow data
    await onRefetch?.();
    // Refetch transactions
    await transactions.refetch();
    // Invalidate related queries
    await queryClient.invalidateQueries({
      queryKey: ["escrow-transactions", escrow.id.toLowerCase()],
    });
  }, [onRefetch, transactions, queryClient, escrow.id]);

  // ==========================================================================
  // CONTRACT WRITE ACTIONS
  // ==========================================================================
  const write = useEscrowActions({
    escrowAddress: escrow.id,
    onSuccess: async (action: EscrowAction, txHash: string) => {
      console.log(`[EscrowDetail] Action ${action} succeeded: ${txHash}`);

      // 1. Apply optimistic update — patches cache instantly for immediate UI feedback.
      //    Merges the ref-stored context (split bps, etc.) with always-available addresses.
      const transitionContext: OptimisticTransitionContext = {
        userAddress: role.userAddress,
        buyer: escrow.buyer,
        seller: escrow.seller,
        ...actionContextRef.current,
      };
      applyOptimisticUpdate({ action, context: transitionContext });

      // Clear the action context ref after use
      actionContextRef.current = {};

      // 2. Refetch transactions (timeline) — this is independent of the escrow state.
      //    The optimistic update + reconciliation polling handle the escrow data.
      await transactions.refetch();
      await queryClient.invalidateQueries({
        queryKey: ["escrow-transactions", escrow.id.toLowerCase()],
      });
    },
    onError: (action: EscrowAction, error: unknown) => {
      console.error(`[EscrowDetail] Action ${action} failed:`, error);
      // Clear context on error too
      actionContextRef.current = {};
    },
  });

  // ==========================================================================
  // CONTEXT VALUE
  // ==========================================================================
  const contextValue = useMemo<EscrowDetailContextValue>(
    () => ({
      escrow,
      tokenInfo,
      role,
      timers,
      actions,
      transactions,
      write,
      splitProposal,
      isLoading: transactions.isLoading || write.isPending,
      refetch,
      setActionContext,
    }),
    [
      escrow,
      tokenInfo,
      role,
      timers,
      actions,
      transactions,
      write,
      splitProposal,
      refetch,
      setActionContext,
    ]
  );

  return (
    <EscrowDetailContext.Provider value={contextValue}>
      {children}
    </EscrowDetailContext.Provider>
  );
}

// =============================================================================
// HOOK
// =============================================================================

/**
 * Hook to access the escrow detail context.
 *
 * @throws Error if used outside of EscrowDetailProvider
 *
 * @example
 * ```tsx
 * function EscrowActions() {
 *   const { actions, write } = useEscrowDetail();
 *
 *   if (actions.availableActions.release) {
 *     return (
 *       <Button onClick={write.release}>Release Funds</Button>
 *     );
 *   }
 * }
 * ```
 */
export function useEscrowDetail(): EscrowDetailContextValue {
  const context = useContext(EscrowDetailContext);

  if (!context) {
    throw new Error(
      "useEscrowDetail must be used within an EscrowDetailProvider"
    );
  }

  return context;
}

// =============================================================================
// OPTIONAL HOOK (doesn't throw)
// =============================================================================

/**
 * Hook to optionally access the escrow detail context.
 * Returns null if used outside of provider (doesn't throw).
 */
export function useEscrowDetailOptional(): EscrowDetailContextValue | null {
  return useContext(EscrowDetailContext);
}
