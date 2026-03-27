/**
 * Optimistic Updates — Pure State Transition Logic
 *
 * Maps each escrow action to its deterministic state transition.
 * After a transaction is mined on-chain, we know exactly what the new
 * escrow state should be — no need to wait for the indexer.
 *
 * This module is pure (no React, no side effects) for easy testing.
 */

import type { GqlEscrow } from "@zenland/sdk/react";
import type { EscrowAction } from "../types";

// =============================================================================
// TYPES
// =============================================================================

/**
 * Additional context needed for certain transitions (e.g., split proposals).
 */
export interface OptimisticTransitionContext {
  /** Buyer basis points for split/resolve actions */
  buyerBps?: number;
  /** Seller basis points for split/resolve actions */
  sellerBps?: number;
  /** Address of the user performing the action */
  userAddress?: string;
  /** Buyer address (to determine split approval logic) */
  buyer?: string;
  /** Seller address (to determine split approval logic) */
  seller?: string;
}

/**
 * Result of applying an optimistic transition.
 */
export interface OptimisticTransitionResult {
  /** The patched escrow data */
  escrow: GqlEscrow;
  /** Whether the transition was applied (false if action has no known mapping) */
  applied: boolean;
}

// =============================================================================
// STATE TRANSITION MAP
// =============================================================================

/**
 * Actions that transition the escrow to a specific new state.
 * Excludes actions that don't change state (proposeSplit) or have conditional outcomes (approveSplit).
 */
const SIMPLE_STATE_TRANSITIONS: Partial<Record<EscrowAction, string>> = {
  accept: "ACTIVE",
  decline: "REFUNDED",
  cancelExpired: "REFUNDED",
  confirmFulfillment: "FULFILLED",
  release: "RELEASED",
  releaseAfterProtection: "RELEASED",
  sellerRefund: "REFUNDED",
  openDispute: "DISPUTED",
  inviteAgent: "AGENT_INVITED",
  agentResolve: "AGENT_RESOLVED",
  claimAgentTimeout: "DISPUTED",
};

// =============================================================================
// TIMESTAMP HELPERS
// =============================================================================

/** Current unix timestamp in seconds (as string, matching GqlEscrow BigIntScalar). */
function nowTimestamp(): string {
  return Math.floor(Date.now() / 1000).toString();
}

// =============================================================================
// FIELD PATCHERS (per-action extra field updates)
// =============================================================================

type FieldPatcher = (
  escrow: GqlEscrow,
  ctx: OptimisticTransitionContext,
) => Partial<GqlEscrow>;

/**
 * Per-action field patches beyond the state change.
 * Only actions that modify extra fields are listed here.
 */
const FIELD_PATCHERS: Partial<Record<EscrowAction, FieldPatcher>> = {
  accept: () => ({
    sellerAcceptedAt: nowTimestamp(),
  }),

  decline: () => ({
    sellerDeclinedAt: nowTimestamp(),
    resolvedAt: nowTimestamp(),
  }),

  cancelExpired: () => ({
    cancelledExpiredAt: nowTimestamp(),
    resolvedAt: nowTimestamp(),
  }),

  confirmFulfillment: () => ({
    fulfilledAt: nowTimestamp(),
  }),

  release: () => ({
    resolvedAt: nowTimestamp(),
  }),

  releaseAfterProtection: () => ({
    resolvedAt: nowTimestamp(),
  }),

  sellerRefund: () => ({
    resolvedAt: nowTimestamp(),
  }),

  inviteAgent: () => ({
    agentInvitedAt: nowTimestamp(),
  }),

  agentResolve: (_escrow, ctx) => ({
    resolvedAt: nowTimestamp(),
    proposedBuyerBps: ctx.buyerBps ?? null,
    proposedSellerBps: ctx.sellerBps ?? null,
  }),

  claimAgentTimeout: () => ({
    agentInvitedAt: null,
  }),

  proposeSplit: (escrow, ctx) => ({
    splitProposer: ctx.userAddress ?? escrow.splitProposer,
    proposedBuyerBps: ctx.buyerBps ?? null,
    proposedSellerBps: ctx.sellerBps ?? null,
    buyerApprovedSplit: ctx.userAddress?.toLowerCase() === ctx.buyer?.toLowerCase() ? true : false,
    sellerApprovedSplit: ctx.userAddress?.toLowerCase() === ctx.seller?.toLowerCase() ? true : false,
  }),

  cancelSplit: () => ({
    splitProposer: null,
    proposedBuyerBps: null,
    proposedSellerBps: null,
    buyerApprovedSplit: null,
    sellerApprovedSplit: null,
  }),
};

