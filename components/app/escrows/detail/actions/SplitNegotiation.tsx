"use client";

/**
 * SplitNegotiation
 *
 * Inline expandable section for split negotiation.
 * Allows parties to propose and approve splits.
 */

import { useState, useCallback } from "react";
import { Percent, ChevronDown, ChevronUp, Loader2, Check, X, Wallet } from "lucide-react";

import { Button, Text } from "@/components/ui";
import { useEscrowDetail } from "../EscrowDetailContext";
import { BPS_DENOMINATOR, MIN_SPLIT_BPS, MAX_SPLIT_BPS } from "../constants";
import { useWalletAction } from "@/hooks/wallet/useWalletAction";

// =============================================================================
// TYPES
// =============================================================================

export interface SplitNegotiationProps {
  /** Open confirmation modal */
  onOpenModal: (
    type: "proposeSplit" | "approveSplit",
    data: { buyerBps: number; sellerBps: number }
  ) => void;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function SplitNegotiation({ onOpenModal }: SplitNegotiationProps) {
  const { actions, write, role, splitProposal, escrow, tokenInfo } = useEscrowDetail();
  const { availableActions } = actions;
  const { isPending, pendingAction } = write;
  const { requireWallet, isConnected } = useWalletAction();

  // Local state
  const [isExpanded, setIsExpanded] = useState(false);
  const [proposedBuyerBps, setProposedBuyerBps] = useState(5000); // 50% default

  const proposedSellerBps = BPS_DENOMINATOR - proposedBuyerBps;

  // Calculate amounts for preview (memoized for performance)
  // NOTE: Must be declared before any conditional return to satisfy Hooks rules.
  const formatAmount = useCallback(
    (bps: number) => {
      const amount = (escrow.amount * BigInt(bps)) / BigInt(BPS_DENOMINATOR);
      const value = Number(amount) / Math.pow(10, tokenInfo.decimals);
      return value.toFixed(2); // Using toFixed instead of toLocaleString for performance
    },
    [escrow.amount, tokenInfo.decimals]
  );

  // Hooks must come before early returns
  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value, 10);
      const clamped = Math.max(MIN_SPLIT_BPS, Math.min(MAX_SPLIT_BPS, value));
      setProposedBuyerBps(clamped);
    },
    []
  );

  const handleCancelSplit = useCallback(async () => {
    // Cancel split is a direct action without modal
    // The useEscrowActions doesn't have cancelSplit yet, so we'll skip for now
    // await write.cancelSplit();
  }, []);

  // Only render for parties
  if (!role.isBuyer && !role.isSeller) {
    return null;
  }

  const canPropose = availableActions.proposeSplit;
  const canApprove = availableActions.approveSplit;
  const canCancel = availableActions.cancelSplit;
  const hasActiveProposal = !!splitProposal;

  // Don't render if no split actions available
  if (!canPropose && !canApprove && !hasActiveProposal) {
    return null;
  }

  const handlePropose = () => {
    requireWallet(() => onOpenModal("proposeSplit", {
      buyerBps: proposedBuyerBps,
      sellerBps: proposedSellerBps,
    }));
  };

  const handleApprove = () => {
    if (splitProposal) {
      requireWallet(() => onOpenModal("approveSplit", {
        buyerBps: splitProposal.buyerBps,
        sellerBps: splitProposal.sellerBps,
      }));
    }
  };

  return (
    <div className="border border-[var(--border-secondary)] rounded-lg overflow-hidden">
      {/* Header (always visible) */}
      <button
        className="w-full p-3 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Percent size={16} className="text-[var(--text-tertiary)]" />
          <Text className="font-semibold text-sm">Split Negotiation</Text>
          {hasActiveProposal && (
            <span className="text-[10px] px-1.5 py-0.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded font-semibold">
              Active
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp size={16} className="text-[var(--text-tertiary)]" />
        ) : (
          <ChevronDown size={16} className="text-[var(--text-tertiary)]" />
        )}
      </button>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="p-4 border-t border-[var(--border-secondary)] space-y-4">
          {/* Active Proposal Display */}
          {hasActiveProposal && splitProposal && (
            <div className="p-3 bg-primary-50/50 dark:bg-primary-900/10 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <Text className="text-sm font-semibold">Current Proposal</Text>
                <Text variant="muted" className="text-xs">
                  by {splitProposal.proposer?.slice(0, 6)}...
                </Text>
              </div>

              {/* Proposal percentages */}
              <div className="flex justify-between">
                <div>
                  <Text variant="muted" className="text-xs">Buyer</Text>
                  <Text className="font-bold text-primary-600 dark:text-primary-400">
                    {(splitProposal.buyerBps / 100).toFixed(1)}%
                  </Text>
                </div>
                <div className="text-right">
                  <Text variant="muted" className="text-xs">Seller</Text>
                  <Text className="font-bold text-success-600 dark:text-success-400">
                    {(splitProposal.sellerBps / 100).toFixed(1)}%
                  </Text>
                </div>
              </div>

              {/* Visual bar */}
              <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden flex">
                <div
                  className="bg-primary-500 h-full"
                  style={{ width: `${splitProposal.buyerBps / 100}%` }}
                />
                <div
                  className="bg-success-500 h-full"
                  style={{ width: `${splitProposal.sellerBps / 100}%` }}
                />
              </div>

              {/* Approval status */}
              <div className="flex justify-between text-xs pt-2 border-t border-[var(--border-secondary)]">
                <div className="flex items-center gap-1">
                  {splitProposal.buyerApproved ? (
                    <Check size={12} className="text-success-500" />
                  ) : (
                    <X size={12} className="text-neutral-400" />
                  )}
                  <span>Buyer {splitProposal.buyerApproved ? "approved" : "pending"}</span>
                </div>
                <div className="flex items-center gap-1">
                  {splitProposal.sellerApproved ? (
                    <Check size={12} className="text-success-500" />
                  ) : (
                    <X size={12} className="text-neutral-400" />
                  )}
                  <span>Seller {splitProposal.sellerApproved ? "approved" : "pending"}</span>
                </div>
              </div>

              {/* Approve/Cancel buttons */}
              <div className="flex gap-2 pt-2">
                {canApprove && (
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex-1"
                    onClick={handleApprove}
                    disabled={isPending}
                  >
                    {isPending && pendingAction === "approveSplit" ? (
                      <>
                        <Loader2 size={14} className="animate-spin mr-1" />
                        Approving...
                      </>
                    ) : isConnected ? (
                      "Approve Split"
                    ) : (
                      <>
                        <Wallet size={14} className="mr-1" />
                        Connect Wallet
                      </>
                    )}
                  </Button>
                )}
                {canCancel && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelSplit}
                    disabled={isPending}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Propose New Split (when no active proposal or can propose) */}
          {canPropose && !hasActiveProposal && (
            <div className="space-y-4">
              <Text variant="muted" className="text-xs">
                Propose a split of the escrowed funds. If both parties approve,
                the funds will be distributed automatically.
              </Text>

              {/* Slider */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <div>
                    <Text variant="muted" className="text-xs">Buyer</Text>
                    <Text className="font-bold text-primary-600 dark:text-primary-400">
                      {(proposedBuyerBps / 100).toFixed(1)}%
                    </Text>
                  </div>
                  <div className="text-right">
                    <Text variant="muted" className="text-xs">Seller</Text>
                    <Text className="font-bold text-success-600 dark:text-success-400">
                      {(proposedSellerBps / 100).toFixed(1)}%
                    </Text>
                  </div>
                </div>

                {/* Slider track */}
                <div className="relative">
                  <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden flex">
                    <div
                      className="bg-primary-500 h-full"
                      style={{ width: `${proposedBuyerBps / 100}%` }}
                    />
                    <div
                      className="bg-success-500 h-full"
                      style={{ width: `${proposedSellerBps / 100}%` }}
                    />
                  </div>
                  <input
                    type="range"
                    min={MIN_SPLIT_BPS}
                    max={MAX_SPLIT_BPS}
                    value={proposedBuyerBps}
                    onChange={handleSliderChange}
                    className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
                    disabled={isPending}
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white dark:bg-neutral-900 border-2 border-neutral-300 dark:border-neutral-600 rounded-full shadow pointer-events-none"
                    style={{ left: `calc(${proposedBuyerBps / 100}% - 8px)` }}
                  />
                </div>

                {/* Amount preview */}
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--text-tertiary)]">
                    {formatAmount(proposedBuyerBps)} {tokenInfo.symbol}
                  </span>
                  <span className="text-[var(--text-tertiary)]">
                    {formatAmount(proposedSellerBps)} {tokenInfo.symbol}
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={handlePropose}
                disabled={isPending}
              >
                {isPending && pendingAction === "proposeSplit" ? (
                  <>
                    <Loader2 size={14} className="animate-spin mr-2" />
                    Proposing...
                  </>
                ) : isConnected ? (
                  <>
                    <Percent size={14} className="mr-2" />
                    Propose Split
                  </>
                ) : (
                  <>
                    <Wallet size={14} className="mr-2" />
                    Connect Wallet
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Message when proposal exists but user can't approve */}
          {hasActiveProposal && !canApprove && !canCancel && (
            <Text variant="muted" className="text-xs text-center py-2">
              Waiting for the other party to respond to the proposal.
            </Text>
          )}
        </div>
      )}
    </div>
  );
}
