"use client";

/**
 * useEscrowChainGuard Hook
 *
 * Extends the general useNetworkGuard with escrow-specific chain validation.
 * Detects when the wallet is connected to a different chain than where the escrow is deployed.
 *
 * Features:
 * - Validates wallet chain matches escrow's deployment chain
 * - Provides "switch to correct chain" functionality
 * - Distinguishes between "wrong chain" (mismatch) and "testnet" (warning) states
 *
 * @example
 * ```tsx
 * const {
 *   isWrongChain,
 *   isOnTestnet,
 *   escrowChainName,
 *   switchToEscrowChain,
 * } = useEscrowChainGuard({ escrowChainId: 1 });
 *
 * {isWrongChain && (
 *   <Banner variant="error">
 *     This escrow is on {escrowChainName}. Switch to continue.
 *     <Button onClick={switchToEscrowChain}>Switch Network</Button>
 *   </Banner>
 * )}
 * ```
 */

import { useMemo, useCallback } from "react";
import { useConnection, useSwitchChain } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";

// =============================================================================
// CONSTANTS
// =============================================================================

/** Supported chain IDs */
export const SUPPORTED_CHAIN_IDS = {
  MAINNET: mainnet.id,
  SEPOLIA: sepolia.id,
} as const;

/** Chain ID to name mapping */
const CHAIN_NAMES: Record<number, string> = {
  [mainnet.id]: "Ethereum",
  [sepolia.id]: "Sepolia",
};

// =============================================================================
// TYPES
// =============================================================================

export interface UseEscrowChainGuardParams {
  /** The chain ID where the escrow contract is deployed */
  escrowChainId: number;
}

export interface UseEscrowChainGuardReturn {
  /** Whether the wallet is connected to a different chain than the escrow */
  isWrongChain: boolean;
  /** Whether the escrow is deployed on a testnet */
  isEscrowOnTestnet: boolean;
  /** Whether the wallet is currently on a testnet (and matches escrow chain) */
  isOnTestnet: boolean;
  /** Whether the wallet is connected */
  isConnected: boolean;
  /** Whether the wallet is on a supported chain */
  isOnSupportedChain: boolean;
  /** Current wallet chain ID */
  walletChainId: number | undefined;
  /** Escrow's deployment chain ID */
  escrowChainId: number;
  /** Human-readable name of the escrow's chain */
  escrowChainName: string;
  /** Human-readable name of the wallet's current chain */
  walletChainName: string;
  /** Switch wallet to the escrow's chain */
  switchToEscrowChain: () => void;
  /** Whether a chain switch is in progress */
  isSwitching: boolean;
  /** Error from last switch attempt */
  switchError: Error | null;
  /** Whether actions should be disabled due to chain mismatch */
  shouldDisableActions: boolean;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get human-readable chain name from chain ID.
 */
function getChainName(chainId: number | undefined): string {
  if (!chainId) return "Unknown";
  return CHAIN_NAMES[chainId] ?? `Chain ${chainId}`;
}

/**
 * Check if a chain ID is a testnet.
 */
function isTestnet(chainId: number): boolean {
  return chainId === SUPPORTED_CHAIN_IDS.SEPOLIA;
}

/**
 * Check if a chain ID is supported.
 */
function isSupportedChain(chainId: number | undefined): boolean {
  if (!chainId) return false;
  return chainId === SUPPORTED_CHAIN_IDS.MAINNET || chainId === SUPPORTED_CHAIN_IDS.SEPOLIA;
}

// =============================================================================
// HOOK
// =============================================================================

export function useEscrowChainGuard(
  params: UseEscrowChainGuardParams
): UseEscrowChainGuardReturn {
  const { escrowChainId } = params;

  // Wagmi hooks
  const { chainId: walletChainId, status } = useConnection();
  const { mutate: switchChain, isPending, error } = useSwitchChain();

  const isConnected = status === "connected";

  // Compute chain states
  const chainState = useMemo(() => {
    const walletOnSupported = isSupportedChain(walletChainId);
    const escrowOnTestnet = isTestnet(escrowChainId);
    const walletOnTestnet = walletChainId ? isTestnet(walletChainId) : false;

    // Wrong chain = connected but to a different chain than the escrow
    const wrongChain = isConnected && walletChainId !== escrowChainId;

    // Should disable actions if:
    // 1. Not connected (can't sign)
    // 2. On wrong chain (transaction would go to wrong network)
    // 3. On unsupported chain
    const disableActions = !isConnected || wrongChain || !walletOnSupported;

    return {
      isWrongChain: wrongChain,
      isEscrowOnTestnet: escrowOnTestnet,
      isOnTestnet: !wrongChain && walletOnTestnet,
      isOnSupportedChain: walletOnSupported,
      shouldDisableActions: disableActions,
    };
  }, [isConnected, walletChainId, escrowChainId]);

  // Chain names
  const escrowChainName = useMemo(() => getChainName(escrowChainId), [escrowChainId]);
  const walletChainName = useMemo(() => getChainName(walletChainId), [walletChainId]);

  // Switch to escrow's chain
  const switchToEscrowChain = useCallback(() => {
    switchChain({ chainId: escrowChainId });
  }, [switchChain, escrowChainId]);

  return {
    // Chain states
    isWrongChain: chainState.isWrongChain,
    isEscrowOnTestnet: chainState.isEscrowOnTestnet,
    isOnTestnet: chainState.isOnTestnet,
    isConnected,
    isOnSupportedChain: chainState.isOnSupportedChain,
    shouldDisableActions: chainState.shouldDisableActions,

    // Chain IDs
    walletChainId,
    escrowChainId,

    // Chain names
    escrowChainName,
    walletChainName,

    // Switch functionality
    switchToEscrowChain,
    isSwitching: isPending,
    switchError: error,
  };
}

export default useEscrowChainGuard;
