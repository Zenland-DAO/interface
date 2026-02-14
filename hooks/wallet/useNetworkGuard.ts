"use client";

/**
 * useNetworkGuard Hook
 *
 * Hook for pages that need network awareness and switch functionality.
 * Does NOT auto-switch - just provides state and manual switch function.
 *
 * Use cases:
 * - Create escrow page: show testnet banner when on Sepolia
 * - Any page that needs to know current network state
 *
 * @example
 * ```tsx
 * const {
 *   isOnMainnet,
 *   isOnTestnet,
 *   chainName,
 *   switchToMainnet,
 *   isSwitching
 * } = useNetworkGuard();
 *
 * {isOnTestnet && (
 *   <Alert>
 *     You are on testnet.
 *     <Button onClick={switchToMainnet}>Switch to Ethereum</Button>
 *   </Alert>
 * )}
 * ```
 */

import { useMemo, useCallback } from "react";
import { useConnection, useSwitchChain } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";

// =============================================================================
// TYPES
// =============================================================================

export interface UseNetworkGuardOptions {
  /** Preferred chain ID to switch to (default: mainnet = 1) */
  preferredChainId?: number;
}

export interface UseNetworkGuardReturn {
  /** Whether user is connected to mainnet */
  isOnMainnet: boolean;
  /** Whether user is connected to Sepolia testnet */
  isOnTestnet: boolean;
  /** Whether user is on a supported chain (mainnet or sepolia) */
  isOnSupportedChain: boolean;
  /** Current chain ID */
  chainId: number | undefined;
  /** Current chain name for display */
  chainName: string;
  /** Whether the wallet is connected */
  isConnected: boolean;
  /** Switch to the preferred chain (mainnet by default) */
  switchToMainnet: () => void;
  /** Switch to Sepolia testnet */
  switchToTestnet: () => void;
  /** Whether a chain switch is in progress */
  isSwitching: boolean;
  /** Error from last switch attempt */
  switchError: Error | null;
}

// =============================================================================
// HELPERS
// =============================================================================

function getChainName(chainId: number | undefined): string {
  switch (chainId) {
    case mainnet.id:
      return "Ethereum";
    case sepolia.id:
      return "Sepolia";
    default:
      return chainId ? `Chain ${chainId}` : "Unknown";
  }
}

// =============================================================================
// HOOK
// =============================================================================

export function useNetworkGuard(
  options: UseNetworkGuardOptions = {}
): UseNetworkGuardReturn {
  const { preferredChainId = mainnet.id } = options;

  const { chainId, status } = useConnection();
  const { mutate: switchChain, isPending, error } = useSwitchChain();

  const isConnected = status === "connected";
  const isOnMainnet = chainId === mainnet.id;
  const isOnTestnet = chainId === sepolia.id;
  const isOnSupportedChain = isOnMainnet || isOnTestnet;

  const chainName = useMemo(() => getChainName(chainId), [chainId]);

  const switchToMainnet = useCallback(() => {
    switchChain({ chainId: mainnet.id });
  }, [switchChain]);

  const switchToTestnet = useCallback(() => {
    switchChain({ chainId: sepolia.id });
  }, [switchChain]);

  return {
    isOnMainnet,
    isOnTestnet,
    isOnSupportedChain,
    chainId,
    chainName,
    isConnected,
    switchToMainnet,
    switchToTestnet,
    isSwitching: isPending,
    switchError: error,
  };
}

export default useNetworkGuard;
