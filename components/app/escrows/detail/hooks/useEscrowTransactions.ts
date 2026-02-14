"use client";

/**
 * useEscrowTransactions Hook
 *
 * Fetches transaction logs for an escrow to display in the timeline.
 */

import { type Address } from "viem";
import { useTransactionLogsByEscrow, type GqlTransactionLog } from "@zenland/sdk/react";
import { type TransactionLogEntry as TypedLogEntry } from "../types";

// =============================================================================
// TYPES
// =============================================================================

export interface UseEscrowTransactionsParams {
  /** Escrow contract address */
  escrowAddress?: Address | string | null;
  /** Whether to enable the query */
  enabled?: boolean;
}

export interface UseEscrowTransactionsReturn {
  /** Transaction logs for timeline */
  transactions: TypedLogEntry[];
  /** Whether the query is loading */
  isLoading: boolean;
  /** Whether there was an error */
  isError: boolean;
  /** Error message if any */
  error: Error | null;
  /** Refetch function */
  refetch: () => Promise<void>;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Transform indexer log entry to typed log entry.
 */
function transformLogEntry(entry: GqlTransactionLog): TypedLogEntry {
  return {
    id: entry.id,
    txHash: entry.txHash as `0x${string}`,
    blockNumber: BigInt(entry.blockNumber),
    timestamp: BigInt(entry.timestamp),
    eventName: entry.eventName,
    contractAddress: entry.contractAddress as Address,
    contractType: entry.contractType as "FACTORY" | "AGENT_REGISTRY" | "ESCROW",
    escrowAddress: entry.escrowAddress as Address | null,
    agentAddress: entry.agentAddress as Address | null,
    userAddress: entry.userAddress as Address | null,
    eventData: entry.eventData,
  };
}

/**
 * Parse eventData JSON string from transaction log.
 */
function parseEventData(eventData: string): Record<string, unknown> {
  try {
    return JSON.parse(eventData);
  } catch {
    return {};
  }
}

// =============================================================================
// HOOK
// =============================================================================

/**
 * Hook to fetch transaction logs for an escrow.
 *
 * @example
 * ```tsx
 * const { transactions, isLoading, refetch } = useEscrowTransactions({
 *   escrowAddress: escrow.id,
 * });
 *
 * return (
 *   <Timeline>
 *     {transactions.map((tx) => (
 *       <TimelineEvent key={tx.id} event={tx} />
 *     ))}
 *   </Timeline>
 * );
 * ```
 */
export function useEscrowTransactions(
  params: UseEscrowTransactionsParams
): UseEscrowTransactionsReturn {
  const { escrowAddress, enabled = true } = params;

  const query = useTransactionLogsByEscrow(escrowAddress, {
    enabled,
    staleTime: 30_000, // Consider data stale after 30 seconds
  });

  return {
    transactions: (query.data ?? []).map(transformLogEntry),
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: async () => {
      await query.refetch();
    },
  };
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get parsed event data from a transaction log entry.
 */
export function getEventData(entry: TypedLogEntry): Record<string, unknown> {
  return parseEventData(entry.eventData);
}

/**
 * Format timestamp for display.
 */
export function formatEventTimestamp(timestamp: bigint): string {
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleString();
}

/**
 * Get relative time string (e.g., "2 hours ago").
 */
export function getRelativeTime(timestamp: bigint): string {
  const now = Math.floor(Date.now() / 1000);
  const eventTime = Number(timestamp);
  const diff = now - eventTime;

  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
  return formatEventTimestamp(timestamp);
}
