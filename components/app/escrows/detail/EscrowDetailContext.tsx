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
import { type Address, zeroAddress } from "viem";
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
  useEscrowOnChainState,
  type UseEscrowOnChainStateReturn,
} from "./hooks/useEscrowOnChainState";
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

  // Available actions (gated by on-chain state)
  actions: UseAvailableActionsReturn;

  // Transaction history
  transactions: UseEscrowTransactionsReturn;

  // Contract write functions
  write: UseEscrowActionsReturn;

  // Split proposal (derived from on-chain state when available, indexer fallback)
  splitProposal: SplitProposal | null;

  // Loading states
  isLoading: boolean;

  /**
   * Whether on-chain state is still loading (initial RPC call).
   * When true, ActionsCard should show a loading indicator instead of actions.
   */
  isOnChainLoading: boolean;

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
  // ON-CHAIN STATE (authoritative source of truth for action gating)
  //
  // Reads state directly from the contract via RPC multicall.
  // This prevents stale indexer data from showing wrong actions after
  // recent transactions, even across page refreshes.
  // ==========================================================================
  const onChainState = useEscrowOnChainState({
    escrowAddress: escrow.id,
    chainId: escrow.chainId,
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
  // AUTHORITATIVE STATE VALUES
  //
  // On-chain state is the authority for action gating and timers.
  // Falls back to indexer data while the initial RPC call is loading.
  // ==========================================================================
  const authState = onChainState.data?.state ?? escrow.state;
  const authAgent = onChainState.data?.agent ?? escrow.agent;
  const authFulfilledAt = onChainState.data
    ? onChainState.data.fulfilledAt > 0n ? onChainState.data.fulfilledAt : null
    : escrow.fulfilledAt;
  const authAgentInvitedAt = onChainState.data
    ? onChainState.data.agentInvitedAt > 0n ? onChainState.data.agentInvitedAt : null
    : escrow.agentInvitedAt;
  const authAgentResponseTime = onChainState.data
    ? onChainState.data.agentResponseTime
    : agentResponseTime;

  // ==========================================================================
  // TIMERS (using authoritative on-chain values)
  // ==========================================================================
  const timers = useEscrowTimers({
    state: authState,
    createdAt: escrow.createdAt,
    sellerAcceptDeadline: escrow.sellerAcceptDeadline,
    fulfilledAt: authFulfilledAt,
    buyerProtectionTime: escrow.buyerProtectionTime,
    agentInvitedAt: authAgentInvitedAt,
    agentResponseTime: authAgentResponseTime,
  });

  // ==========================================================================
  // SPLIT PROPOSAL (from on-chain state when available, indexer fallback)
  // ==========================================================================
  const splitProposal = useMemo<SplitProposal | null>(() => {
    if (onChainState.data) {
      // Use on-chain data as authority for split state
      const { splitProposer, proposedBuyerBps, proposedSellerBps, buyerApprovedSplit, sellerApprovedSplit } = onChainState.data;
      if (!splitProposer || splitProposer === zeroAddress) return null;
      return {
        proposer: splitProposer,
        buyerBps: proposedBuyerBps,
        sellerBps: proposedSellerBps,
        buyerApproved: buyerApprovedSplit,
        sellerApproved: sellerApprovedSplit,
      };
    }
    // Fallback to indexer data while on-chain is loading
    if (!escrow.splitProposer) return null;
    return {
      proposer: escrow.splitProposer,
      buyerBps: escrow.proposedBuyerBps ?? 0,
      sellerBps: escrow.proposedSellerBps ?? 0,
      buyerApproved: escrow.buyerApprovedSplit ?? false,
      sellerApproved: escrow.sellerApprovedSplit ?? false,
    };
  }, [
    onChainState.data,
    escrow.splitProposer,
    escrow.proposedBuyerBps,
    escrow.proposedSellerBps,
    escrow.buyerApprovedSplit,
    escrow.sellerApprovedSplit,
  ]);

  // ==========================================================================
  // AVAILABLE ACTIONS (gated by authoritative on-chain state)
  // ==========================================================================
  const actions = useAvailableActions({
    state: authState,
    role: role.role,
    isAcceptanceTimeoutExpired: timers.acceptanceTimer.isExpired,
    isProtectionExpired: timers.isProtectionExpired,
    isAgentTimeoutExpired: timers.isAgentTimeoutExpired,
    agent: authAgent,
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
    // Refetch on-chain state (authoritative)
    await onChainState.refetch();
    // Refetch indexer data (for rich display fields)
    await onRefetch?.();
    // Refetch transactions
    await transactions.refetch();
    // Invalidate related queries
    await queryClient.invalidateQueries({
      queryKey: ["escrow-transactions", escrow.id.toLowerCase()],
    });
  }, [onChainState, onRefetch, transactions, queryClient, escrow.id]);

  // ==========================================================================
  // CONTRACT WRITE ACTIONS
  // ==========================================================================
  const write = useEscrowActions({
    escrowAddress: escrow.id,
    onSuccess: async (action: EscrowAction, txHash: string) => {
      console.log(`[EscrowDetail] Action ${action} succeeded: ${txHash}`);

      // 1. Apply optimistic update — patches indexer cache for immediate UI feedback
      //    on display fields (state badge, timeline, etc.)
      const transitionContext: OptimisticTransitionContext = {
        userAddress: role.userAddress,
        buyer: escrow.buyer,
        seller: escrow.seller,
        ...actionContextRef.current,
      };
      applyOptimisticUpdate({ action, context: transitionContext });

      // Clear the action context ref after use
      actionContextRef.current = {};

      // 2. Refetch on-chain state — this is the authoritative source for actions.
      //    The RPC call returns the new state immediately (no indexer delay).
      await onChainState.refetch();

      // 3. Refetch transactions (timeline)
      await transactions.refetch();
      await queryClient.invalidateQueries({
        queryKey: ["escrow-transactions", escrow.id.toLowerCase()],
      });

      // 4. Invalidate escrow list queries so dashboards update
      await queryClient.invalidateQueries({
        queryKey: ["zenland", "escrows"],
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
      escrow: {
        ...escrow,
        // Override indexer state with authoritative on-chain state for display
        state: authState,
        agent: authAgent,
        fulfilledAt: authFulfilledAt,
        agentInvitedAt: authAgentInvitedAt,
      },
      tokenInfo,
      role,
      timers,
      actions,
      transactions,
      write,
      splitProposal,
      isLoading: transactions.isLoading || write.isPending,
      isOnChainLoading: onChainState.isLoading,
      refetch,
      setActionContext,
    }),
    [
      escrow,
      authState,
      authAgent,
      authFulfilledAt,
      authAgentInvitedAt,
      tokenInfo,
      role,
      timers,
      actions,
      transactions,
      write,
      splitProposal,
      onChainState.isLoading,
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
