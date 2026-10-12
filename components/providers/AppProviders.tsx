"use client";

import { PropsWithChildren, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, type State } from "wagmi";
import { ZenlandProvider, type ZenlandClientConfig } from "@zenland/sdk/react";

import { config } from "@/lib/wagmi/config";
import "@/lib/wagmi/register";
import { appChains, RPC_URLS } from "@/lib/rpc";

/**
 * Read protocol data directly from the chain via RPC (no indexer).
 * Module-level so the SDK client (and its in-memory cache) is created once.
 */
const zenlandConfig: ZenlandClientConfig = {
  rpc: {
    chains: appChains.map((chain) => ({ chainId: chain.id, rpcUrl: RPC_URLS[chain.id] })),
  },
};

type AppProvidersProps = PropsWithChildren<{
  initialState?: State
}>;

export function AppProviders({ children, initialState }: AppProvidersProps) {
  // Create QueryClient once per session.
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Cache data for 5 minutes to avoid "infinite" refetches on navigation
        staleTime: 1000 * 60 * 5,
        // Keep data in cache for 10 minutes
        gcTime: 1000 * 60 * 10,
        // avoidable refetches
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <WagmiProvider config={config} initialState={initialState} reconnectOnMount>
      <QueryClientProvider client={queryClient}>
        <ZenlandProvider config={zenlandConfig}>
          {children}
        </ZenlandProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
