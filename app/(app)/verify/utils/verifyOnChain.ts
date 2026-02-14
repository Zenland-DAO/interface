/**
 * On-chain verification utilities
 * 
 * Uses viem to read contract state directly from RPC
 */

import {
  createPublicClient,
  http,
  type Address,
  type Hex,
  type PublicClient,
} from "viem";
import { mainnet, sepolia } from "viem/chains";
import { escrowImplementationAbi } from "@/lib/contracts/abis/escrowImplementation";
import type { OnChainStatus, EscrowStateValue } from "./types";

/**
 * Chain configurations for public clients
 */
const CHAIN_CONFIGS = {
  1: { chain: mainnet, name: "Ethereum Mainnet" },
  11155111: { chain: sepolia, name: "Sepolia Testnet" },
} as const;

export type SupportedChainId = keyof typeof CHAIN_CONFIGS;

/**
 * Get chain name from chain ID
 */
export function getChainName(chainId: number): string {
  const config = CHAIN_CONFIGS[chainId as SupportedChainId];
  return config?.name ?? `Unknown Chain (${chainId})`;
}

/**
 * Check if chain ID is supported
 */
export function isSupportedChain(chainId: number): chainId is SupportedChainId {
  return chainId in CHAIN_CONFIGS;
}

/**
 * Get public client for a chain
 */
function getPublicClient(chainId: SupportedChainId): PublicClient {
  const config = CHAIN_CONFIGS[chainId];
  return createPublicClient({
    chain: config.chain,
    transport: http(),
  });
}

/**
 * Get block explorer URL for an address
 */
export function getBlockExplorerUrl(chainId: number, address: string): string {
  if (chainId === 1) {
    return `https://etherscan.io/address/${address}`;
  }
  return `https://sepolia.etherscan.io/address/${address}`;
}

/**
 * Result from on-chain verification
 */
export interface OnChainVerificationResult {
  status: OnChainStatus;
  state?: EscrowStateValue;
}

/**
 * Verify escrow contract on-chain
 * 
 * Reads termsHash and state from the contract to:
 * 1. Detect if contract exists (not deployed if call returns 0x)
 * 2. Compare PDF hash with on-chain termsHash
 * 3. Get current contract state
 */
export async function verifyOnChain(
  escrowAddress: Address,
  chainId: number,
  pdfHash: Hex
): Promise<OnChainVerificationResult> {
  // Validate chain support
  if (!isSupportedChain(chainId)) {
    return {
      status: {
        status: "error",
        message: `Unsupported chain: ${chainId}`,
      },
    };
  }

  const publicClient = getPublicClient(chainId);

  try {
    // Try to read both termsHash and state in a multicall for efficiency
    const results = await publicClient.multicall({
      contracts: [
        {
          address: escrowAddress,
          abi: escrowImplementationAbi,
          functionName: "termsHash",
        },
        {
          address: escrowAddress,
          abi: escrowImplementationAbi,
          functionName: "state",
        },
      ],
      allowFailure: true,
    });

    const [termsHashResult, stateResult] = results;

    // Check if contract exists - if termsHash call fails, contract doesn't exist
    if (termsHashResult.status === "failure") {
      // Contract doesn't exist or doesn't have termsHash function
      return {
        status: { status: "not_deployed" },
      };
    }

    // If state call fails but termsHash succeeded, something is wrong
    if (stateResult.status === "failure") {
      return {
        status: {
          status: "error",
          message: "Could not read contract state",
        },
      };
    }

    const onChainHash = termsHashResult.result as Hex;
    const state = stateResult.result as number as EscrowStateValue;

    // Compare hashes (case-insensitive)
    const hashMatch = pdfHash.toLowerCase() === onChainHash.toLowerCase();

    if (hashMatch) {
      return {
        status: { status: "hash_match", state },
        state,
      };
    } else {
      return {
        status: {
          status: "hash_mismatch",
          onChainHash,
          pdfHash,
          state,
        },
        state,
      };
    }
  } catch (err) {
    // Handle unexpected errors
    const message = err instanceof Error ? err.message : "Unknown error occurred";
    
    // Check if the error indicates contract doesn't exist
    if (
      message.includes("returned no data") ||
      message.includes("is not a contract") ||
      message.includes("execution reverted")
    ) {
      return {
        status: { status: "not_deployed" },
      };
    }

    return {
      status: {
        status: "error",
        message: `On-chain verification failed: ${message}`,
      },
    };
  }
}
