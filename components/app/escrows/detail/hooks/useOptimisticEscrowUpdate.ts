"use client";

/**
 * useOptimisticEscrowUpdate Hook
 *
 * Provides instant UI updates after successful on-chain transactions
 * by patching the TanStack Query cache optimistically, then reconciling
 * with the indexer via controlled polling.
 *
 * Pattern: Cancel → Optimistic Set → Controlled Poll → Settle
 *
 * 1. On tx success: cancel in-flight fetches, patch cache with expected state
 * 2. Poll the indexer every POLL_INTERVAL_MS using fetchQuery (controlled)
 * 3. If indexer hasn't caught up yet, restore optimistic data (no visual flash)
 * 4. Stop once the indexer returns data matching the optimistic state (or timeout)
 *
 * Key insight: we never use `invalidateQueries` during reconciliation because it
 * triggers uncontrolled background refetches that overwrite the optimistic cache
 * with stale indexer data before we can check or prevent it.
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

  // Stores the optimistic escrow data during reconciliation so we can
  // restore it if a fetch returns stale indexer data.
  const optimisticEscrowRef = useRef<GqlEscrow | null>(null);

  /**
   * Stop any active reconciliation polling and clear optimistic state.
   */
  const stopPolling = useCallback(() => {
    if (pollingTimerRef.current) {
      clearInterval(pollingTimerRef.current);
      pollingTimerRef.current = null;
    }
    isReconcilingRef.current = false;
    optimisticEscrowRef.current = null;
  }, []);

  /**
   * Start reconciliation polling.
   *
   * Uses a controlled fetch-then-compare pattern:
   * - Each tick: cancel in-flight queries → fetchQuery → compare
   * - If indexer caught up: stop (cache already has canonical data)
   * - If indexer stale: immediately restore optimistic data to cache
   *
   * This avoids the bug where `invalidateQueries` triggers an uncontrolled
   * background refetch that overwrites the cache with stale data.
   */
  const startReconciliationPolling = useCallback(
    (expectedState: string, optimisticEscrow: GqlEscrow) => {
      // Stop any existing polling first
      stopPolling();

      isReconcilingRef.current = true;
      pollingStartRef.current = Date.now();
      optimisticEscrowRef.current = optimisticEscrow;

      const queryKey = escrowQueryKey(escrowId);

      pollingTimerRef.current = setInterval(async () => {
        const elapsed = Date.now() - pollingStartRef.current;

        // Timeout — stop polling, do a final invalidation so the UI
        // settles on whatever the indexer currently has.
        if (elapsed >= MAX_POLL_DURATION_MS) {
          console.debug(
            "[OptimisticUpdate] Reconciliation polling timed out after %dms",
            MAX_POLL_DURATION_MS,
          );
          stopPolling();
          queryClient.invalidateQueries({ queryKey });
          return;
        }

        try {
          // Cancel any in-flight fetches (e.g., from window focus refetch)
          // to prevent them from clobbering the cache while we're working.
          await queryClient.cancelQueries({ queryKey });

          // Controlled fetch: fetchQuery returns the data AND updates the cache,
          // but crucially it's synchronous from our perspective — we get the result
          // in the same tick and can immediately restore if needed.
          const freshData = await queryClient.fetchQuery<GqlEscrow | null>({
            queryKey,
            staleTime: 0, // Always fetch fresh from the indexer
          });

          if (freshData && freshData.state === expectedState) {
            // Indexer has caught up — cache already holds canonical data from fetchQuery.
            console.debug(
              "[OptimisticUpdate] Indexer reconciled — state matches '%s'",
              expectedState,
            );
            stopPolling();
          } else {
            // Indexer hasn't caught up — restore optimistic data to cache.
            // React 18 batches these updates, so there's no visual flash.
            console.debug(
              "[OptimisticUpdate] Indexer still stale (got '%s', want '%s') — restoring optimistic data",
              freshData?.state ?? "null",
              expectedState,
            );
            if (optimisticEscrowRef.current) {
              queryClient.setQueryData<GqlEscrow | null>(queryKey, optimisticEscrowRef.current);
            }
          }
        } catch (err) {
          // On fetch error, keep the optimistic data in cache
          console.debug("[OptimisticUpdate] Fetch error during reconciliation:", err);
          if (optimisticEscrowRef.current) {
            queryClient.setQueryData<GqlEscrow | null>(queryKey, optimisticEscrowRef.current);
          }
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

      // Cancel any in-flight fetches first to prevent them from overwriting
      // our optimistic data when they resolve.
      queryClient.cancelQueries({ queryKey });

      // Patch the cache immediately — UI re-renders instantly
      queryClient.setQueryData<GqlEscrow | null>(queryKey, result.escrow);

      // Also invalidate escrow list queries so dashboards update
      queryClient.invalidateQueries({
        queryKey: ["zenland", "escrows"],
      });

      // Start background polling to reconcile with the indexer's canonical data
      startReconciliationPolling(result.escrow.state, result.escrow);
    },
    [escrowId, queryClient, startReconciliationPolling],
  );

  return {
    applyOptimisticUpdate,
    isReconciling: isReconcilingRef.current,
  };
}
