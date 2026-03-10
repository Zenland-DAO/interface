"use client";

/**
 * SellerActions
 *
 * Action buttons available to the seller:
 * - Confirm fulfillment (FUNDED state)
 * - Claim funds after protection (FULFILLED + protection expired)
 * - Issue refund (any non-terminal state)
 */

import { Check, Send, RefreshCw, Loader2, Wallet } from "lucide-react";

import { useTranslations } from "next-intl";
import { Button, Text } from "@/components/ui";
import { useEscrowDetail } from "../EscrowDetailContext";
import { useWalletAction } from "@/hooks/wallet/useWalletAction";

// =============================================================================
// TYPES
// =============================================================================

export interface SellerActionsProps {
  /** Open confirmation modal */
  onOpenModal: (type: "release" | "refund") => void;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function SellerActions({ onOpenModal }: SellerActionsProps) {
  const t = useTranslations("escrows");
  const { actions, write, role } = useEscrowDetail();
  const { availableActions } = actions;
  const { isPending, pendingAction, confirmFulfillment } = write;
  const { requireWallet, isConnected } = useWalletAction();

  // Only render for sellers
  if (!role.isSeller) {
    return null;
  }

  const canConfirm = availableActions.confirmFulfillment;
  const canClaimRelease = availableActions.releaseAfterProtection;
  const canRefund = availableActions.sellerRefund;

  // Don't render if no seller actions available
  if (!canConfirm && !canClaimRelease && !canRefund) {
    return null;
  }

  const handleConfirmFulfillment = async () => {
    await confirmFulfillment();
  };

  return (
    <div className="space-y-3">
      {/* Confirm Fulfillment */}
      {canConfirm && (
        <div className="space-y-1.5">
          <Button
            variant="primary"
            className="w-full"
            onClick={() => requireWallet(handleConfirmFulfillment)}
            disabled={isPending}
          >
            {isPending && pendingAction === "confirmFulfillment" ? (
              <>
                <Loader2 size={16} className="animate-spin mr-2" />
                {t("actionProgress.confirming")}
              </>
            ) : isConnected ? (
              <>
                <Check size={16} className="mr-2" />
                {t("actions.confirmFulfillment")}
              </>
            ) : (
              <>
                <Wallet size={16} className="mr-2" />
                {t("actions.connectWallet")}
              </>
            )}
          </Button>
          <Text variant="muted" className="text-xs text-center">
            {t("actionDescriptions.confirmFulfillment")}
          </Text>
        </div>
      )}

      {/* Claim Release (after protection) */}
      {canClaimRelease && (
        <div className="space-y-1.5">
          <Button
            variant="primary"
            className="w-full"
            onClick={() => requireWallet(() => onOpenModal("release"))}
            disabled={isPending}
          >
            {isPending && (pendingAction === "releaseAfterProtection" || pendingAction === "release") ? (
              <>
                <Loader2 size={16} className="animate-spin mr-2" />
                {t("actionProgress.claiming")}
              </>
            ) : isConnected ? (
              <>
                <Send size={16} className="mr-2" />
                {t("actions.releaseAfterProtection")}
              </>
            ) : (
              <>
                <Wallet size={16} className="mr-2" />
                {t("actions.connectWallet")}
              </>
            )}
          </Button>
          <Text variant="muted" className="text-xs text-center">
            {t("actionDescriptions.releaseAfterProtection")}
          </Text>
        </div>
      )}

      {/* Issue Refund */}
      {canRefund && (
        <div className="space-y-1.5">
          <Button
            variant="ghost"
            className="w-full text-error-500 hover:bg-error-50 dark:hover:bg-error-900/10"
            onClick={() => requireWallet(() => onOpenModal("refund"))}
            disabled={isPending}
          >
            {isPending && pendingAction === "sellerRefund" ? (
              <>
                <Loader2 size={16} className="animate-spin mr-2" />
                {t("actionProgress.processing")}
              </>
            ) : isConnected ? (
              <>
                <RefreshCw size={16} className="mr-2" />
                {t("actions.sellerRefund")}
              </>
            ) : (
              <>
                <Wallet size={16} className="mr-2" />
                {t("actions.connectWallet")}
              </>
            )}
          </Button>
          <Text variant="muted" className="text-xs text-center">
            {t("actionDescriptions.sellerRefund")}
          </Text>
        </div>
      )}
    </div>
  );
}
