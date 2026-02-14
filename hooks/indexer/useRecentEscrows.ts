"use client";

import { useRecentEscrows as useSdkRecentEscrows, type GqlEscrow } from "@zenland/sdk/react";

/** Recent escrow type with normalized BigInt values */
export interface RecentEscrow {
  id: string;
  amount: bigint;
  token: string;
  state: string;
  createdAt: bigint;
}

/**
 * Hook to fetch recent escrows for the activity feed.
 * Optimized for marketing pages with automatic refresh.
 */
export function useRecentEscrows(limit: number = 5) {
  const query = useSdkRecentEscrows({
    limit,
    staleTime: 15 * 1000, // 15 seconds
    refetchInterval: 30 * 1000, // 30 seconds
  });

  // Transform the data to normalize BigInt values
  const normalizedData: RecentEscrow[] | undefined = query.data?.map((escrow: GqlEscrow) => ({
    id: escrow.id,
    amount: BigInt(escrow.amount),
    token: escrow.token,
    state: escrow.state,
    createdAt: BigInt(escrow.createdAt),
  }));

  return {
    ...query,
    data: normalizedData,
  };
}
