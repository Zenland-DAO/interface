"use client";

/**
 * AgentActions
 *
 * Action interface for agents to resolve disputes.
 * Features a dual-slider to set buyer/seller split percentages.
 */

import { useState, useCallback } from "react";
import { Scale, Loader2, Wallet } from "lucide-react";

import { Button, Text } from "@/components/ui";
import { useEscrowDetail } from "../EscrowDetailContext";
import { BPS_DENOMINATOR, MIN_SPLIT_BPS, MAX_SPLIT_BPS } from "../constants";
import { useWalletAction } from "@/hooks/wallet/useWalletAction";

// =============================================================================
// TYPES
// =============================================================================

export interface AgentActionsProps {
  /** Open confirmation modal with split data */
  onOpenModal: (type: "agentResolve", data: { buyerBps: number; sellerBps: number }) => void;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function AgentActions({ onOpenModal }: AgentActionsProps) {
  const { actions, write, role, tokenInfo, escrow } = useEscrowDetail();
  const { availableActions } = actions;
  const { isPending, pendingAction } = write;
  const { requireWallet, isConnected } = useWalletAction();

  // Local state for the slider
  const [buyerBps, setBuyerBps] = useState(5000); // 50% default

  // All hooks must be called before any early returns
  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value, 10);
      // Clamp to min/max
      const clamped = Math.max(MIN_SPLIT_BPS, Math.min(MAX_SPLIT_BPS, value));
      setBuyerBps(clamped);
    },
    []
  );

  // Only render for agents
  if (!role.isAgent) {
    return null;
  }

  const canResolve = availableActions.agentResolve;

  // Don't render if agent can't resolve
  if (!canResolve) {
    return null;
  }

  // Calculate seller BPS (inverse of buyer)
  const sellerBps = BPS_DENOMINATOR - buyerBps;

  // Calculate actual amounts
  const totalAmount = escrow.amount;
  const buyerAmount = (totalAmount * BigInt(buyerBps)) / BigInt(BPS_DENOMINATOR);
  const sellerAmount = totalAmount - buyerAmount;

  // Format amounts for display
  const formatAmount = (amount: bigint) => {
    const value = Number(amount) / Math.pow(10, tokenInfo.decimals);
    return value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    });
  };

  const handleResolve = () => {
    requireWallet(() => onOpenModal("agentResolve", { buyerBps, sellerBps }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Scale size={16} className="text-warning-500" />
        <Text className="font-semibold text-sm">Resolve Dispute</Text>
      </div>

      <Text variant="muted" className="text-xs">
        As the agent, decide how to split the escrowed funds between buyer and
        seller. Your decision is final and cannot be undone.
      </Text>

      {/* Dual Slider Section */}
      <div className="space-y-4 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
        {/* Labels */}
        <div className="flex justify-between text-sm">
          <div className="space-y-1">
            <Text variant="muted" className="text-xs">Buyer receives</Text>
            <Text className="font-bold text-primary-600 dark:text-primary-400">
              {(buyerBps / 100).toFixed(1)}%
            </Text>
          </div>
          <div className="text-right space-y-1">
            <Text variant="muted" className="text-xs">Seller receives</Text>
            <Text className="font-bold text-success-600 dark:text-success-400">
              {(sellerBps / 100).toFixed(1)}%
            </Text>
          </div>
        </div>

        {/* Slider */}
        <div className="relative">
          {/* Track Background */}
          <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden flex">
            <div
              className="bg-primary-500 h-full transition-all duration-100"
              style={{ width: `${buyerBps / 100}%` }}
            />
            <div
              className="bg-success-500 h-full transition-all duration-100"
              style={{ width: `${sellerBps / 100}%` }}
            />
          </div>

          {/* Range Input (invisible, for interaction) */}
          <input
            type="range"
            min={MIN_SPLIT_BPS}
            max={MAX_SPLIT_BPS}
            value={buyerBps}
            onChange={handleSliderChange}
            className="absolute inset-0 w-full h-3 opacity-0 cursor-pointer"
            disabled={isPending}
          />

          {/* Thumb indicator */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white dark:bg-neutral-900 border-2 border-neutral-300 dark:border-neutral-600 rounded-full shadow-md transition-all duration-100 pointer-events-none"
            style={{ left: `calc(${buyerBps / 100}% - 10px)` }}
          />
        </div>

        {/* Amount Preview */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[var(--border-secondary)]">
          <div>
            <Text variant="muted" className="text-[10px] uppercase tracking-wider">
              Buyer Amount
            </Text>
            <Text className="text-sm font-semibold font-mono">
              {formatAmount(buyerAmount)} {tokenInfo.symbol}
            </Text>
          </div>
          <div className="text-right">
            <Text variant="muted" className="text-[10px] uppercase tracking-wider">
              Seller Amount
            </Text>
            <Text className="text-sm font-semibold font-mono">
              {formatAmount(sellerAmount)} {tokenInfo.symbol}
            </Text>
          </div>
        </div>
      </div>

      {/* Resolve Button */}
      <Button
        variant="primary"
        className="w-full"
        onClick={handleResolve}
        disabled={isPending}
      >
        {isPending && pendingAction === "agentResolve" ? (
          <>
            <Loader2 size={16} className="animate-spin mr-2" />
            Resolving...
          </>
        ) : isConnected ? (
          <>
            <Scale size={16} className="mr-2" />
            Submit Resolution
          </>
        ) : (
          <>
            <Wallet size={16} className="mr-2" />
            Connect Wallet
          </>
        )}
      </Button>
    </div>
  );
}
