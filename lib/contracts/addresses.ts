import { mainnet, sepolia } from "wagmi/chains";
import type { Address } from "viem";

/**
 * Contract addresses by chain ID.
 *
 * Design: Multichain-ready from the start.
 * Add new chains here as they are deployed.
 */
export const CONTRACT_ADDRESSES = {
  [sepolia.id]: {
    escrowFactory: "0x9f5b706288ce48ae26a161664cd6b15b9c9ebc5e",
    agentRegistry: "0x50cdb07a74a1898308eb2331940dd6b9263cce56",
    feeManager: "0x412c2dcdcd4d1de95c37246d0fb54f1a0b9a1f2f",
    daoToken: "0xe4b758C752DD784FFA1f3D402e4401F4dD52F1ee",
  },
  [mainnet.id]: {
    escrowFactory: "0x11c6bb595824014e1c11c6b4a6ad2095cf7d22ab",
    agentRegistry: "0xb528f6ba2d75c383dfe6cdab9957a6cd6b45d90d",
    feeManager: "0x9c364b9b5020bc63e074d43f7c68493c0bbdb0cd",
    daoToken: "0x5e7A494312d1943aa01682059dF1C0D2f3A27c32",
  },
} as const;

/**
 * Supported chain IDs for the application.
 */
export const SUPPORTED_CHAIN_IDS = [sepolia.id, mainnet.id] as const;

export type SupportedChainId = (typeof SUPPORTED_CHAIN_IDS)[number];

/**
 * Get contract addresses for a specific chain.
 * @param chainId - The chain ID to get addresses for
 * @returns Contract addresses or undefined if chain not supported
 */
export function getContractAddresses(chainId: number | undefined) {
  if (!chainId || !(chainId in CONTRACT_ADDRESSES)) {
    return undefined;
  }
  return CONTRACT_ADDRESSES[chainId as SupportedChainId];
}

/**
 * Check if a chain is supported.
 */
export function isSupportedChain(
  chainId: number | undefined,
): chainId is SupportedChainId {
  return chainId !== undefined && chainId in CONTRACT_ADDRESSES;
}

export function isNonZeroAddress(
  address: string | undefined | null,
): address is Address {
  if (!address) return false;
  return address.toLowerCase() !== "0x0000000000000000000000000000000000000000";
}

/**
 * True if the current chain has actual deployed addresses for the core contracts.
 * This helps prevent accidental mainnet transactions when the app isn't deployed there yet.
 */
export function isChainReady(chainId: number | undefined) {
  const cfg = getContractAddresses(chainId);
  if (!cfg) return false;
  return (
    isNonZeroAddress(cfg.agentRegistry) &&
    isNonZeroAddress(cfg.feeManager) &&
    isNonZeroAddress(cfg.escrowFactory) &&
    isNonZeroAddress(cfg.daoToken)
  );
}
