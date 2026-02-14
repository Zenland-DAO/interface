"use client";

/**
 * useEscrowRole Hook
 *
 * Detects the connected user's role in an escrow (buyer, seller, agent, or viewer).
 */

import { useMemo } from "react";
import { useAccount } from "wagmi";
import { type Address, zeroAddress } from "viem";

import { type EscrowRole } from "../types";

// =============================================================================
// TYPES
// =============================================================================

export interface UseEscrowRoleParams {
  /** Buyer address from escrow */
  buyer?: Address | null;
  /** Seller address from escrow */
  seller?: Address | null;
  /** Agent address from escrow (may be null/zeroAddress) */
  agent?: Address | null;
}

export interface UseEscrowRoleReturn {
  /** User's role in the escrow */
  role: EscrowRole;
  /** Is the user the buyer */
  isBuyer: boolean;
  /** Is the user the seller */
  isSeller: boolean;
  /** Is the user the agent */
  isAgent: boolean;
  /** Is the user a party (buyer or seller) */
  isParty: boolean;
  /** Is the user just viewing (not involved) */
  isViewer: boolean;
  /** Connected wallet address (for convenience) */
  userAddress: Address | undefined;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Compare two addresses case-insensitively.
 */
function addressesEqual(a?: Address | null, b?: Address | null): boolean {
  if (!a || !b) return false;
  return a.toLowerCase() === b.toLowerCase();
}

/**
 * Check if an address is a valid non-zero address.
 */
function isValidAddress(addr?: Address | null): addr is Address {
  return !!addr && addr !== zeroAddress;
}

// =============================================================================
// HOOK
// =============================================================================

/**
 * Hook to detect the connected user's role in an escrow.
 *
 * @example
 * ```tsx
 * const { role, isBuyer, isSeller, isParty } = useEscrowRole({
 *   buyer: escrow.buyer,
 *   seller: escrow.seller,
 *   agent: escrow.agent,
 * });
 *
 * if (isBuyer) {
 *   // Show buyer-specific actions
 * }
 * ```
 */
export function useEscrowRole(params: UseEscrowRoleParams): UseEscrowRoleReturn {
  const { buyer, seller, agent } = params;
  const { address: userAddress } = useAccount();

  const result = useMemo<UseEscrowRoleReturn>(() => {
    // Default to viewer if no wallet connected
    if (!userAddress) {
      return {
        role: "viewer",
        isBuyer: false,
        isSeller: false,
        isAgent: false,
        isParty: false,
        isViewer: true,
        userAddress: undefined,
      };
    }

    const isBuyer = addressesEqual(userAddress, buyer);
    const isSeller = addressesEqual(userAddress, seller);
    const isAgent = isValidAddress(agent) && addressesEqual(userAddress, agent);

    // Determine primary role (buyer takes precedence over seller if somehow same address)
    let role: EscrowRole = "viewer";
    if (isBuyer) {
      role = "buyer";
    } else if (isSeller) {
      role = "seller";
    } else if (isAgent) {
      role = "agent";
    }

    return {
      role,
      isBuyer,
      isSeller,
      isAgent,
      isParty: isBuyer || isSeller,
      isViewer: role === "viewer",
      userAddress,
    };
  }, [userAddress, buyer, seller, agent]);

  return result;
}