// =============================================================================
// CORE TRANSITION FUNCTION
// =============================================================================

/**
 * Apply an optimistic state transition to the escrow data.
 *
 * This is a pure function — given the current escrow, the action, and optional
 * context, it returns a new escrow object with the expected post-action state.
 *
 * @param escrow  Current escrow data from the cache
 * @param action  The action that was successfully executed on-chain
 * @param ctx     Additional context (split bps, user address, etc.)
 * @returns       The transition result with the patched escrow
 *
 * @example
 * ```ts
 * const result = applyOptimisticTransition(escrow, "release", {});
 * // result.escrow.state === "RELEASED"
 * // result.escrow.resolvedAt === "<current timestamp>"
 * // result.applied === true
 * ```
 */
export function applyOptimisticTransition(
  escrow: GqlEscrow,
  action: EscrowAction,
  ctx: OptimisticTransitionContext = {},
): OptimisticTransitionResult {
  // Handle approveSplit specially — it may or may not change state
  if (action === "approveSplit") {
    return applyApproveSplitTransition(escrow, ctx);
  }

  // Check for a simple state transition
  const newState = SIMPLE_STATE_TRANSITIONS[action];

  // proposeSplit / cancelSplit don't change state but do patch fields
  const fieldPatcher = FIELD_PATCHERS[action];

  if (!newState && !fieldPatcher) {
    return { escrow, applied: false };
  }

  const patched: GqlEscrow = {
    ...escrow,
    ...(newState ? { state: newState } : {}),
    ...(fieldPatcher ? fieldPatcher(escrow, ctx) : {}),
  };

  return { escrow: patched, applied: true };
}

// =============================================================================
// SPECIAL CASE: approveSplit
// =============================================================================

/**
 * approveSplit is conditional — if both parties approve, state becomes SPLIT.
 * Otherwise, we just update the approval flag for the acting user.
 */
function applyApproveSplitTransition(
  escrow: GqlEscrow,
  ctx: OptimisticTransitionContext,
): OptimisticTransitionResult {
  const userAddr = ctx.userAddress?.toLowerCase();
  const buyerAddr = ctx.buyer?.toLowerCase();
  const sellerAddr = ctx.seller?.toLowerCase();

  const isBuyer = userAddr === buyerAddr;
  const isSeller = userAddr === sellerAddr;

  // Update approval flags
  const buyerApproved = isBuyer ? true : (escrow.buyerApprovedSplit ?? false);
  const sellerApproved = isSeller ? true : (escrow.sellerApprovedSplit ?? false);

  // Both approved → state becomes SPLIT
  const bothApproved = buyerApproved && sellerApproved;

  const patched: GqlEscrow = {
    ...escrow,
    buyerApprovedSplit: buyerApproved,
    sellerApprovedSplit: sellerApproved,
    ...(bothApproved
      ? {
          state: "SPLIT",
          resolvedAt: nowTimestamp(),
        }
      : {}),
  };

  return { escrow: patched, applied: true };
}

// =============================================================================
// UTILITIES
// =============================================================================

/**
 * Check if an action is expected to produce a terminal state.
 * Useful for deciding whether to show "syncing" indicators.
 */
export function isTerminalAction(action: EscrowAction): boolean {
  const terminalStates = new Set(["RELEASED", "AGENT_RESOLVED", "REFUNDED", "SPLIT"]);
  const newState = SIMPLE_STATE_TRANSITIONS[action];
  return newState ? terminalStates.has(newState) : false;
}
