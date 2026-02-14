"use client";

import { Button, Card, CardBody, Heading, Text } from "@/components/ui";
import { Check, Coins, Info, Loader2, ShieldCheck, Zap } from "lucide-react";

export type TokenApprovalVariant = "card" | "inline";

export interface TokenApprovalActionProps {
  /** Primary label shown next to the indicator (inline variant) */
  label?: string;
  /** Amount to display (card variant) */
  amountDisplay?: string;
  /** Token symbol to display (card variant) */
  tokenSymbol?: string;
  /** If true, renders a smaller inline control */
  variant?: TokenApprovalVariant;
  /** Whether approval is done */
  isApproved: boolean;
  /** Whether an approval action is pending */
  isApproving: boolean;
  /** Whether gasless permit is supported */
  supportsPermit: boolean;
  /** Trigger the approve action */
  onApprove: () => void | Promise<unknown>;
  /** Disable approve button */
  disabled?: boolean;
  /** Optional helper text when disabled (inline variant) */
  disabledReason?: string;
}

/**
 * Shared token approval UI used across the app.
 * Keeps approval rendering consistent while letting features provide their own copy/layout.
 */
export function TokenApprovalAction({
  label = "Approval",
  amountDisplay,
  tokenSymbol,
  variant = "inline",
  isApproved,
  isApproving,
  supportsPermit,
  onApprove,
  disabled,
  disabledReason,
}: TokenApprovalActionProps) {
  if (variant === "card") {
    return (
      <div className="space-y-4">
        {isApproved ? (
          <div className="text-center py-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-success-100 dark:bg-success-900/30 flex items-center justify-center">
              <Check size={40} className="text-success-500" strokeWidth={3} />
            </div>
            <Heading level={3} className="text-success-700 dark:text-success-400 mb-2">
              Approval Complete!
            </Heading>
            <Text variant="muted">Token approval has been granted.</Text>
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-[var(--text-tertiary)]">
              <Loader2 size={16} className="animate-spin" />
              <span>Redirecting...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Amount */}
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <Coins size={32} className="text-primary-500" />
              </div>
              <Text variant="muted" className="text-sm mb-2">
                Amount to approve
              </Text>
              <div className="text-3xl font-bold text-[var(--text-primary)]">
                {amountDisplay ?? "0"} {tokenSymbol ?? ""}
              </div>
            </div>

            {/* Permit Badge */}
            {supportsPermit && (
              <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-full bg-primary-50 dark:bg-primary-900/20 w-fit mx-auto">
                <Zap size={14} className="text-primary-500" />
                <Text className="text-xs font-medium text-primary-600 dark:text-primary-400">
                  Gasless Approval Available
                </Text>
              </div>
            )}

            <div className="flex justify-center">
              <Button
                variant="primary"
                size="lg"
                onClick={onApprove}
                disabled={isApproving || disabled}
                isLoading={isApproving}
                className="px-12 h-14 text-lg"
                leftIcon={!isApproving ? <ShieldCheck size={20} /> : undefined}
              >
                {isApproving ? "Approving..." : "Approve Token Transfer"}
              </Button>
            </div>

            <Card className="border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
              <CardBody className="p-4">
                <div className="flex items-start gap-3">
                  <Info size={16} className="text-[var(--text-tertiary)] mt-0.5" />
                  <Text variant="muted" className="text-xs leading-relaxed">
                    This approval allows the Zenland escrow factory to transfer tokens on your behalf.
                  </Text>
                </div>
              </CardBody>
            </Card>
          </>
        )}
      </div>
    );
  }

  // Inline variant (used in RegistrationForm)
  return (
    <div className="py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              isApproved
                ? "bg-[var(--color-success-500)]"
                : isApproving
                  ? "bg-[var(--color-warning-500)] animate-pulse"
                  : "bg-[var(--border-secondary)]"
            }`}
          />
          <span className="text-sm text-[var(--text-secondary)]">{label}</span>
          {supportsPermit && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--color-primary-100)] dark:bg-[var(--color-primary-900)] text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)]">
              Gasless
            </span>
          )}
        </div>

        {!isApproved ? (
          <Button
            variant="outline"
            size="sm"
            onClick={onApprove}
            disabled={isApproving || disabled}
            isLoading={isApproving}
          >
            {isApproving ? "Approving..." : "Approve"}
          </Button>
        ) : (
          <span className="text-xs text-[var(--color-success-500)] font-medium">
            ✓ Approved
          </span>
        )}
      </div>

      {!isApproved && disabledReason && (
        <p className="mt-1 text-xs text-[var(--text-tertiary)]">{disabledReason}</p>
      )}
    </div>
  );
}

export default TokenApprovalAction;
