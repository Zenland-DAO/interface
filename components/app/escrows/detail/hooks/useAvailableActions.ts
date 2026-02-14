"use client";

/**
 * useAvailableActions Hook
 *
 * Calculates which actions are available to the current user based on:
 * - Their role (buyer, seller, agent, viewer)
 * - The escrow state
 * - Timer conditions (protection expired, agent timeout)
 * - Split proposal status
 */

import { useMemo } from "react";
import { type Address, zeroAddress } from "viem";

import {
  type EscrowState,
  type EscrowRole,
  type AvailableActions,
  type SplitProposal,
  DEFAULT_AVAILABLE_ACTIONS,
  isTerminalState,
} from "../types";

// =============================================================================
// TYPES
// =============================================================================

export interface UseAvailableActionsParams {
  /** Current escrow state */
  state?: EscrowState | null;
  /** User's role in the escrow */
  role: EscrowRole;
  /** Whether seller acceptance timeout has expired (for buyer cancel) */
  isAcceptanceTimeoutExpired: boolean;
  /** Whether protection period has expired (for seller release) */
  isProtectionExpired: boolean;
  /** Whether agent response timeout has expired */
  isAgentTimeoutExpired: boolean;
  /** Agent address (null/zeroAddress means no agent) */
  agent?: Address | null;
  /** Current split proposal (if any) */
  splitProposal?: SplitProposal | null;
  /** Connected user address */
  userAddress?: Address;
  /** Buyer address */
  buyer?: Address;
  /** Seller address */
  seller?: Address;
}

