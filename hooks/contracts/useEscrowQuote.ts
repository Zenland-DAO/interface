"use client";

import { useMemo } from "react";
import { useReadContract, useChainId, useConnection } from "wagmi";
import { type Address, type Hex, zeroAddress } from "viem";

import { escrowFactoryAbi, type EscrowQuote } from "@/lib/contracts/abis/escrowFactory";
import { getContractAddresses } from "@/lib/contracts";
import { humanizeBlockchainError } from "@/lib/blockchain/errors";

/**
 * Parameters for the useEscrowQuote hook.
 */
export interface UseEscrowQuoteParams {
  /** User-provided salt for deterministic address generation */
  userSalt: Hex | undefined;
  /** Token address for payment */
  token: Address | undefined;
  /** Escrow amount in token's native units */
  amount: bigint | undefined;
  /** Agent address (null for locked escrow without agent) */
  agent: Address | null;
  /** Version hint (0 = use default version) */
  versionHint?: number;
  /** Whether to enable the query */
  enabled?: boolean;
}

/**
 * Return type for the useEscrowQuote hook.
 */
export interface UseEscrowQuoteReturn {
  /** Quote data containing predicted address and fees */
  quote: EscrowQuote | undefined;
  /** Predicted escrow address */
  predictedEscrow: Address | undefined;
  /** Creation fee in token units */
  creationFee: bigint | undefined;
  /** Agent assignment fee in token units (0 if no agent) */
  assignmentFee: bigint | undefined;
  /** Total amount to approve (amount + creationFee + assignmentFee) */
  totalApprovalNeeded: bigint | undefined;
  /** Version that will be used for escrow creation */
  versionUsed: bigint | undefined;
  /** Final salt computed from userSalt and buyer */
  finalSalt: Hex | undefined;
  /** Whether the query is loading */
  isLoading: boolean;
  /** Whether the query encountered an error */
  isError: boolean;
  /** Error object if any */
  error: Error | null;
  /** Refetch the quote */
  refetch: () => void;
}

/**
 * Hook for getting escrow creation quotes.
 *
 * Fetches the predicted escrow address, fees, and other creation parameters
 * from the EscrowFactory contract. Dynamically calls either `quoteCreateEscrow`
 * or `quoteCreateEscrowWithAgent` based on agent presence.
 *
 * @param params - Quote parameters
 * @returns Quote data and loading state
 *
 * @example
 * ```tsx
 * const { quote, totalApprovalNeeded, isLoading } = useEscrowQuote({
 *   userSalt,
 *   token: USDC_ADDRESS,
 *   amount: parseUnits("100", 6),
 *   agent: selectedAgentAddress, // or null for locked escrow
 * });
 * ```
 */
