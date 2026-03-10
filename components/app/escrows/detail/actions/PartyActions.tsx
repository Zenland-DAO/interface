"use client";

/**
 * PartyActions
 *
 * Actions available to both buyer and seller:
 * - Invite agent (DISPUTED state, when agent is assigned)
 * - Claim agent timeout (AGENT_INVITED state, when timeout expired)
 */

import { UserPlus, Clock, Loader2, Wallet } from "lucide-react";

import { useTranslations } from "next-intl";
import { Button, Text } from "@/components/ui";
import { useEscrowDetail } from "../EscrowDetailContext";
import { useWalletAction } from "@/hooks/wallet/useWalletAction";

// =============================================================================
// TYPES
// =============================================================================

export interface PartyActionsProps {
  /** Open confirmation modal */
  onOpenModal: (type: "inviteAgent" | "claimTimeout") => void;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function PartyActions({ onOpenModal }: PartyActionsProps) {
  const t = useTranslations("escrows");
  const { actions, write, role } = useEscrowDetail();
  const { availableActions } = actions;
  const { isPending, pendingAction } = write;
  const { requireWallet, isConnected } = useWalletAction();

  // Only render for parties (buyer or seller)
  if (!role.isBuyer && !role.isSeller) {
    return null;
  }

  const canInviteAgent = availableActions.inviteAgent;
  const canClaimTimeout = availableActions.claimAgentTimeout;

  // Don't render if no party actions available
  if (!canInviteAgent && !canClaimTimeout) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Invite Agent */}
      {canInviteAgent && (
        <div className="space-y-1.5">
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => requireWallet(() => onOpenModal("inviteAgent"))}
            disabled={isPending}
          >
            {isPending && pendingAction === "inviteAgent" ? (
              <>
                <Loader2 size={16} className="animate-spin mr-2" />
                {t("actionProgress.inviting")}
              </>
            ) : isConnected ? (
              <>
                <UserPlus size={16} className="mr-2" />
                {t("actions.inviteAgent")}
              </>
            ) : (
              <>
                <Wallet size={16} className="mr-2" />
                {t("actions.connectWallet")}
              </>
            )}
          </Button>
          <Text variant="muted" className="text-xs text-center">
            {t("actionDescriptions.inviteAgent")}
          </Text>
        </div>
      )}

      {/* Claim Agent Timeout */}
      {canClaimTimeout && (
        <div className="space-y-1.5">
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => requireWallet(() => onOpenModal("claimTimeout"))}
            disabled={isPending}
          >
            {isPending && pendingAction === "claimAgentTimeout" ? (
              <>
                <Loader2 size={16} className="animate-spin mr-2" />
                {t("actionProgress.claiming")}
              </>
            ) : isConnected ? (
              <>
                <Clock size={16} className="mr-2" />
                {t("actions.claimAgentTimeout")}
              </>
            ) : (
              <>
                <Wallet size={16} className="mr-2" />
                {t("actions.connectWallet")}
              </>
            )}
          </Button>
          <Text variant="muted" className="text-xs text-center">
            {t("actionDescriptions.claimAgentTimeout")}
          </Text>
        </div>
      )}
    </div>
  );
}
