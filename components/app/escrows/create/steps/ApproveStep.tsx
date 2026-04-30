"use client";

/**
 * ApproveStep Component
 *
 * Third step of the escrow creation wizard.
 * Handles token approval for the factory contract.
 * Auto-advances to ConfirmStep when approval is complete.
 */

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import {
  Card,
  CardBody,
  // CardHeader,
  CardFooter,
  Button,
  Text,
} from "@/components/ui";
import {
  ArrowLeft,
  Loader2,
  RefreshCw,
} from "lucide-react";

import { TokenApprovalAction } from "@/components/wallet";

import type { UseEscrowFormReturn } from "../useEscrowForm";

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface ApprovalProgressProps {
  isApproving: boolean;
}

function ApprovalProgress({ isApproving, t }: ApprovalProgressProps & { t: (key: string) => string }) {
  if (!isApproving) return null;

  return (
    <Card className="border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/10">
      <CardBody className="p-4">
        <div className="flex items-center gap-3">
          <Loader2 size={20} className="text-primary-500 animate-spin" />
          <div>
            <Text className="font-medium text-primary-700 dark:text-primary-300">
              {t("create.approve.waitingForApproval")}
            </Text>
            <Text variant="muted" className="text-xs">
              {t("create.approve.confirmInWallet")}
            </Text>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export interface ApproveStepProps {
  form: UseEscrowFormReturn;
}

export function ApproveStep({ form }: ApproveStepProps) {
  const t = useTranslations("escrows");
  const {
    display,
    goBack,
    tokenApproval,
  } = form;

  const {
    isApproved,
    isApproving,
    approve,
    supportsPermit,
    hasEnoughBalance,
    balanceError,
  } = tokenApproval;

  // Track previous approval state to detect transition
  const wasApprovedRef = useRef(isApproved);

  // Show toast when approval completes
  useEffect(() => {
    if (isApproved && !wasApprovedRef.current) {
      toast.success("Token approved!", {
        description: "You can now create your escrow.",
      });
    }
    wasApprovedRef.current = isApproved;
  }, [isApproved]);

  return (
    <div className="max-w-2xl mx-auto">
      <Card variant="elevated" className="border-none shadow-2xl shadow-primary-500/5">
        {/* CardHeader removed - moved to CreateEscrowWizard */}

        <CardBody className="p-4 sm:p-8">
          {!hasEnoughBalance && balanceError && (
            <div className="mb-6 p-4 rounded-xl bg-error-50 dark:bg-error-900/10 border border-error-200 dark:border-error-800">
              {/* Stack on mobile so the long message has the full row width
                  and never gets pushed off-screen by the action button. */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <Text className="text-sm font-medium text-error-700 dark:text-error-300 break-words">
                  {balanceError}
                </Text>
                <button
                  type="button"
                  onClick={() => tokenApproval.refetchBalance()}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                    text-error-700 dark:text-error-300 hover:bg-error-100 dark:hover:bg-error-800/30
                    border border-error-300 dark:border-error-700 transition-colors shrink-0 self-end sm:self-auto"
                >
                  <RefreshCw size={12} />
                  {t("create.form.checkAgain")}
                </button>
              </div>
              <Text variant="muted" className="text-xs mt-2">
                {t("create.approve.balanceAutoUpdates")}
              </Text>
            </div>
          )}

          <TokenApprovalAction
            variant="card"
            isApproved={isApproved}
            isApproving={isApproving}
            supportsPermit={supportsPermit}
            onApprove={approve}
            amountDisplay={display.totalAmount}
            tokenSymbol={display.tokenSymbol}
            disabled={!hasEnoughBalance}
          />
        </CardBody>

        {/* Footer - Only show back button if not approved */}
        {!isApproved && (
          <CardFooter className="border-t border-[var(--border-secondary)] px-4 py-4 sm:px-8 sm:py-6">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
              onClick={goBack}
              disabled={isApproving}
              leftIcon={<ArrowLeft size={18} />}
            >
              {t("create.approve.backToReview")}
            </Button>
          </CardFooter>
        )}
      </Card>

      {/* Progress indicator below card */}
      <div className="mt-4">
        <ApprovalProgress isApproving={isApproving} t={t} />
      </div>
    </div>
  );
}

export default ApproveStep;
