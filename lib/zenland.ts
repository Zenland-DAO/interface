import type { ZenlandClientConfig } from "@zenland/sdk/react";

import { appChains, RPC_URLS } from "@/lib/rpc";

/** Route serving SDK snapshots (see `app/api/zenland/snapshot/route.ts`) */
export const ZENLAND_SNAPSHOT_PATH = "/api/zenland/snapshot";

const chains = appChains.map((chain) => ({ chainId: chain.id, rpcUrl: RPC_URLS[chain.id] }));

/**
 * Server-side SDK config (snapshot route, SSR). Shares one in-memory sync per
 * chain for the whole Node process. Synced at most every 15s: clients fetch
 * the newest blocks themselves, so a slightly older snapshot costs nothing.
 */
export const zenlandServerConfig: ZenlandClientConfig = { rpc: { chains, minSyncIntervalMs: 15_000 } };

/**
 * Zenland SDK config: read protocol data directly from the chain via RPC (no indexer).
 *
 * In the browser, synced data is kept in localStorage so a revisit only fetches
 * new blocks; first visits are seeded from our snapshot route instead of
 * scanning the whole history. Cached data renders right away and is refreshed
 * in the background.
 *
 * Every `ZenlandProvider` must use this. SDK hooks rendered outside a provider
 * silently fall back to the indexer's GraphQL API.
 * Module-level so the SDK client (and its in-memory cache) is created once.
 */
export const zenlandConfig: ZenlandClientConfig =
  typeof window === "undefined"
    ? zenlandServerConfig
    : {
        rpc: {
          chains,
          storage: getLocalStorage(),
          snapshotUrl: ZENLAND_SNAPSHOT_PATH,
          staleWhileRevalidate: true,
        },
      };

/** localStorage, or undefined where access throws (blocked site data) */
function getLocalStorage(): Storage | undefined {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}
