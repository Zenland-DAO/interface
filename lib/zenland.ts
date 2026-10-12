import type { ZenlandClientConfig } from "@zenland/sdk/react";

import { appChains, RPC_URLS } from "@/lib/rpc";

/**
 * Zenland SDK config: read protocol data directly from the chain via RPC (no indexer).
 *
 * Every `ZenlandProvider` must use this. SDK hooks rendered outside a provider
 * silently fall back to the indexer's GraphQL API.
 * Module-level so the SDK client (and its in-memory cache) is created once.
 */
export const zenlandConfig: ZenlandClientConfig = {
  rpc: {
    chains: appChains.map((chain) => ({ chainId: chain.id, rpcUrl: RPC_URLS[chain.id] })),
  },
};
