"use client";

/**
 * EscrowAgentTimer
 *
 * Displays the agent response countdown.
 * Only visible when escrow is in AGENT_INVITED state.
 * Shows time remaining for agent to respond or timeout option.
 */

import { UserCheck, Clock, AlertTriangle } from "lucide-react";

import { Card, CardBody, Text } from "@/components/ui";
import { useEscrowDetail } from "../EscrowDetailContext";
import { formatRemainingTime } from "../hooks/useEscrowTimers";

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Format a timestamp to a readable date.
 */
function formatDeadline(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// =============================================================================
// COMPONENT
// =============================================================================

export function EscrowAgentTimer() {
  const { escrow, timers } = useEscrowDetail();
  const { agentTimer } = timers;

  // Only show in AGENT_INVITED state
  if (escrow.state !== "AGENT_INVITED") {
    return null;
  }

  // Only show if there's a timer limit
  if (!agentTimer.hasLimit) {
    return null;
  }

  const { isExpired, remainingSeconds, progressPercent, expiryTimestamp } = agentTimer;

  return (
    <Card
      variant="outlined"
      className={`${
        isExpired
          ? "bg-warning-50/10 dark:bg-warning-900/5 border-warning-200 dark:border-warning-800"
          : "bg-neutral-50/50 dark:bg-neutral-900/30"
      }`}
    >
      <CardBody className="p-5">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start gap-3">
            <div
              className={`p-2 rounded-lg ${
                isExpired
                  ? "bg-warning-100 dark:bg-warning-900/20 text-warning-600 dark:text-warning-400"
                  : "bg-neutral-100 dark:bg-neutral-800 text-[var(--text-secondary)]"
              }`}
            >
              {isExpired ? (
                <AlertTriangle size={18} />
              ) : (
                <UserCheck size={18} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <Text className="font-semibold text-sm">Agent Response</Text>
              <Text variant="muted" className="text-xs">
                Waiting for agent to resolve
              </Text>
            </div>
          </div>

          {/* Deadline Info */}
          <div className="space-y-1">
            <Text
              variant="muted"
              className="text-xs uppercase font-bold tracking-wider"
            >
              {isExpired ? "Response deadline passed" : "Response deadline"}
            </Text>
            <Text className="font-semibold text-sm">
              {formatDeadline(expiryTimestamp)}
            </Text>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  isExpired ? "bg-warning-500" : "bg-neutral-400"
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Remaining Time */}
            <div className="flex items-center gap-1.5">
              <Clock
                size={12}
                className={`${
                  isExpired
                    ? "text-warning-500"
                    : "text-[var(--text-tertiary)]"
                }`}
              />
              <Text
                variant="muted"
                className={`text-xs ${
                  isExpired
                    ? "text-warning-600 dark:text-warning-400 font-medium"
                    : ""
                }`}
              >
                {isExpired
                  ? "Agent did not respond in time"
                  : formatRemainingTime(remainingSeconds)}
              </Text>
            </div>
          </div>

          {/* Contextual Message */}
          {isExpired && (
            <div className="pt-2 border-t border-[var(--border-secondary)]">
              <Text
                variant="muted"
                className="text-xs text-warning-600 dark:text-warning-400"
              >
                You can claim the agent timeout to return to disputed state.
              </Text>
            </div>
          )}

          {!isExpired && (
            <div className="pt-2 border-t border-[var(--border-secondary)]">
              <Text variant="muted" className="text-xs">
                The agent must resolve the dispute before the deadline.
              </Text>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
