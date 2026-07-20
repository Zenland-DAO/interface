/**
 * On-chain verification utilities
 *
 * Uses viem to read contract state directly from RPC.
 *
 * RPC endpoints come from the shared `@/lib/rpc` module (dRPC) — NOT viem's
 * default public RPC. Using the default public transport previously caused
 * "invalid key" errors that were misclassified as "contract not deployed".
 */

import { type Address, type Hex } from "viem";
import { escrowImplementationAbi } from "@/lib/contracts/abis/escrowImplementation";
import {
  createAppPublicClient,
  getBlockExplorerUrl,
  getChainName,
  isSupportedChainId,
  type SupportedChainId,
} from "@/lib/rpc";
import type { OnChainStatus, EscrowStateValue } from "./types";

// Re-export shared helpers so existing consumers of this module keep working.
export { getBlockExplorerUrl, getChainName };
export type { SupportedChainId };

/**
 * Check if chain ID is supported.
 *
 * Kept as a named export for backwards compatibility; delegates to the shared
 * RPC module which is the single source of truth for supported chains.
 */
export function isSupportedChain(chainId: number): chainId is SupportedChainId {
  return isSupportedChainId(chainId);
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
 * 1. Detect if contract exists (no bytecode → not deployed)
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

  const publicClient = createAppPublicClient(chainId);

  try {
    // Authoritative deployment check: does the address have bytecode?
    // This distinguishes a genuinely-missing contract from a transport/RPC
    // error (e.g. "invalid key"), which must NOT be reported as not_deployed.
    const bytecode = await publicClient.getBytecode({ address: escrowAddress });
    if (!bytecode || bytecode === "0x") {
      return {
        status: { status: "not_deployed" },
      };
    }

    // Read both termsHash and state in a single multicall for efficiency.
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

    // Contract has bytecode but doesn't expose the expected interface.
    if (termsHashResult.status === "failure") {
      return {
        status: {
          status: "error",
          message: "Contract does not expose a termsHash — not a Zenland escrow",
        },
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
    // Any thrown error here is a transport/RPC-level failure (e.g. network
    // error, "invalid key", rate limiting). These are NOT "contract not
    // deployed" — deployment is checked explicitly via getBytecode above.
    const message = err instanceof Error ? err.message : "Unknown error occurred";
    return {
      status: {
        status: "error",
        message: `On-chain verification failed: ${message}`,
      },
    };
  }
}
