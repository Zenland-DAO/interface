"use client";

import { useReadContract } from "wagmi";
import { type Address } from "viem";
import { erc20Abi } from "@/lib/contracts";

export interface UseTokenBalanceArgs {
  tokenAddress: Address | undefined;
  ownerAddress: Address | undefined;
  enabled?: boolean;
}

/**
 * Read ERC20 balance for the given owner.
 *
 * Keeping this as a dedicated hook helps us stay DRY across
 * escrow creation and agent registration.
 */
export function useTokenBalance({
  tokenAddress,
  ownerAddress,
  enabled = true,
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
    },
  });

  return {
    balance,
    isLoading,
    refetch,
  };
}

