"use client";

/**
 * NetworkSwitcher Component
 *
 * Dropdown-based network switcher for switching between supported chains.
 * Uses wagmi v3 useSwitchChain hook.
 *
 * Features:
 * - Shows current chain with colored indicator
 * - Dropdown to switch between Ethereum Mainnet and Sepolia
 * - Loading state during chain switch
 * - Error handling
 */

import { useMemo } from "react";
import { useConnection, useSwitchChain, useChains } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { ChevronDown, Loader2, AlertCircle } from "lucide-react";
import { Dropdown, DropdownItem, DropdownDivider } from "@/components/ui";

// =============================================================================
// TYPES
// =============================================================================

export interface NetworkSwitcherProps {
  /** Size variant */
  size?: "sm" | "md";
  /** Additional CSS classes */
  className?: string;
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Get chain display info
 */
function getChainInfo(chainId: number | undefined) {
  switch (chainId) {
    case mainnet.id:
      return {
        name: "Ethereum",
        isTestnet: false,
        color: "bg-success-500",
      };
    case sepolia.id:
      return {
        name: "Sepolia",
        isTestnet: true,
        color: "bg-warning-500",
      };
    default:
      return {
        name: "Unknown",
        isTestnet: false,
        color: "bg-neutral-500",
      };
  }
}

// =============================================================================
// COMPONENT
// =============================================================================

export function NetworkSwitcher({ size = "md", className = "" }: NetworkSwitcherProps) {
  const { chainId, status } = useConnection();
  const { mutate: switchChain, isPending, error } = useSwitchChain();
  const chains = useChains();

  const isConnected = status === "connected";
  const currentChain = useMemo(() => getChainInfo(chainId), [chainId]);

  // Size classes
  const sizeClasses = {
    sm: {
      trigger: "px-2 py-1.5 text-xs gap-1.5",
      dot: "w-1.5 h-1.5",
      icon: "w-3 h-3",
    },
    md: {
      trigger: "px-3 py-2 text-sm gap-2",
      dot: "w-2 h-2",
      icon: "w-4 h-4",
    },
  };

  const sizes = sizeClasses[size];

  // Handle chain switch
  const handleSwitchChain = (newChainId: typeof mainnet.id | typeof sepolia.id) => {
    if (newChainId === chainId) return;
    switchChain({ chainId: newChainId });
  };

  // If not connected, show disabled state
  if (!isConnected) {
    return (
      <div
        className={`inline-flex items-center rounded-lg font-medium
          bg-neutral-100 dark:bg-neutral-800
          text-[var(--text-tertiary)]
          border border-neutral-200 dark:border-neutral-700
          cursor-not-allowed opacity-60
          ${sizes.trigger} ${className}`}
      >
        <span className={`rounded-full bg-neutral-400 ${sizes.dot}`} />
        <span>Not Connected</span>
      </div>
    );
  }

  return (
    <Dropdown
      trigger={
        <button
          className={`inline-flex items-center rounded-lg font-medium
            bg-neutral-100 dark:bg-neutral-800
            text-[var(--text-secondary)]
            border border-neutral-200 dark:border-neutral-700
            hover:border-[var(--border-focus)] hover:bg-[var(--state-hover)]
            transition-colors
            ${sizes.trigger} ${className}`}
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className={`${sizes.icon} animate-spin text-primary-500`} />
          ) : error ? (
            <AlertCircle className={`${sizes.icon} text-red-500`} />
          ) : (
            <span
              className={`rounded-full ${sizes.dot} ${currentChain.color} ${
                currentChain.isTestnet ? "animate-pulse" : ""
              }`}
            />
          )}
          <span>{isPending ? "Switching..." : currentChain.name}</span>
          {currentChain.isTestnet && !isPending && (
            <span className="text-[var(--text-tertiary)] text-xs">Testnet</span>
          )}
          <ChevronDown className={`${sizes.icon} text-[var(--text-tertiary)]`} />
        </button>
      }
      align="right"
    >
      {chains.map((chain) => {
        const chainInfo = getChainInfo(chain.id);
        const isActive = chain.id === chainId;
        // Type assertion: wagmi config only includes mainnet and sepolia
        const typedChainId = chain.id as typeof mainnet.id | typeof sepolia.id;

        return (
          <DropdownItem
            key={chain.id}
            onClick={() => handleSwitchChain(typedChainId)}
            icon={
              <span
                className={`w-2 h-2 rounded-full ${chainInfo.color} ${
                  chainInfo.isTestnet ? "animate-pulse" : ""
                }`}
              />
            }
            className={isActive ? "bg-[var(--state-hover)]" : ""}
          >
            <span className="flex items-center gap-2">
              {chain.name}
              {chainInfo.isTestnet && (
                <span className="text-xs text-[var(--text-tertiary)]">Testnet</span>
              )}
              {isActive && (
                <span className="text-xs text-primary-500 font-medium">Active</span>
              )}
            </span>
          </DropdownItem>
        );
      })}

      {error && (
        <>
          <DropdownDivider />
          <div className="px-4 py-2 text-xs text-red-500">
            Failed to switch network. Please try again.
          </div>
        </>
      )}
    </Dropdown>
  );
}

export default NetworkSwitcher;
