"use client";

import dynamic from "next/dynamic";

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
 */
export function ProtocolStatsSectionClient() {
  return <ProtocolStatsSection />;
}
