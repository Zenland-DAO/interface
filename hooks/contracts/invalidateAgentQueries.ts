"use client";

import type { QueryClient } from "@tanstack/react-query";
import type { Address } from "viem";

/**
 * Centralized invalidation helper for agent-related SDK queries.
 * Keeps behavior consistent across hooks (staking/update/registration).
 */
export function invalidateAgentQueries(queryClient: QueryClient, address: Address): void {
  queryClient.invalidateQueries({ queryKey: ["zenland", "agent", address] });
  queryClient.invalidateQueries({ queryKey: ["zenland", "agents"] });
}
