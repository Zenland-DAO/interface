"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

// Dynamic import with SSR disabled - must be in a client component.
// The ZenlandProvider is loaded in the same lazy chunk: without it the SDK hooks
// fall back to the indexer's GraphQL API instead of reading the chain via RPC.
// React Query lives in the lazy chunk too, so marketing pages don't ship it (or the
// viem/wagmi chunk webpack groups it with) in their initial JavaScript.
const ProtocolStatsSection = dynamic(
  async () => {
    const [{ ProtocolStatsSection }, { ZenlandProvider }, { zenlandConfig }, { QueryClient, QueryClientProvider }] =
      await Promise.all([
        import("./ProtocolStatsSection"),
        import("@zenland/sdk/react"),
        import("@/lib/zenland"),
        import("@tanstack/react-query"),
      ]);
    return function ProtocolStatsSectionWithProvider() {
      // Create a standalone QueryClient for the stats section
      const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 10, // 10 minutes
            refetchOnWindowFocus: false,
          },
        },
      }));

      return (
        <QueryClientProvider client={queryClient}>
          <ZenlandProvider config={zenlandConfig}>
            <ProtocolStatsSection />
          </ZenlandProvider>
        </QueryClientProvider>
      );
    };
  },
  {
    ssr: false,
    loading: () => (
      <div className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-64 bg-neutral-100 dark:bg-neutral-800 rounded-2xl animate-pulse" />
        </div>
      </div>
    )
  }
);

/**
 * Client wrapper for ProtocolStatsSection that handles SSR.
 * This wrapper uses dynamic import with ssr: false to avoid React Query
 * hydration issues with the SDK hooks.
 *
 * The lazy chunk includes its own QueryClientProvider since marketing pages don't
 * have the full AppProviders (for LCP optimization).
 */
export function ProtocolStatsSectionClient() {
  return <ProtocolStatsSection />;
}
