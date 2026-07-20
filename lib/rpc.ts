/**
 * Shared RPC / chain configuration — single source of truth.
 *
 * Both the wagmi config (wallet + hooks) and the standalone viem clients
 * (e.g. the PDF `/verify` page) MUST consume RPC endpoints from here so we
 * never accidentally fall back to viem's default public RPC (which rejects
 * requests with "invalid key" and surfaces as misleading errors).
 *
 * DRY: one place defines the chains, endpoints and helpers.
 * SOLID: the provider key is injectable via env; consumers depend on this
 * abstraction rather than hardcoding URLs.
 */

import {
  createPublicClient,
  http,
  type Chain,
  type PublicClient,
} from "viem";
import { mainnet, sepolia } from "viem/chains";

/**
 * dRPC access key.
 *
 * Overridable via `NEXT_PUBLIC_DRPC_KEY` so the key isn't hardcoded across the
 * codebase. Falls back to the previously embedded key to preserve behavior.
 */
const DRPC_KEY =
  process.env.NEXT_PUBLIC_DRPC_KEY ??
  "AjFvmgJ_7Uw7qTxlyHKwHFxIalWDHGIR8Z89tuZZzRRv";

/**
 * Supported chains for the app. Keep this list small and explicit.
 */
export const appChains = [mainnet, sepolia] as const;

/**
 * Union of chain ids we support.
 */
export type SupportedChainId = (typeof appChains)[number]["id"];

/**
 * Per-chain metadata (viem chain object + human-readable name).
 */
export const CHAIN_CONFIGS = {
  [mainnet.id]: { chain: mainnet, name: "Ethereum Mainnet" },
  [sepolia.id]: { chain: sepolia, name: "Sepolia Testnet" },
} as const satisfies Record<SupportedChainId, { chain: Chain; name: string }>;

/**
 * dRPC endpoints per chain — the single source of truth for RPC URLs.
 */
export const RPC_URLS = {
  [mainnet.id]: `https://lb.drpc.live/ethereum/${DRPC_KEY}`,
  [sepolia.id]: `https://lb.drpc.live/sepolia/${DRPC_KEY}`,
} as const satisfies Record<SupportedChainId, string>;

/**
 * Type guard: is this chain id one we support?
 */
export function isSupportedChainId(
  chainId: number,
): chainId is SupportedChainId {
  return chainId in RPC_URLS;
}

/**
 * Get the configured RPC URL for a chain (undefined if unsupported).
 */
export function getRpcUrl(chainId: number): string | undefined {
  return isSupportedChainId(chainId) ? RPC_URLS[chainId] : undefined;
}

/**
 * Human-readable chain name.
 */
export function getChainName(chainId: number): string {
  return isSupportedChainId(chainId)
    ? CHAIN_CONFIGS[chainId].name
    : `Unknown Chain (${chainId})`;
}

/**
 * Block explorer URL for an address on a supported chain.
 */
export function getBlockExplorerUrl(chainId: number, address: string): string {
  if (chainId === mainnet.id) {
    return `https://etherscan.io/address/${address}`;
  }
  return `https://sepolia.etherscan.io/address/${address}`;
}

/**
 * wagmi transport map built from the shared RPC URLs.
 */
export const wagmiTransports = {
  [mainnet.id]: http(RPC_URLS[mainnet.id]),
  [sepolia.id]: http(RPC_URLS[sepolia.id]),
};

/**
 * Create a viem public client for a supported chain using the shared dRPC
 * endpoint. Use this instead of `createPublicClient({ transport: http() })`,
 * which would fall back to viem's default public RPC.
 */
export function createAppPublicClient(
  chainId: SupportedChainId,
): PublicClient {
  const { chain } = CHAIN_CONFIGS[chainId];
  return createPublicClient({
    chain,
    transport: http(RPC_URLS[chainId]),
  });
}
