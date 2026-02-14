"use client";

import { useMemo } from "react";
import { useReadContract, useChainId } from "wagmi";
import { agentRegistryAbi, getContractAddresses, isNonZeroAddress } from "@/lib/contracts";
import type { Address } from "viem";

/**
 * Hook to fetch global agent registry parameters.
 */
export function useRegistryParameters() {
  const chainId = useChainId();
  const contracts = useMemo(() => getContractAddresses(chainId), [chainId]);
  const agentRegistryAddress = isNonZeroAddress(contracts?.agentRegistry)
    ? (contracts.agentRegistry as Address)
    : undefined;

  const { data, isLoading, error } = useReadContract({
    address: agentRegistryAddress,
    abi: agentRegistryAbi,
    functionName: "getParameters",
    query: {
      enabled: !!agentRegistryAddress,
      // Cache for 5 minutes as these don't change often
      staleTime: 5 * 60 * 1000,
    },
  });

  const parameters = useMemo(() => {
    if (!data) return null;

    // data is a tuple: [minStablecoinStake, minDaoTokenStake, minFeeBps, maxFeeBps, mavMultiplier, unstakeCooldown]
    const [
      minStablecoinStake,
      minDaoTokenStake,
      minFeeBps,
      maxFeeBps,
      mavMultiplier,
      unstakeCooldown,
    ] = data as [bigint, bigint, bigint, bigint, bigint, bigint];

    return {
      minStablecoinStake,
      minDaoTokenStake,
      minFeeBps: Number(minFeeBps),
      maxFeeBps: Number(maxFeeBps),
      mavMultiplier: Number(mavMultiplier),
      unstakeCooldown: Number(unstakeCooldown),
    };
  }, [data]);

  return {
    parameters,
    isLoading,
    error,
  };
}
