"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Dynamic import with SSR disabled - must be in a client component
const ProtocolStatsSection = dynamic(
  () => import("./ProtocolStatsSection").then(mod => mod.ProtocolStatsSection),
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
 * Includes its own QueryClientProvider since marketing pages don't have
 * the full AppProviders (for LCP optimization).
 */
export function ProtocolStatsSectionClient() {
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
      <ProtocolStatsSection />
    </QueryClientProvider>
  );
}
