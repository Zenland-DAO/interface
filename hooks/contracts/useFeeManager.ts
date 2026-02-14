"use client";

import { useMemo } from "react";
import { useReadContract, useChainId } from "wagmi";
import { type Address } from "viem";

import { feeManagerAbi, type TokenConfig } from "@/lib/contracts/abis/feeManager";
import { getContractAddresses } from "@/lib/contracts";

/**
 * Hook for validating a token against the FeeManager whitelist.
 *
 * @param tokenAddress - The token address to validate
 * @returns Validation result and loading state
 */
export function useTokenValidation(tokenAddress: Address | undefined) {
  const chainId = useChainId();
  const contractAddresses = useMemo(
    () => getContractAddresses(chainId),
    [chainId]
  );

  const { data, isLoading, error, refetch } = useReadContract({
    address: contractAddresses?.feeManager as Address,
    abi: feeManagerAbi,
    functionName: "validateToken",
    args: tokenAddress ? [tokenAddress] : undefined,
    query: {
      enabled: !!contractAddresses?.feeManager && !!tokenAddress,
    },
  });

  return {
    isValid: data ?? false,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook for getting the minimum escrow amount for a token.
 *
 * @param tokenAddress - The token address
 * @returns Minimum amount and loading state
 */
export function useTokenMinimum(tokenAddress: Address | undefined) {
  const chainId = useChainId();
  const contractAddresses = useMemo(
    () => getContractAddresses(chainId),
    [chainId]
  );

  const { data, isLoading, error, refetch } = useReadContract({
    address: contractAddresses?.feeManager as Address,
    abi: feeManagerAbi,
    functionName: "getTokenMinimum",
    args: tokenAddress ? [tokenAddress] : undefined,
    query: {
      enabled: !!contractAddresses?.feeManager && !!tokenAddress,
    },
  });

  return {
    minimum: data,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook for calculating the protocol fee for an escrow amount.
 *
 * @param tokenAddress - The token address
 * @param amount - The escrow amount in token units
 * @returns Calculated fee and loading state
 */
export function useCalculateFee(
  tokenAddress: Address | undefined,
  amount: bigint | undefined
) {
  const chainId = useChainId();
  const contractAddresses = useMemo(
    () => getContractAddresses(chainId),
    [chainId]
  );

  const canQuery =
    !!contractAddresses?.feeManager &&
    !!tokenAddress &&
    amount !== undefined &&
    amount > BigInt(0);

  const { data, isLoading, error, refetch } = useReadContract({
    address: contractAddresses?.feeManager as Address,
    abi: feeManagerAbi,
    functionName: "calculateFee",
    args: canQuery ? [tokenAddress, amount] : undefined,
    query: {
      enabled: canQuery,
    },
  });

  return {
    fee: data,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook for getting the full token configuration from FeeManager.
 *
 * @param tokenAddress - The token address
 * @returns Token configuration and loading state
 */
export function useTokenConfig(tokenAddress: Address | undefined) {
  const chainId = useChainId();
  const contractAddresses = useMemo(
    () => getContractAddresses(chainId),
    [chainId]
  );

  const { data, isLoading, error, refetch } = useReadContract({
    address: contractAddresses?.feeManager as Address,
    abi: feeManagerAbi,
    functionName: "getTokenConfig",
    args: tokenAddress ? [tokenAddress] : undefined,
    query: {
      enabled: !!contractAddresses?.feeManager && !!tokenAddress,
    },
  });

  // Parse the config data
  const config = useMemo<TokenConfig | undefined>(() => {
    if (!data) return undefined;

    return {
      isWhitelisted: data.isWhitelisted,
      minimum: data.minimum,
      feeBps: data.feeBps,
      minFee: data.minFee,
      maxFee: data.maxFee,
    };
  }, [data]);

  return {
    config,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook for getting the treasury address.
 *
 * @returns Treasury address and loading state
 */
export function useTreasury() {
  const chainId = useChainId();
  const contractAddresses = useMemo(
    () => getContractAddresses(chainId),
    [chainId]
  );

  const { data, isLoading, error } = useReadContract({
    address: contractAddresses?.feeManager as Address,
    abi: feeManagerAbi,
    functionName: "treasury",
    query: {
      enabled: !!contractAddresses?.feeManager,
    },
  });

  return {
    treasury: data,
    isLoading,
    error,
  };
}

/**
 * Hook for getting all whitelisted tokens.
 *
 * @returns Array of whitelisted token addresses and loading state
 */
export function useWhitelistedTokens() {
  const chainId = useChainId();
  const contractAddresses = useMemo(
    () => getContractAddresses(chainId),
    [chainId]
  );

  const { data, isLoading, error, refetch } = useReadContract({
    address: contractAddresses?.feeManager as Address,
    abi: feeManagerAbi,
    functionName: "getWhitelistedTokens",
    query: {
      enabled: !!contractAddresses?.feeManager,
    },
  });

  return {
    tokens: data as Address[] | undefined,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Combined hook for getting all fee-related information for a token and amount.
 * Useful for the escrow creation form.
 *
 * @param tokenAddress - The token address
 * @param amount - The escrow amount in token units
 * @returns Combined token and fee information
 */
export function useFeeInfo(
  tokenAddress: Address | undefined,
  amount: bigint | undefined
) {
  const { isValid, isLoading: isValidating, error: validationError } = useTokenValidation(tokenAddress);
  const { config, isLoading: isLoadingConfig, error: configError } = useTokenConfig(tokenAddress);
  const { fee, isLoading: isCalculating, error: feeError } = useCalculateFee(tokenAddress, amount);

  return {
    isValid,
    config,
    fee,
    isLoading: isValidating || isLoadingConfig || isCalculating,
    error: validationError || configError || feeError,
  };
}