export function useEscrowQuote({
  userSalt,
  token,
  amount,
  agent,
  versionHint = 0,
  enabled = true,
}: UseEscrowQuoteParams): UseEscrowQuoteReturn {
  const chainId = useChainId();
  const { address: buyerAddress } = useConnection();

  // Get contract addresses for current chain
  const contractAddresses = useMemo(
    () => getContractAddresses(chainId),
    [chainId]
  );

  // Determine if we have an agent
  const hasAgent = agent !== null && agent !== zeroAddress;

  // Check if all required params are available
  const canQuery = useMemo(
    () =>
      enabled &&
      !!userSalt &&
      !!buyerAddress &&
      !!token &&
      amount !== undefined &&
      amount > BigInt(0) &&
      !!contractAddresses?.escrowFactory,
    [enabled, userSalt, buyerAddress, token, amount, contractAddresses]
  );

  // Query without agent (quoteCreateEscrow)
  const {
    data: quoteWithoutAgent,
    isLoading: isLoadingWithoutAgent,
    isError: isErrorWithoutAgent,
    error: errorWithoutAgent,
    refetch: refetchWithoutAgent,
  } = useReadContract({
    address: contractAddresses?.escrowFactory as Address,
    abi: escrowFactoryAbi,
    functionName: "quoteCreateEscrow",
    args:
      canQuery && !hasAgent
        ? [
            userSalt as Hex,
            buyerAddress as Address,
            token as Address,
            amount as bigint,
            BigInt(versionHint),
          ]
        : undefined,
    query: {
      enabled: canQuery && !hasAgent,
    },
  });

  // Query with agent (quoteCreateEscrowWithAgent)
  const {
    data: quoteWithAgent,
    isLoading: isLoadingWithAgent,
    isError: isErrorWithAgent,
    error: errorWithAgent,
    refetch: refetchWithAgent,
  } = useReadContract({
    address: contractAddresses?.escrowFactory as Address,
    abi: escrowFactoryAbi,
    functionName: "quoteCreateEscrowWithAgent",
    args:
      canQuery && hasAgent
        ? [
            userSalt as Hex,
            buyerAddress as Address,
            agent as Address,
            token as Address,
            amount as bigint,
            BigInt(versionHint),
          ]
        : undefined,
    query: {
      enabled: canQuery && hasAgent,
    },
  });

  // Select the appropriate result based on agent presence
  const quoteData = hasAgent ? quoteWithAgent : quoteWithoutAgent;
  const isLoading = hasAgent ? isLoadingWithAgent : isLoadingWithoutAgent;
  const isError = hasAgent ? isErrorWithAgent : isErrorWithoutAgent;
  const error = hasAgent ? errorWithAgent : errorWithoutAgent;
  const refetch = hasAgent ? refetchWithAgent : refetchWithoutAgent;

  // Parse the quote data
  const quote = useMemo<EscrowQuote | undefined>(() => {
    if (!quoteData) return undefined;

    return {
      predictedEscrow: quoteData.predictedEscrow,
      finalSalt: quoteData.finalSalt,
      versionUsed: quoteData.versionUsed,
      creationFee: quoteData.creationFee,
      assignmentFee: quoteData.assignmentFee,
    };
  }, [quoteData]);

  // Calculate total approval needed
  const totalApprovalNeeded = useMemo(() => {
    if (!quote || amount === undefined) return undefined;
    return amount + quote.creationFee + quote.assignmentFee;
  }, [quote, amount]);

  return {
    quote,
    predictedEscrow: quote?.predictedEscrow,
    creationFee: quote?.creationFee,
    assignmentFee: quote?.assignmentFee,
    totalApprovalNeeded,
    versionUsed: quote?.versionUsed,
    finalSalt: quote?.finalSalt,
    isLoading,
    isError,
    error: error ? new Error(humanizeBlockchainError(error)) : null,
    refetch,
  };
}

/**
 * Hook for getting the minimum buyer protection time from the factory.
 */
export function useMinBuyerProtectionTime() {
  const chainId = useChainId();
  const contractAddresses = useMemo(
    () => getContractAddresses(chainId),
    [chainId]
  );

  const { data, isLoading, error } = useReadContract({
    address: contractAddresses?.escrowFactory as Address,
    abi: escrowFactoryAbi,
    functionName: "MIN_BUYER_PROTECTION_TIME",
    query: {
      enabled: !!contractAddresses?.escrowFactory,
    },
  });

  return {
    minBuyerProtectionTime: data,
    isLoading,
    error,
  };
}

/**
 * Hook for getting the default version from the factory.
 */
export function useDefaultVersion() {
  const chainId = useChainId();
  const contractAddresses = useMemo(
    () => getContractAddresses(chainId),
    [chainId]
  );

  const { data, isLoading, error } = useReadContract({
    address: contractAddresses?.escrowFactory as Address,
    abi: escrowFactoryAbi,
    functionName: "defaultVersion",
    query: {
      enabled: !!contractAddresses?.escrowFactory,
    },
  });

  return {
    defaultVersion: data,
    isLoading,
    error,
  };
}
