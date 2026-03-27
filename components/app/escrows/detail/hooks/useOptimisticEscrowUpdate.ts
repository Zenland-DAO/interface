"use client";

/**
 * useOptimisticEscrowUpdate Hook
 *
 * Provides instant UI updates after successful on-chain transactions
 * by patching the TanStack Query cache optimistically, then reconciling
 * with the indexer via aggressive short-lived polling.
 *
 * Pattern: Optimistic Update → Aggressive Polling → Settle
 *
 * 1. On tx success: immediately patch the cached GqlEscrow in TanStack Query
 * 2. Start polling the indexer every POLL_INTERVAL_MS for up to MAX_POLL_DURATION_MS
 * 3. Stop polling once the indexer returns data matching the optimistic state
 */

import { useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

import type { GqlEscrow } from "@zenland/sdk/react";
import type { EscrowAction } from "../types";
import {
  applyOptimisticTransition,
  type OptimisticTransitionContext,
} from "./optimistic-updates";

// =============================================================================
// CONSTANTS
// =============================================================================

/** Polling interval for indexer reconciliation (ms). */
const POLL_INTERVAL_MS = 3_000;

/** Maximum duration to poll before giving up (ms). */
const MAX_POLL_DURATION_MS = 30_000;

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
   * Apply an optimistic update to the escrow cache and start reconciliation polling.
   * Call this immediately after a transaction receipt confirms success.
   */
  applyOptimisticUpdate: (payload: OptimisticUpdatePayload) => void;

  /** Whether reconciliation polling is currently active. */
  isReconciling: boolean;
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

  // Track active polling timer so we can cancel on unmount or re-entry.
  const pollingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollingStartRef = useRef<number>(0);
  const isReconcilingRef = useRef(false);

  /**
   * Stop any active reconciliation polling.
   */
  const stopPolling = useCallback(() => {
    if (pollingTimerRef.current) {
      clearInterval(pollingTimerRef.current);
      pollingTimerRef.current = null;
    }
    isReconcilingRef.current = false;
  }, []);

  /**
   * Start reconciliation polling.
   * Repeatedly invalidates the query until the indexer catches up
   * or we exceed MAX_POLL_DURATION_MS.
   */
  const startReconciliationPolling = useCallback(
    (expectedState: string) => {
      // Stop any existing polling first
      stopPolling();

      isReconcilingRef.current = true;
      pollingStartRef.current = Date.now();

      const queryKey = escrowQueryKey(escrowId);

      pollingTimerRef.current = setInterval(async () => {
        const elapsed = Date.now() - pollingStartRef.current;

        // Timeout — stop polling, the indexer will catch up eventually
        if (elapsed >= MAX_POLL_DURATION_MS) {
          console.debug(
            "[OptimisticUpdate] Reconciliation polling timed out after %dms",
            MAX_POLL_DURATION_MS,
          );
          stopPolling();
          return;
        }

        // Invalidate + refetch from the indexer
        await queryClient.invalidateQueries({ queryKey });

        // Check if the indexer has caught up
        const cached = queryClient.getQueryData<GqlEscrow | null>(queryKey);
        if (cached && cached.state === expectedState) {
          console.debug(
            "[OptimisticUpdate] Indexer reconciled — state matches '%s'",
            expectedState,
          );
          stopPolling();
        }
      }, POLL_INTERVAL_MS);
    },
    [escrowId, queryClient, stopPolling],
  );

  /**
   * Apply the optimistic update and kick off reconciliation.
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

      // Patch the cache immediately — UI re-renders instantly
      queryClient.setQueryData<GqlEscrow | null>(queryKey, result.escrow);

      // Also invalidate escrow list queries so dashboards update
      queryClient.invalidateQueries({
        queryKey: ["zenland", "escrows"],
      });

      // Start background polling to reconcile with the indexer's canonical data
      startReconciliationPolling(result.escrow.state);
    },
    [escrowId, queryClient, startReconciliationPolling],
  );

  return {
    applyOptimisticUpdate,
    isReconciling: isReconcilingRef.current,
  };
}
