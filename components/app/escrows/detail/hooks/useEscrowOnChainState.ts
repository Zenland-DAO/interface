"use client";

/**
 * useEscrowOnChainState Hook
 *
 * Reads escrow state directly from the on-chain contract via RPC multicall.
 * This provides the **authoritative** source of truth for action gating,
 * bypassing the indexer which may be stale after recent transactions.
 *
 * Reads in a single multicall (1 RPC roundtrip):
 * - state()              → determines all available actions
 * - agent()              → changes after claimAgentTimeout (becomes address(0))
 * - fulfilledAt()        → needed for protection timer (releaseAfterProtection)
 * - agentInvitedAt()     → needed for agent timeout timer (claimAgentTimeout)
 * - agentResponseTimeSnapshot() → needed for agent timeout calculation
 * - splitProposer()      → needed for approveSplit / cancelSplit gating
 * - proposedBuyerBps()   → needed for approveSplit params + UI
 * - proposedSellerBps()  → needed for approveSplit params + UI
 * - buyerApprovedSplit()  → needed for split approval UI
 * - sellerApprovedSplit() → needed for split approval UI
 */

import { useMemo } from "react";
import { type Address, zeroAddress } from "viem";
import { useReadContracts } from "wagmi";

import { escrowImplementationAbi } from "@/lib/contracts/abis/escrowImplementation";
import type { EscrowState } from "../types";

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * Maps the Solidity EscrowState enum (uint8) to our string union type.
 * Must match EscrowTypes.EscrowState ordering in the contract.
 */
const STATE_ENUM_MAP: Record<number, EscrowState> = {
  0: "PENDING",
  1: "ACTIVE",
  2: "FULFILLED",
  3: "RELEASED",
  4: "DISPUTED",
  5: "AGENT_INVITED",
  6: "AGENT_RESOLVED",
  7: "REFUNDED",
  8: "SPLIT",
};

// =============================================================================
// TYPES
// =============================================================================

/**
 * On-chain escrow state — authoritative data read directly from the contract.
 */
export interface OnChainEscrowState {
  /** Current escrow state (mapped from uint8 enum) */
  state: EscrowState;
  /** Agent address (may become address(0) after claimAgentTimeout) */
  agent: Address;
  /** Timestamp when fulfillment was confirmed (0 if not fulfilled) */
  fulfilledAt: bigint;
  /** Timestamp when agent was invited (0 if not invited) */
  agentInvitedAt: bigint;
  /** Snapshotted agent response timeout duration in seconds */
  agentResponseTime: bigint;
  /** Address of the current split proposer (address(0) if no proposal) */
  splitProposer: Address;
  /** Proposed buyer percentage in basis points */
  proposedBuyerBps: number;
  /** Proposed seller percentage in basis points */
  proposedSellerBps: number;
  /** Whether buyer has approved the current split */
  buyerApprovedSplit: boolean;
  /** Whether seller has approved the current split */
  sellerApprovedSplit: boolean;
}

export interface UseEscrowOnChainStateParams {
  /** Escrow contract address */
  escrowAddress: Address;
  /** Chain ID where the escrow is deployed */
  chainId: number;
}

export interface UseEscrowOnChainStateReturn {
  /** Parsed on-chain state (null while loading or on error) */
  data: OnChainEscrowState | null;
  /** Whether the initial load is in progress */
  isLoading: boolean;
  /** Whether any fetch (initial or refetch) is in progress */
  isFetching: boolean;
  /** Error from the RPC call */
  error: Error | null;
  /** Refetch on-chain state (call after successful actions) */
  refetch: () => Promise<void>;
}

// =============================================================================
// HOOK
// =============================================================================

/**
 * Reads escrow state directly from the on-chain contract via multicall.
 *
 * All 10 view function calls are batched into a single RPC roundtrip.
 * Auto-refetches on window focus to catch state changes from other sessions.
 *
 * @example
 * ```tsx
 * const { data: onChain, isLoading, refetch } = useEscrowOnChainState({
 *   escrowAddress: "0x...",
 *   chainId: 11155111,
 * });
 *
 * // Use on-chain state as authority for actions
 * const authorativeState = onChain?.state ?? indexerState;
 * ```
 */
export function useEscrowOnChainState(
  params: UseEscrowOnChainStateParams,
): UseEscrowOnChainStateReturn {
  const { escrowAddress, chainId } = params;

  // Build the multicall contract config (shared across all reads)
  const contractBase = {
    address: escrowAddress,
    abi: escrowImplementationAbi,
    chainId: chainId as 1 | 11155111,
  } as const;

  // Batch all view function reads into a single multicall
  const {
    data: results,
    isLoading,
    isFetching,
    error,
    refetch: wagmiRefetch,
  } = useReadContracts({
    contracts: [
      { ...contractBase, functionName: "state" },               // 0
      { ...contractBase, functionName: "agent" },               // 1
      { ...contractBase, functionName: "fulfilledAt" },         // 2
      { ...contractBase, functionName: "agentInvitedAt" },      // 3
      { ...contractBase, functionName: "agentResponseTimeSnapshot" }, // 4
      { ...contractBase, functionName: "splitProposer" },       // 5
      { ...contractBase, functionName: "proposedBuyerBps" },    // 6
      { ...contractBase, functionName: "proposedSellerBps" },   // 7
      { ...contractBase, functionName: "buyerApprovedSplit" },  // 8
      { ...contractBase, functionName: "sellerApprovedSplit" }, // 9
    ],
    query: {
      enabled: !!escrowAddress,
      // Refetch on window focus to catch changes from other sessions/tabs
      refetchOnWindowFocus: true,
      // Keep data fresh — don't serve stale cache for action gating
      staleTime: 0,
    },
  });

  // Parse multicall results into typed state
  const data = useMemo<OnChainEscrowState | null>(() => {
    if (!results) return null;

    // Check that all calls succeeded
    const allSucceeded = results.every((r) => r.status === "success");
    if (!allSucceeded) {
      console.warn(
        "[useEscrowOnChainState] Some multicall reads failed:",
        results.filter((r) => r.status !== "success"),
      );
      return null;
    }

    const stateRaw = results[0].result as number;
    const state = STATE_ENUM_MAP[stateRaw];
    if (!state) {
      console.error("[useEscrowOnChainState] Unknown state enum value:", stateRaw);
      return null;
    }

    const agent = (results[1].result as Address) ?? zeroAddress;
    const splitProposerRaw = (results[5].result as Address) ?? zeroAddress;

    return {
      state,
      agent,
      fulfilledAt: (results[2].result as bigint) ?? 0n,
      agentInvitedAt: (results[3].result as bigint) ?? 0n,
      agentResponseTime: (results[4].result as bigint) ?? 0n,
      splitProposer: splitProposerRaw === zeroAddress ? zeroAddress : splitProposerRaw,
      proposedBuyerBps: Number((results[6].result as bigint) ?? 0n),
      proposedSellerBps: Number((results[7].result as bigint) ?? 0n),
      buyerApprovedSplit: (results[8].result as boolean) ?? false,
      sellerApprovedSplit: (results[9].result as boolean) ?? false,
    };
  }, [results]);

  // Wrap refetch to match our async void signature
  const refetch = async () => {
    await wagmiRefetch();
  };

  return {
    data,
    isLoading,
    isFetching,
    error: error ?? null,
    refetch,
  };
}
