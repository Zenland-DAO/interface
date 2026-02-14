"use client";

import type { QueryClient } from "@tanstack/react-query";
import type { Address } from "viem";

/**
 * Centralized invalidation helper for agent-related indexer queries.
 * Keeps behavior consistent across hooks (staking/update/registration).
 */
export function invalidateAgentQueries(queryClient: QueryClient, address: Address): void {
  queryClient.invalidateQueries({ queryKey: ["indexer", "agent", address] });
  queryClient.invalidateQueries({ queryKey: ["indexer", "agents"] });
}
