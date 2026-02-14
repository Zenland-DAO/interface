"use client";

/**
 * ConfirmStep Component
 *
 * Fourth step of the escrow creation wizard.
 * Final confirmation before executing the createEscrow transaction.
 * Shows a summary and the submit button.
 */

import {
  Card,
  CardBody,
  // CardHeader,
  CardFooter,
  Button,
  Text,
} from "@/components/ui";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Rocket,
  Shield,
  Wallet,
} from "lucide-react";

import Link from "next/link";

import type { UseEscrowFormReturn } from "../useEscrowForm";

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface QuickSummaryItemProps {
  label: string;
  value: string;
  highlight?: boolean;
}

function QuickSummaryItem({ label, value, highlight }: QuickSummaryItemProps) {
  return (
    <div className="flex justify-between items-center py-2">
      <Text variant="muted" className="text-sm">
        {label}
      </Text>
      <Text className={highlight ? "font-semibold" : "text-sm"}>{value}</Text>
    </div>
  );
}

interface TransactionStatusProps {
  isPending: boolean;
  error: string | null;
}

function TransactionStatus({ isPending, error }: TransactionStatusProps) {
  if (error) {
    return (
      <div className="p-5 rounded-2xl bg-error-50 dark:bg-error-900/10 border border-error-200 dark:border-error-800 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-full bg-error-100 dark:bg-error-900/30">
            <AlertTriangle size={24} className="text-error-600 dark:text-error-400" />
          </div>
          <div className="flex-1 min-w-0">
            <Text className="font-semibold text-error-800 dark:text-error-200">
              Transaction Failed
            </Text>
            <Text className="text-sm mt-1 text-error-700/80 dark:text-error-300/80 leading-relaxed">
              {error}
            </Text>
          </div>
        </div>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="p-4 rounded-xl bg-primary-50 dark:bg-primary-900/10 border border-primary-200 dark:border-primary-800">
        <div className="flex items-center gap-3">
          <Loader2 size={20} className="text-primary-500 animate-spin" />
          <div>
            <Text className="font-medium text-primary-700 dark:text-primary-300">
              Creating Escrow...
            </Text>
            <Text variant="muted" className="text-xs">
              Please confirm the transaction in your wallet
            </Text>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export interface ConfirmStepProps {
  form: UseEscrowFormReturn;
}

export function ConfirmStep({ form }: ConfirmStepProps) {
  const {
    formData,
    computed,
    display,
    handleSubmit,
    submissionStatus,
    submitError,
    tokenApproval,
  } = form;

  const isPending = submissionStatus === "submitting";

  const isBlockedByBalance = !tokenApproval.hasEnoughBalance;
  const shortSeller = formData.sellerAddress
    ? `${formData.sellerAddress.slice(0, 6)}...${formData.sellerAddress.slice(-4)}`
    : "";

  return (
    <div className="max-w-2xl mx-auto">
      <Card variant="elevated" className="border-none shadow-2xl shadow-primary-500/5">
        {/* CardHeader removed - moved to CreateEscrowWizard */}

        <CardBody className="p-4 sm:p-8 space-y-8">
          {/* Quick Summary */}
          <div className="space-y-1 pb-4 border-b border-[var(--border-secondary)]">
            <QuickSummaryItem
              label="Amount"
              value={`${display.amount} ${display.tokenSymbol}`}
              highlight
            />
            <QuickSummaryItem label="Seller" value={shortSeller} />
            <QuickSummaryItem label="Protection" value={display.protectionTime} />
            <QuickSummaryItem
              label="Total Cost"
              value={`${display.totalAmount} ${display.tokenSymbol}`}
              highlight
            />
          </div>

          {/* Agent Status */}
          {computed.hasAgent ? (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-success-50 dark:bg-success-900/10 border border-success-200 dark:border-success-800">
              <Shield size={20} className="text-success-600 dark:text-success-400" />
              <div>
                <Text className="text-sm font-medium text-success-800 dark:text-success-200">
                  Protected Escrow
                </Text>
                <Text variant="muted" className="text-xs">
                  Agent assigned for dispute resolution
                </Text>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-warning-50 dark:bg-warning-900/10 border border-warning-200 dark:border-warning-800">
              <AlertTriangle size={20} className="text-warning-600 dark:text-warning-400 mt-0.5" />
              <div>
                <Text className="text-sm font-medium text-warning-800 dark:text-warning-200">
                  Locked Escrow Warning
                </Text>
                <Text variant="muted" className="text-xs mt-1">
                  No agent assigned. Disputes cannot be resolved.
                  Funds may be permanently locked if parties disagree.
                </Text>
              </div>
            </div>
          )}

          {/* Predicted Address */}
          {display.predictedAddress && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800">
              <Wallet size={20} className="text-[var(--text-tertiary)]" />
              <div className="flex-1 min-w-0">
                <Text variant="muted" className="text-xs">
                  Escrow will be deployed at
                </Text>
                <Text className="font-mono text-xs truncate">
                  {display.predictedAddress}
                </Text>
              </div>
            </div>
          )}

          {/* Transaction Status */}
          <TransactionStatus isPending={isPending} error={submitError} />

          {!isPending && !submitError && isBlockedByBalance && tokenApproval.balanceError && (
            <div className="p-4 rounded-xl bg-error-50 dark:bg-error-900/10 border border-error-200 dark:border-error-800">
              <div className="flex items-start gap-3">
                <AlertTriangle size={20} className="text-error-500 mt-0.5" />
                <div>
                  <Text className="font-medium text-error-700 dark:text-error-300">
                    Insufficient Balance
                  </Text>
                  <Text variant="muted" className="text-xs mt-1">
                    {tokenApproval.balanceError}
                  </Text>
                </div>
              </div>
            </div>
          )}

          {/* What Happens Next */}
          {!isPending && !submitError && (
            <div className="space-y-4">
              <Text variant="muted" className="text-xs font-semibold uppercase tracking-widest text-[var(--text-tertiary)]">
                What happens next
              </Text>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 size={12} className="text-primary-500" />
                  </div>
                  <Text variant="small" className="text-sm">
                    Your escrow contract will be deployed on-chain
                  </Text>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 size={12} className="text-primary-500" />
                  </div>
                  <Text variant="small" className="text-sm">
                    Funds will be transferred from your wallet to the escrow
                  </Text>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 size={12} className="text-primary-500" />
                  </div>
                  <Text variant="small" className="text-sm">
                    The seller will be notified and can start work
                  </Text>
                </div>
              </div>
            </div>
          )}
        </CardBody>

        <CardFooter className="border-t border-[var(--border-secondary)] px-4 py-6 sm:px-8 sm:py-8">
          <Button
            variant="primary"
            size="lg"
            className="w-full h-14 text-lg shadow-lg shadow-primary-500/20"
            onClick={handleSubmit}
            disabled={isPending || isBlockedByBalance}
            isLoading={isPending}
            leftIcon={!isPending ? <Rocket size={20} /> : undefined}
          >
            {isPending ? "Creating Escrow..." : "Create Escrow"}
          </Button>
        </CardFooter>
      </Card>

      {/* Additional Info */}
      <div className="mt-4 text-center">
        <Text variant="muted" className="text-xs">
          By creating this escrow, you agree to the{" "}
          <Link href="/terms" className="text-primary-500 hover:underline">
            Terms of Service
          </Link>
        </Text>
      </div>
    </div>
  );
}

export default ConfirmStep;
