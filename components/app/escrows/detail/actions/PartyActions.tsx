"use client";

/**
 * PartyActions
 *
 * Actions available to both buyer and seller:
 * - Invite agent (DISPUTED state, when agent is assigned)
 * - Claim agent timeout (AGENT_INVITED state, when timeout expired)
 */

import { UserPlus, Clock, Loader2, Wallet } from "lucide-react";

import { Button, Text } from "@/components/ui";
import { useEscrowDetail } from "../EscrowDetailContext";
import { ACTION_DESCRIPTIONS } from "../constants";
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
                Inviting...
              </>
            ) : isConnected ? (
              <>
                <UserPlus size={16} className="mr-2" />
                Invite Agent
              </>
            ) : (
              <>
                <Wallet size={16} className="mr-2" />
                Connect Wallet
              </>
            )}
          </Button>
          <Text variant="muted" className="text-xs text-center">
            {ACTION_DESCRIPTIONS.inviteAgent}
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
                Claiming...
              </>
            ) : isConnected ? (
              <>
                <Clock size={16} className="mr-2" />
                Claim Agent Timeout
              </>
            ) : (
              <>
                <Wallet size={16} className="mr-2" />
                Connect Wallet
              </>
            )}
          </Button>
          <Text variant="muted" className="text-xs text-center">
            {ACTION_DESCRIPTIONS.claimAgentTimeout}
          </Text>
        </div>
      )}
    </div>
  );
}
