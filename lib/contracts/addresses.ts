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
    escrowFactory: "0xba2c6322fd59e2703a28d82db572950297600129",
    agentRegistry: "0x3406c744958b182d6edd2615ff9e53f0fbc60802",
    feeManager: "0x14f582bd5ddbc3e8416b9d3a9e5f0d3b6ce4206f",
    daoToken: "0xa6be5ae3bc634cf44439845365a01c2cd705f32d",
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
