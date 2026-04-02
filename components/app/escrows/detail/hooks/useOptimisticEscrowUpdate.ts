"use client";

/**
 * useOptimisticEscrowUpdate Hook
 *
 * Provides instant UI updates after successful on-chain transactions
 * by patching the TanStack Query cache optimistically.
 *
 * Pattern: Cancel → Optimistic Set → Done
 *
 * On tx success: cancel in-flight fetches, patch cache with expected state.
 * The on-chain state hook (useEscrowOnChainState) is the authoritative source
 * for action gating. This optimistic update is purely for immediate UI feedback
 * (state badge, details sections) while the indexer catches up.
 *
 * Note: Reconciliation polling has been removed. The on-chain state hook
 * now serves as the ground truth, and the indexer will eventually catch up
 * on its own for display fields (timeline, transaction history, etc.).
 */

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

import type { GqlEscrow } from "@zenland/sdk/react";
import type { EscrowAction } from "../types";
import {
  applyOptimisticTransition,
  type OptimisticTransitionContext,
} from "./optimistic-updates";

// =============================================================================
// TYPES
// =============================================================================

export interface UseOptimisticEscrowUpdateParams {
  /** The escrow ID (address) used as the TanStack Query cache key. */
  escrowId: string;
}

export interface OptimisticUpdatePayload {
  /** The action that succeeded on-chain. */
  action: EscrowAction;
  /** Optional context for actions that need extra data (splits, resolves). */
  context?: OptimisticTransitionContext;
}

export interface UseOptimisticEscrowUpdateReturn {
  /**
   * Apply an optimistic update to the escrow cache.
   * Call this immediately after a transaction receipt confirms success.
   */
  applyOptimisticUpdate: (payload: OptimisticUpdatePayload) => void;
}

// =============================================================================
// QUERY KEY HELPERS
// =============================================================================

/**
 * Builds the TanStack Query key used by the SDK's `useEscrow` hook.
 * Must match: `["zenland", "escrow", id]` from `sdk/src/react/hooks/useEscrow.ts`.
 */
function escrowQueryKey(id: string): readonly unknown[] {
  return ["zenland", "escrow", id];
}

// =============================================================================
// HOOK
// =============================================================================

/**
 * Hook providing optimistic cache updates for escrow actions.
 *
 * Patches the indexer cache immediately for instant UI feedback.
 * The on-chain state hook (useEscrowOnChainState) handles authoritative
 * action gating independently via RPC reads.
 *
 * @example
 * ```tsx
 * const { applyOptimisticUpdate } = useOptimisticEscrowUpdate({
 *   escrowId: escrow.id,
 * });
 *
 * // After tx receipt succeeds:
 * applyOptimisticUpdate({
 *   action: "release",
 *   context: { userAddress: "0x..." },
 * });
 * ```
 */
export function useOptimisticEscrowUpdate(
  params: UseOptimisticEscrowUpdateParams,
): UseOptimisticEscrowUpdateReturn {
  const { escrowId } = params;
  const queryClient = useQueryClient();

  /**
   * Apply the optimistic update to the indexer cache.
   */
  const applyOptimisticUpdate = useCallback(
    (payload: OptimisticUpdatePayload) => {
      const { action, context = {} } = payload;
      const queryKey = escrowQueryKey(escrowId);

      // Read current cached escrow
      const currentEscrow = queryClient.getQueryData<GqlEscrow | null>(queryKey);

      if (!currentEscrow) {
        console.warn("[OptimisticUpdate] No cached escrow found for key:", queryKey);
        // Still invalidate to trigger a fresh fetch
        queryClient.invalidateQueries({ queryKey });
        return;
      }

      // Compute the optimistic next state
      const result = applyOptimisticTransition(currentEscrow, action, context);

      if (!result.applied) {
        console.debug(
          "[OptimisticUpdate] No transition defined for action '%s' — skipping optimistic update",
          action,
        );
        // Fall back to just invalidating
        queryClient.invalidateQueries({ queryKey });
        return;
      }

      console.debug(
        "[OptimisticUpdate] Patching cache: %s → %s (action: %s)",
        currentEscrow.state,
        result.escrow.state,
        action,
      );

      // Cancel any in-flight fetches first to prevent them from overwriting
      // our optimistic data when they resolve.
      queryClient.cancelQueries({ queryKey });

      // Patch the cache immediately — UI re-renders instantly
      queryClient.setQueryData<GqlEscrow | null>(queryKey, result.escrow);

      // Also invalidate escrow list queries so dashboards update
      queryClient.invalidateQueries({
        queryKey: ["zenland", "escrows"],
      });
    },
    [escrowId, queryClient],
  );

  return {
    applyOptimisticUpdate,
  };
}
