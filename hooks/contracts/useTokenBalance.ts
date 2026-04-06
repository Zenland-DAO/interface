"use client";

import { useReadContract } from "wagmi";
import { type Address } from "viem";
import { erc20Abi } from "@/lib/contracts";

/**
 * Default polling interval for balance queries (15 seconds).
 * Keeps the UI responsive when users deposit funds externally
 * without requiring a manual page refresh.
 */
export const BALANCE_POLL_INTERVAL_MS = 15_000;

export interface UseTokenBalanceArgs {
  tokenAddress: Address | undefined;
  ownerAddress: Address | undefined;
  enabled?: boolean;
  /**
   * Polling interval in milliseconds.
   * Defaults to {@link BALANCE_POLL_INTERVAL_MS} (15 s).
   * Set to `0` to disable polling.
   */
  refetchInterval?: number;
}

/**
 * Read ERC20 balance for the given owner.
 *
 * Keeping this as a dedicated hook helps us stay DRY across
 * escrow creation and agent registration.
 *
 * The balance is automatically polled at a configurable interval so the
 * UI picks up external deposits without a page refresh.
 */
export function useTokenBalance({
  tokenAddress,
  ownerAddress,
  enabled = true,
  refetchInterval = BALANCE_POLL_INTERVAL_MS,
}: UseTokenBalanceArgs): {
  balance: bigint | undefined;
  isLoading: boolean;
  refetch: () => void;
} {
  const {
    data: balance,
    isLoading,
    refetch,
  } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: ownerAddress ? [ownerAddress] : undefined,
    query: {
      enabled: enabled && !!tokenAddress && !!ownerAddress,
      refetchInterval: refetchInterval || undefined,
    },
  });

  return {
    balance,
    isLoading,
    refetch,
  };
}

