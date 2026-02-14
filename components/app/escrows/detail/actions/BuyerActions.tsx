"use client";

/**
 * BuyerActions
 *
 * Action buttons available to the buyer:
 * - Release funds (anytime in non-terminal states)
 * - Open dispute (FUNDED or FULFILLED states)
 */

import { Send, AlertTriangle, Loader2, Wallet } from "lucide-react";

import { Button, Text } from "@/components/ui";
import { useEscrowDetail } from "../EscrowDetailContext";
import { ACTION_DESCRIPTIONS } from "../constants";
import { useWalletAction } from "@/hooks/wallet/useWalletAction";

// =============================================================================
// TYPES
// =============================================================================

export interface BuyerActionsProps {
  /** Open confirmation modal */
  onOpenModal: (type: "release" | "dispute") => void;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function BuyerActions({ onOpenModal }: BuyerActionsProps) {
  const { actions, write, role } = useEscrowDetail();
  const { availableActions } = actions;
  const { isPending, pendingAction } = write;
  const { requireWallet, isConnected } = useWalletAction();

  // Only render for buyers
  if (!role.isBuyer) {
    return null;
  }

  const canRelease = availableActions.release;
  const canDispute = availableActions.openDispute;

  // Don't render if no buyer actions available
  if (!canRelease && !canDispute) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Release Funds */}
      {canRelease && (
        <div className="space-y-1.5">
          <Button
            variant="primary"
            className="w-full"
            onClick={() => requireWallet(() => onOpenModal("release"))}
            disabled={isPending}
          >
            {isPending && pendingAction === "release" ? (
              <>
                <Loader2 size={16} className="animate-spin mr-2" />
                Releasing...
              </>
            ) : isConnected ? (
              <>
                <Send size={16} className="mr-2" />
                Release Funds
              </>
            ) : (
              <>
                <Wallet size={16} className="mr-2" />
                Connect Wallet
              </>
            )}
          </Button>
          <Text variant="muted" className="text-xs text-center">
            {ACTION_DESCRIPTIONS.release}
          </Text>
        </div>
      )}

      {/* Open Dispute */}
      {canDispute && (
        <div className="space-y-1.5">
          <Button
            variant="outline"
            className="w-full border-error-200 text-error-600 hover:bg-error-50 dark:border-error-800 dark:text-error-400 dark:hover:bg-error-900/20"
            onClick={() => requireWallet(() => onOpenModal("dispute"))}
            disabled={isPending}
          >
            {isPending && pendingAction === "openDispute" ? (
              <>
                <Loader2 size={16} className="animate-spin mr-2" />
                Opening...
              </>
            ) : isConnected ? (
              <>
                <AlertTriangle size={16} className="mr-2" />
                Open Dispute
              </>
            ) : (
              <>
                <Wallet size={16} className="mr-2" />
                Connect Wallet
              </>
            )}
          </Button>
          <Text variant="muted" className="text-xs text-center">
            {ACTION_DESCRIPTIONS.openDispute}
          </Text>
        </div>
      )}
    </div>
  );
}
