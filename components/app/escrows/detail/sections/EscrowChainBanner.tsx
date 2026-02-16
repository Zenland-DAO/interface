"use client";

/**
 * EscrowChainBanner Component
 *
 * Displays chain-related warnings and errors on the escrow detail page.
 * Shows different banners for:
 * - Wrong chain (wallet connected to different chain than escrow) - Error
 * - Testnet mode (escrow is on testnet) - Warning
 * - Unsupported chain (wallet on unsupported network) - Error
 *
 * @example
 * ```tsx
 * <EscrowChainBanner escrowChainId={1} />
 * ```
 */

import { AlertTriangle, Info, ArrowRight, XCircle } from "lucide-react";
import { Button } from "@/components/ui";
import { useEscrowChainGuard, type UseEscrowChainGuardReturn, type SupportedChainId } from "../hooks";

// =============================================================================
// TYPES
// =============================================================================

export interface EscrowChainBannerProps {
  /** Chain ID where the escrow is deployed */
  escrowChainId: SupportedChainId;
  /** Optional custom container className */
  className?: string;
}

// =============================================================================
// BANNER VARIANTS
// =============================================================================

interface BannerContentProps {
  chainGuard: UseEscrowChainGuardReturn;
}

/**
 * Wrong Chain Banner - Shows when wallet is connected to different chain than escrow
 */
function WrongChainBanner({ chainGuard }: BannerContentProps) {
  const { escrowChainName, walletChainName, switchToEscrowChain, isSwitching } = chainGuard;

  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-red-600 dark:text-red-400">
            Wrong Network
          </p>
          <p className="text-sm text-red-600/80 dark:text-red-400/80 mt-0.5">
            This escrow is deployed on <strong>{escrowChainName}</strong>, but your wallet is connected to{" "}
            <strong>{walletChainName}</strong>. Switch networks to interact with this escrow.
          </p>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={switchToEscrowChain}
        isLoading={isSwitching}
        className="w-full sm:w-auto shrink-0 border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/10"
      >
        Switch to {escrowChainName}
        <ArrowRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );
}

/**
 * Unsupported Chain Banner - Shows when wallet is on an unsupported network
 */
function UnsupportedChainBanner({ chainGuard }: BannerContentProps) {
  const { walletChainName, escrowChainName, switchToEscrowChain, isSwitching } = chainGuard;

  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-red-600 dark:text-red-400">
            Unsupported Network
          </p>
          <p className="text-sm text-red-600/80 dark:text-red-400/80 mt-0.5">
            You are connected to <strong>{walletChainName}</strong> which is not supported.
            This escrow is on <strong>{escrowChainName}</strong>.
          </p>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={switchToEscrowChain}
        isLoading={isSwitching}
        className="w-full sm:w-auto shrink-0 border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/10"
      >
        Switch to {escrowChainName}
        <ArrowRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );
}

/**
 * Testnet Banner - Shows when escrow is on testnet (informational)
 */
function TestnetBanner({ chainGuard }: BannerContentProps) {
  const { escrowChainName } = chainGuard;

  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-3 p-4 rounded-xl bg-warning-500/10 border border-warning-500/20">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <Info className="w-5 h-5 text-warning-600 dark:text-warning-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-warning-700 dark:text-warning-300">
            Testnet Escrow
          </p>
          <p className="text-sm text-warning-600/80 dark:text-warning-400/80 mt-0.5">
            This escrow is on <strong>{escrowChainName}</strong> testnet. Transactions use test tokens only.
          </p>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function EscrowChainBanner({
  escrowChainId,
  className = "max-w-4xl mx-auto",
}: EscrowChainBannerProps) {
  const chainGuard = useEscrowChainGuard({ escrowChainId });
  const { isConnected, isWrongChain, isOnSupportedChain, isOnTestnet } = chainGuard;

  // Don't show banner if not connected (wallet connection prompts handle this)
  if (!isConnected) return null;

  // Priority 1: Wrong chain (wallet on different chain than escrow) - BLOCKING
  if (isWrongChain) {
    return (
      <div className={className}>
        <WrongChainBanner chainGuard={chainGuard} />
      </div>
    );
  }

  // Priority 2: Unsupported chain - BLOCKING
  if (!isOnSupportedChain) {
    return (
      <div className={className}>
        <UnsupportedChainBanner chainGuard={chainGuard} />
      </div>
    );
  }

  // Priority 3: Testnet mode - WARNING (non-blocking)
  if (isOnTestnet) {
    return (
      <div className={className}>
        <TestnetBanner chainGuard={chainGuard} />
      </div>
    );
  }

  // All good - mainnet and correct chain
  return null;
}

export default EscrowChainBanner;
