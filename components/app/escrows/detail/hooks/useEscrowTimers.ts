"use client";

/**
 * useEscrowTimers Hook
 *
 * Manages countdown timers for:
 * 1. Buyer protection period (after fulfillment)
 * 2. Agent response timeout (after agent invited)
 */

import { useState, useEffect, useMemo } from "react";

import { type TimerState, DEFAULT_TIMER_STATE } from "../types";
import { TIMER_UPDATE_INTERVAL_MS } from "../constants";

// =============================================================================
// TYPES
// =============================================================================

export interface UseEscrowTimersParams {
  /** State of the escrow */
  state?: string | null;
  /** Timestamp when escrow was created (unix seconds) */
  createdAt?: bigint | number | null;
  /** Seller acceptance deadline (absolute unix timestamp) */
  sellerAcceptDeadline?: bigint | number | null;
  /** Timestamp when escrow was fulfilled (unix seconds) */
  fulfilledAt?: bigint | number | null;
  /** Buyer protection duration in seconds */
  buyerProtectionTime?: bigint | number | null;
  /** Timestamp when agent was invited (unix seconds) */
  agentInvitedAt?: bigint | number | null;
  /** Agent response timeout duration in seconds (from factory config) */
  agentResponseTime?: bigint | number | null;
}

export interface UseEscrowTimersReturn {
  /** Seller acceptance timer state */
  acceptanceTimer: TimerState;
  /** Buyer protection timer state */
  protectionTimer: TimerState;
  /** Agent response timer state */
  agentTimer: TimerState;
  /** Is the protection period expired */
  isProtectionExpired: boolean;
  /** Is the agent response timeout expired */
  isAgentTimeoutExpired: boolean;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Convert bigint/number to number safely.
 */
function toNumber(value?: bigint | number | null): number {
  if (value === null || value === undefined) return 0;
  return typeof value === "bigint" ? Number(value) : value;
}

/**
 * Calculate timer state from start time and duration.
 */
function calculateTimerState(
  startTimestamp: number,
  durationSeconds: number,
  nowSeconds: number
): TimerState {
  if (!startTimestamp || !durationSeconds) {
    return DEFAULT_TIMER_STATE;
  }

  const expiryTimestamp = startTimestamp + durationSeconds;
  const remainingSeconds = expiryTimestamp - nowSeconds;
  const isExpired = remainingSeconds <= 0;

  // Calculate progress (0 = just started, 100 = expired)
  const elapsedSeconds = nowSeconds - startTimestamp;
  const progressPercent = Math.min(
    100,
    Math.max(0, (elapsedSeconds / durationSeconds) * 100)
  );

  return {
    hasLimit: true,
    totalSeconds: durationSeconds,
    remainingSeconds: Math.max(0, remainingSeconds),
    isExpired,
    expiryTimestamp,
    progressPercent,
  };
}

// =============================================================================
// HOOK
// =============================================================================

/**
 * Hook to manage escrow countdown timers.
 *
 * @example
 * ```tsx
 * const { protectionTimer, agentTimer, isProtectionExpired } = useEscrowTimers({
 *   state: escrow.state,
 *   fulfilledAt: escrow.fulfilledAt,
 *   buyerProtectionTime: escrow.buyerProtectionTime,
 *   agentInvitedAt: escrow.agentInvitedAt,
 *   agentResponseTime: factoryConfig.agentResponseTime,
 * });
 *
 * if (isProtectionExpired && role === 'seller') {
 *   // Show "Claim Funds" button
 * }
 * ```
 */
export function useEscrowTimers(params: UseEscrowTimersParams): UseEscrowTimersReturn {
  const {
    state,
    createdAt,
    sellerAcceptDeadline,
    fulfilledAt,
    buyerProtectionTime,
    agentInvitedAt,
    agentResponseTime,
  } = params;

  // Convert params to numbers
  const createdAtNum = toNumber(createdAt);
  const sellerAcceptDeadlineNum = toNumber(sellerAcceptDeadline);
  const fulfilledAtNum = toNumber(fulfilledAt);
  const protectionTimeNum = toNumber(buyerProtectionTime);
  const agentInvitedAtNum = toNumber(agentInvitedAt);
  const agentResponseTimeNum = toNumber(agentResponseTime);

  // Keep "now" in state so we don't call Date.now() during render (purity rule).
  const [nowSec, setNowSec] = useState(() => Math.floor(Date.now() / 1000));

  // Determine which timers are active based on escrow state
  const isAcceptanceTimerActive = state === "PENDING";
  const isProtectionTimerActive = state === "FULFILLED";
  const isAgentTimerActive = state === "AGENT_INVITED";

  // Set up interval for timer updates
  useEffect(() => {
    // Only run interval if at least one timer is active
    if (
      !isAcceptanceTimerActive &&
      !isProtectionTimerActive &&
      !isAgentTimerActive
    ) {
      return;
    }

    const interval = setInterval(() => {
      setNowSec(Math.floor(Date.now() / 1000));
    }, TIMER_UPDATE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [isAcceptanceTimerActive, isProtectionTimerActive, isAgentTimerActive]);

  // Calculate acceptance timer using the deadline directly
  const acceptanceTimer = useMemo<TimerState>(() => {
    // sellerAcceptDeadline of 0 means no acceptance deadline (instant activation)
    if (!isAcceptanceTimerActive || !createdAtNum || !sellerAcceptDeadlineNum) {
      return DEFAULT_TIMER_STATE;
    }

    const totalSeconds = sellerAcceptDeadlineNum - createdAtNum;
    const remainingSeconds = sellerAcceptDeadlineNum - nowSec;
    const isExpired = remainingSeconds <= 0;
    const elapsedSeconds = nowSec - createdAtNum;
    const progressPercent = totalSeconds > 0
      ? Math.min(100, Math.max(0, (elapsedSeconds / totalSeconds) * 100))
      : 100;

    return {
      hasLimit: true,
      totalSeconds,
      remainingSeconds: Math.max(0, remainingSeconds),
      isExpired,
      expiryTimestamp: sellerAcceptDeadlineNum,
      progressPercent,
    };
  }, [isAcceptanceTimerActive, createdAtNum, sellerAcceptDeadlineNum, nowSec]);

  // Calculate protection timer
  const protectionTimer = useMemo<TimerState>(() => {
    if (!isProtectionTimerActive || !fulfilledAtNum || !protectionTimeNum) {
      return DEFAULT_TIMER_STATE;
    }
    return calculateTimerState(fulfilledAtNum, protectionTimeNum, nowSec);
  }, [isProtectionTimerActive, fulfilledAtNum, protectionTimeNum, nowSec]);

  // Calculate agent timer
  const agentTimer = useMemo<TimerState>(() => {
    if (!isAgentTimerActive || !agentInvitedAtNum || !agentResponseTimeNum) {
      return DEFAULT_TIMER_STATE;
    }
    return calculateTimerState(agentInvitedAtNum, agentResponseTimeNum, nowSec);
  }, [isAgentTimerActive, agentInvitedAtNum, agentResponseTimeNum, nowSec]);

  return {
    acceptanceTimer,
    protectionTimer,
    agentTimer,
    isProtectionExpired: protectionTimer.isExpired,
    isAgentTimeoutExpired: agentTimer.isExpired,
  };
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Format remaining seconds as a human-readable string.
 */
export function formatRemainingTime(seconds: number): string {
  if (seconds <= 0) return "Expired";

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (days > 0) {
    return `${days}d ${hours}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

/**
 * Format expiry timestamp as a date string.
 */
export function formatExpiryDate(timestamp: number): string {
  if (!timestamp) return "N/A";
  return new Date(timestamp * 1000).toLocaleString();
}