export interface UseAvailableActionsReturn {
  /** Map of action availability */
  availableActions: AvailableActions;
  /** Actions available for the current user */
  userActions: string[];
  /** Whether any action is available */
  hasAnyAction: boolean;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Compare two addresses case-insensitively.
 */
function addressesEqual(a?: Address | null, b?: Address | null): boolean {
  if (!a || !b) return false;
  return a.toLowerCase() === b.toLowerCase();
}

/**
 * Check if there's a valid agent assigned.
 */
function hasValidAgent(agent?: Address | null): boolean {
  return !!agent && agent !== zeroAddress;
}

/**
 * Check if there's an active split proposal.
 */
function hasActiveSplitProposal(proposal?: SplitProposal | null): boolean {
  return !!proposal?.proposer;
}

// =============================================================================
// CORE PERMISSION LOGIC
// =============================================================================

/**
 * Calculate available actions based on role, state, and conditions.
 * This is the core permission matrix from the smart contract.
 */
function calculateAvailableActions(params: UseAvailableActionsParams): AvailableActions {
  const {
    state,
    role,
    isAcceptanceTimeoutExpired,
    isProtectionExpired,
    isAgentTimeoutExpired,
    agent,
    splitProposal,
    userAddress,
  } = params;

  // Default: no actions available
  const actions: AvailableActions = { ...DEFAULT_AVAILABLE_ACTIONS };

  // No actions for viewers or if no state
  if (role === "viewer" || !state) {
    return actions;
  }

  // No actions in terminal states
  if (isTerminalState(state)) {
    return actions;
  }

  const hasAgent = hasValidAgent(agent);
  const hasProposal = hasActiveSplitProposal(splitProposal);
  const isSplitProposer = hasProposal && addressesEqual(splitProposal?.proposer, userAddress);

  // ==========================================================================
  // BUYER ACTIONS
  // ==========================================================================
  if (role === "buyer") {
    // cancelExpired() - Only in PENDING state if acceptance timeout expired
    actions.cancelExpired = state === "PENDING" && isAcceptanceTimeoutExpired;

    // release() - Buyer can release anytime in non-terminal states (except PENDING)
    actions.release = ["ACTIVE", "FULFILLED", "DISPUTED", "AGENT_INVITED"].includes(state);

    // openDispute() - Only in ACTIVE or FULFILLED states
    actions.openDispute = ["ACTIVE", "FULFILLED"].includes(state);

    // inviteAgent() - Only in DISPUTED state and if agent is assigned
    actions.inviteAgent = state === "DISPUTED" && hasAgent;

    // claimAgentTimeout() - Only in AGENT_INVITED and timeout expired
    actions.claimAgentTimeout = state === "AGENT_INVITED" && isAgentTimeoutExpired;

    // proposeSplit() - Any non-terminal state (except PENDING)
    actions.proposeSplit = state !== "PENDING";

    // approveSplit() - Has proposal and not the proposer (except PENDING)
    actions.approveSplit = state !== "PENDING" && hasProposal && !isSplitProposer;

    // cancelSplit() - Is the proposer (except PENDING)
    actions.cancelSplit = state !== "PENDING" && isSplitProposer;
  }

  // ==========================================================================
  // SELLER ACTIONS
  // ==========================================================================
  if (role === "seller") {
    // PENDING state actions
    if (state === "PENDING") {
      actions.accept = true;
      actions.decline = true;
    }

    // confirmFulfillment() - Only in ACTIVE state
    actions.confirmFulfillment = state === "ACTIVE";

    // releaseAfterProtection() - Only in FULFILLED state and protection expired
    actions.releaseAfterProtection = state === "FULFILLED" && isProtectionExpired;

    // sellerRefund() - Any non-terminal state (except PENDING)
    actions.sellerRefund = state !== "PENDING";

    // inviteAgent() - Only in DISPUTED state and if agent is assigned
    actions.inviteAgent = state === "DISPUTED" && hasAgent;

    // claimAgentTimeout() - Only in AGENT_INVITED and timeout expired
    actions.claimAgentTimeout = state === "AGENT_INVITED" && isAgentTimeoutExpired;

    // proposeSplit() - Any non-terminal state (except PENDING)
    actions.proposeSplit = state !== "PENDING";

    // approveSplit() - Has proposal and not the proposer (except PENDING)
    actions.approveSplit = state !== "PENDING" && hasProposal && !isSplitProposer;

    // cancelSplit() - Is the proposer (except PENDING)
    actions.cancelSplit = state !== "PENDING" && isSplitProposer;
  }

  // ==========================================================================
  // AGENT ACTIONS
  // ==========================================================================
  if (role === "agent") {
    // agentResolve() - Only in AGENT_INVITED state
    actions.agentResolve = state === "AGENT_INVITED";
  }

  return actions;
}

// =============================================================================
// HOOK
// =============================================================================

/**
 * Hook to calculate available actions for the current user.
 *
 * @example
 * ```tsx
 * const { availableActions, userActions, hasAnyAction } = useAvailableActions({
 *   state: escrow.state,
 *   role,
 *   isProtectionExpired,
 *   isAgentTimeoutExpired,
 *   agent: escrow.agent,
 *   splitProposal,
 *   userAddress,
 *   buyer: escrow.buyer,
 *   seller: escrow.seller,
 * });
 *
 * if (availableActions.release) {
 *   // Show release button
 * }
 * ```
 */
export function useAvailableActions(
  params: UseAvailableActionsParams
): UseAvailableActionsReturn {
  const {
    state,
    role,
    isAcceptanceTimeoutExpired,
    isProtectionExpired,
    isAgentTimeoutExpired,
    agent,
    splitProposal,
    userAddress,
    buyer,
    seller,
  } = params;

  const availableActions = useMemo(() => {
    return calculateAvailableActions({
      state,
      role,
      isAcceptanceTimeoutExpired,
      isProtectionExpired,
      isAgentTimeoutExpired,
      agent,
      splitProposal,
      userAddress,
      buyer,
      seller,
    });
  }, [
    state,
    role,
    isAcceptanceTimeoutExpired,
    isProtectionExpired,
    isAgentTimeoutExpired,
    agent,
    splitProposal,
    userAddress,
    buyer,
    seller,
  ]);

  // Get list of available actions for convenience
  const userActions = useMemo(() => {
    return Object.entries(availableActions)
      .filter(([, available]) => available)
      .map(([action]) => action);
  }, [availableActions]);

  const hasAnyAction = userActions.length > 0;

  return {
    availableActions,
    userActions,
    hasAnyAction,
  };
}

// =============================================================================
// UTILITY EXPORTS
// =============================================================================

export { calculateAvailableActions };
