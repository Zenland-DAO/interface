"use client";

/**
 * EscrowProtection
 *
 * Displays the buyer protection period countdown.
 * Shows a progress bar and remaining time when applicable.
 * Only visible when escrow has protection and is in a relevant state.
 */

import { Shield, Clock, CheckCircle } from "lucide-react";

import { useTranslations } from "next-intl";
import { Card, CardBody, Text } from "@/components/ui";
import { useEscrowDetail } from "../EscrowDetailContext";
import { formatRemainingTime } from "../hooks/useEscrowTimers";

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Format a timestamp to a readable date.
 */
function formatExpiryDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format total duration to readable text.
 */
function formatDuration(seconds: number): string {
  if (seconds <= 0) return "No protection";

  const days = Math.floor(seconds / 86400);
  if (days > 0) return `${days} day${days > 1 ? "s" : ""}`;

  const hours = Math.floor(seconds / 3600);
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""}`;

  const minutes = Math.floor(seconds / 60);
  return `${minutes} minute${minutes > 1 ? "s" : ""}`;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function EscrowProtection() {
  const t = useTranslations("escrows.detail.protection");
  const { escrow, timers } = useEscrowDetail();
  // `useEscrowTimers` exposes `protectionTimer`; keep a local alias for readability.
  const { protectionTimer: protection } = timers;

  // Don't show if no protection period
  if (!protection.hasLimit) {
    return null;
  }

  // Don't show in certain states
  const hiddenStates = ["PENDING", "ACTIVE", "RELEASED", "REFUNDED", "SPLIT", "AGENT_RESOLVED"];
  if (hiddenStates.includes(escrow.state)) {
    return null;
  }

  const { isExpired, remainingSeconds, progressPercent, expiryTimestamp, totalSeconds } =
    protection;

  return (
    <Card variant="outlined" className="bg-primary-50/5 dark:bg-primary-900/5">
      <CardBody className="p-5">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start gap-3">
            <div
              className={`p-2 rounded-lg ${isExpired
                  ? "bg-success-100 dark:bg-success-900/20 text-success-600 dark:text-success-400"
                  : "bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                }`}
            >
              {isExpired ? <CheckCircle size={18} /> : <Shield size={18} />}
            </div>
            <div className="flex-1 min-w-0">
              <Text className="font-semibold text-sm">{t("buyerProtection")}</Text>
              <Text variant="muted" className="text-xs">
                {t("duration", { duration: formatDuration(totalSeconds) })}
              </Text>
            </div>
          </div>

          {/* Expiry Info */}
          <div className="space-y-1">
            <Text
              variant="muted"
              className="text-xs uppercase font-bold tracking-wider"
            >
              {isExpired ? t("expiredOn") : t("endsOn")}
            </Text>
            <Text className="font-semibold text-sm">
              {formatExpiryDate(expiryTimestamp)}
            </Text>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${isExpired
                    ? "bg-success-500"
                    : "bg-primary-500"
                  }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Remaining Time */}
            <div className="flex items-center gap-1.5">
              <Clock
                size={12}
                className={`${isExpired
                    ? "text-success-500"
                    : "text-[var(--text-tertiary)]"
                  }`}
              />
              <Text
                variant="muted"
                className={`text-xs ${isExpired ? "text-success-600 dark:text-success-400 font-medium" : ""
                  }`}
              >
                {isExpired
                  ? t("protectionEnded")
                  : formatRemainingTime(remainingSeconds)}
              </Text>
            </div>
          </div>

          {/* Contextual Message */}
          {escrow.state === "FULFILLED" && !isExpired && (
            <div className="pt-2 border-t border-[var(--border-secondary)]">
              <Text variant="muted" className="text-xs">
                {t("sellerCanClaimAfter")}
              </Text>
            </div>
          )}

          {escrow.state === "FULFILLED" && isExpired && (
            <div className="pt-2 border-t border-[var(--border-secondary)]">
              <Text
                variant="muted"
                className="text-xs text-success-600 dark:text-success-400"
              >
                {t("sellerCanClaim")}
              </Text>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
