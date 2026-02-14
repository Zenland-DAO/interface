"use client";

/**
 * NetworkBanner Component
 *
 * Shared banner component for network awareness across the application.
 * Shows warnings when user is on an unsupported chain or on testnet.
 *
 * Features:
 * - Unsupported chain warning with switch button
 * - Testnet mode warning with optional switch to mainnet button
 * - Consistent styling across all pages
 *
 * @example
 * ```tsx
 * const { isOnTestnet, isOnSupportedChain, ... } = useNetworkGuard();
 *
 * <NetworkBanner
 *   isOnTestnet={isOnTestnet}
 *   isOnSupportedChain={isOnSupportedChain}
 *   isConnected={isConnected}
 *   chainName={chainName}
 *   switchToMainnet={switchToMainnet}
 *   isSwitching={isSwitching}
 * />
 * ```
 */

import { AlertTriangle, Info, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui";

export interface NetworkBannerProps {
  /** Whether user is on a testnet (Sepolia) */
  isOnTestnet: boolean;
  /** Whether user is on a supported chain (mainnet or sepolia) */
  isOnSupportedChain: boolean;
  /** Whether wallet is connected */
  isConnected: boolean;
  /** Current chain name for display */
  chainName: string;
  /** Function to switch to mainnet */
  switchToMainnet: () => void;
  /** Whether a chain switch is in progress */
  isSwitching: boolean;
  /** Optional custom container className */
  className?: string;
  /** Optional: hide the "Switch to Ethereum" button on testnet banner */
  hideTestnetSwitchButton?: boolean;
}

export function NetworkBanner({
  isOnTestnet,
  isOnSupportedChain,
  isConnected,
  chainName,
  switchToMainnet,
  isSwitching,
  className = "max-w-3xl mx-auto px-4 sm:px-0",
  hideTestnetSwitchButton = false,
}: NetworkBannerProps) {
  // Don't show banner if not connected or on mainnet
  if (!isConnected) return null;
  if (isOnSupportedChain && !isOnTestnet) return null;

  // Unsupported chain banner
  if (!isOnSupportedChain) {
    return (
      <div className={className}>
        <div className="flex flex-col sm:flex-row sm:items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-600 dark:text-red-400">
                Unsupported Network
              </p>
              <p className="text-sm text-red-600/80 dark:text-red-400/80 mt-0.5">
                You are connected to {chainName}. Please switch to Ethereum Mainnet or Sepolia.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={switchToMainnet}
            isLoading={isSwitching}
            className="w-full sm:w-auto shrink-0 border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/10"
          >
            Switch to Ethereum
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    );
  }

  // Testnet banner (Sepolia)
  return (
    <div className={className}>
      <div className="flex flex-col sm:flex-row sm:items-start gap-3 p-4 rounded-xl bg-warning-500/10 border border-warning-500/20">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <Info className="w-5 h-5 text-warning-600 dark:text-warning-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-warning-700 dark:text-warning-300">
              Testnet Mode
            </p>
            <p className="text-sm text-warning-600/80 dark:text-warning-400/80 mt-0.5">
              You are on Sepolia testnet. This will use test tokens only.
            </p>
          </div>
        </div>
        {!hideTestnetSwitchButton && (
          <Button
            variant="outline"
            size="sm"
            onClick={switchToMainnet}
            isLoading={isSwitching}
            className="w-full sm:w-auto shrink-0 border-warning-500/30 text-warning-700 dark:text-warning-300 hover:bg-warning-500/10"
          >
            Switch to Ethereum
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}

export default NetworkBanner;
