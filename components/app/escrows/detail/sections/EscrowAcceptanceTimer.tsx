"use client";

/**
 * EscrowAcceptanceTimer
 *
 * Displays the seller acceptance countdown.
 * Only visible when escrow is in PENDING state.
 * Shows time remaining for seller to accept or buyer to cancel.
 */

import { Clock, AlertTriangle } from "lucide-react";

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

export function EscrowAcceptanceTimer() {
    const { escrow, timers, role } = useEscrowDetail();
    const { acceptanceTimer } = timers;

    // Only show in PENDING state
    if (escrow.state !== "PENDING") {
        return null;
    }

    // Only show if there's a timer limit
    if (!acceptanceTimer.hasLimit) {
        return null;
    }

    const { isExpired, remainingSeconds, progressPercent, expiryTimestamp } =
        acceptanceTimer;

    // Determine user-specific message
    const isSeller = role.role === "seller";
    const isBuyer = role.role === "buyer";

    // Determine status color and icon
    const isWarning = isExpired || (remainingSeconds < 3600 && !isExpired); // Warn if expired or < 1 hour

    return (
        <Card
            variant="outlined"
            className={`${isWarning
                    ? "bg-warning-50/10 dark:bg-warning-900/5 border-warning-200 dark:border-warning-800"
                    : "bg-primary-50/10 dark:bg-primary-900/5 border-primary-200 dark:border-primary-800" // Use primary color for normal pending state
                }`}
        >
            <CardBody className="p-5">
                <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start gap-3">
                        <div
                            className={`p-2 rounded-lg ${isWarning
                                    ? "bg-warning-100 dark:bg-warning-900/20 text-warning-600 dark:text-warning-400"
                                    : "bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                                }`}
                        >
                            {isWarning ? <AlertTriangle size={18} /> : <Clock size={18} />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <Text className="font-semibold text-sm">
                                Seller Acceptance Window
                            </Text>
                            <Text variant="muted" className="text-xs">
                                {isExpired
                                    ? "Acceptance window has expired"
                                    : "Waiting for seller to accept the escrow"}
                            </Text>
                        </div>
                    </div>

                    {/* Deadline Info */}
                    <div className="space-y-1">
                        <Text
                            variant="muted"
                            className="text-xs uppercase font-bold tracking-wider"
                        >
                            {isExpired ? "Deadline passed" : "Accept by"}
                        </Text>
                        <Text className="font-semibold text-sm">
                            {formatDeadline(expiryTimestamp)}
                        </Text>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                        <div className="h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-1000 ${isExpired
                                        ? "bg-warning-500"
                                        : isWarning
                                            ? "bg-warning-400"
                                            : "bg-primary-500"
                                    }`}
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>

                        {/* Remaining Time */}
                        <div className="flex items-center gap-1.5">
                            <Clock
                                size={12}
                                className={`${isExpired ? "text-warning-500" : "text-[var(--text-tertiary)]"
                                    }`}
                            />
                            <Text
                                variant="muted"
                                className={`text-xs ${isExpired
                                        ? "text-warning-600 dark:text-warning-400 font-medium"
                                        : ""
                                    }`}
                            >
                                {isExpired
                                    ? "Time limit reached"
                                    : formatRemainingTime(remainingSeconds)}
                            </Text>
                        </div>
                    </div>

                    {/* Contextual Message */}
                    {isExpired && isBuyer && (
                        <div className="pt-2 border-t border-[var(--border-secondary)]">
                            <Text
                                variant="muted"
                                className="text-xs text-warning-600 dark:text-warning-400"
                            >
                                Seller did not accept in time. You can cancel and get a full
                                refund.
                            </Text>
                        </div>
                    )}

                    {isSeller && !isExpired && (
                        <div className="pt-2 border-t border-[var(--border-secondary)]">
                            <Text variant="muted" className="text-xs">
                                Please review and accept the escrow terms before the deadline.
                            </Text>
                        </div>
                    )}
                </div>
            </CardBody>
        </Card>
    );
}
