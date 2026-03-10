/**
 * Constants, types, and utilities for the escrows list components.
 * Follows DRY principle - all escrow list logic is centralized here.
 *
 * i18n: String constants use translation keys (resolved via `t()` in
 * consuming components) rather than hardcoded English text.
 */

import type { EscrowRole, EscrowStateTab as SdkEscrowStateTab } from "@zenland/sdk/react";

// Extend SDK type with interface-specific "needs_attention" tab
export type EscrowStateTab = SdkEscrowStateTab | "needs_attention";

// =============================================================================
// TYPES
// =============================================================================

/** Escrow data from the indexer query */
export interface EscrowListItem {
  id: string;
  buyer: string;
  seller: string;
  agent: string | null;
  amount: string;
  token: string;
  state: string;
  createdAt: string;
  fundedAt: string;
  fulfilledAt: string | null;
  sellerAcceptDeadline: string;
  agentInvitedAt: string | null;
  buyerProtectionTime: string;
  splitProposer: string | null;
  buyerApprovedSplit: boolean | null;
  sellerApprovedSplit: boolean | null;
  proposedBuyerBps: number | null;
  proposedSellerBps: number | null;
}

/** User's role in a specific escrow */
export type UserEscrowRole = "buyer" | "seller" | "agent" | "observer";

/** Attention item with reason key (resolved via t() in components) */
export interface AttentionInfo {
  needsAttention: boolean;
  /** Translation key under `escrows.list.attention.*`, or null */
  reasonKey: string | null;
  priority: "high" | "medium" | "low";
}

// =============================================================================
// STATE DISPLAY CONFIGURATION
// =============================================================================

/** State badge color mapping */
export const STATE_COLORS: Record<string, "primary" | "success" | "warning" | "danger" | "neutral"> = {
  PENDING: "warning",
  ACTIVE: "primary",
  FULFILLED: "success",
  RELEASED: "success",
  DISPUTED: "danger",
  AGENT_INVITED: "warning",
  AGENT_RESOLVED: "success",
  REFUNDED: "neutral",
  SPLIT: "neutral",
};

// =============================================================================
// FILTER TAB CONFIGURATION
// =============================================================================

/**
 * State tab values for filtering. Labels are resolved by consuming components
 * via `t("tabs.${tab.value}")` from the `escrows.list` namespace.
 */
export const STATE_TABS: { value: EscrowStateTab }[] = [
  { value: "all" },
  { value: "needs_attention" },
  { value: "ACTIVE" },
  { value: "IN_DISPUTE" },
  { value: "COMPLETED" },
];

/**
 * Role filter values. Labels are resolved by consuming components
 * via `t("roles.${filter.value}")` from the `escrows.list` namespace.
 */
export const ROLE_FILTERS: { value: EscrowRole }[] = [
  { value: "all" },
  { value: "buyer" },
  { value: "seller" },
  { value: "agent" },
];

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Determines the user's role in a specific escrow.
 */
export function getUserRole(
  escrow: EscrowListItem,
  userAddress: string | undefined
): UserEscrowRole {
  if (!userAddress) return "observer";
  
  const address = userAddress.toLowerCase();
  const isBuyer = escrow.buyer.toLowerCase() === address;
  const isSeller = escrow.seller.toLowerCase() === address;
  const isAgent = escrow.agent?.toLowerCase() === address;

  if (isAgent) return "agent";
  if (isBuyer) return "buyer";
  if (isSeller) return "seller";
  return "observer";
}

/**
 * Gets the counterparty address based on user's role.
 * Returns the other party in the transaction.
 */
export function getCounterparty(
  escrow: EscrowListItem,
  userRole: UserEscrowRole
): string | null {
  switch (userRole) {
    case "buyer":
      return escrow.seller;
    case "seller":
      return escrow.buyer;
    case "agent":
      return null; // Agent sees both parties
    default:
      return null;
  }
}

/**
 * Formats an address for display (truncated).
 */
export function formatAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Formats an amount with token decimals.
 */
export function formatAmount(amount: string | bigint, decimals: number = 6): string {
  const value = typeof amount === "string" ? BigInt(amount) : amount;
  const divisor = BigInt(10 ** decimals);
  const whole = value / divisor;
  const fraction = value % divisor;
  
  if (fraction === 0n) {
    return whole.toLocaleString();
  }
  
  const fractionStr = fraction.toString().padStart(decimals, "0").replace(/0+$/, "");
  return `${whole.toLocaleString()}.${fractionStr}`;
}

/**
 * Determines if an escrow needs user attention and why.
 *
 * Returns a `reasonKey` (translation key under `escrows.list.attention.*`)
 * instead of a hardcoded English string. Consuming components resolve it
 * via `t("attention.${reasonKey}")`.
 */
export function getAttentionInfo(
  escrow: EscrowListItem,
  userAddress: string | undefined
): AttentionInfo {
  if (!userAddress) {
    return { needsAttention: false, reasonKey: null, priority: "low" };
  }

  const userRole = getUserRole(escrow, userAddress);
  const now = Math.floor(Date.now() / 1000);

  // Seller needs to accept/decline (PENDING state)
  if (escrow.state === "PENDING" && userRole === "seller") {
    const deadline = Number(escrow.sellerAcceptDeadline);
    if (deadline > 0 && now < deadline) {
      return {
        needsAttention: true,
        reasonKey: "acceptOrDecline",
        priority: "high",
      };
    }
  }

  // Buyer can cancel expired escrow (PENDING, deadline passed)
  if (escrow.state === "PENDING" && userRole === "buyer") {
    const deadline = Number(escrow.sellerAcceptDeadline);
    if (deadline > 0 && now >= deadline) {
      return {
        needsAttention: true,
        reasonKey: "canCancelExpired",
        priority: "medium",
      };
    }
  }

  // Seller can claim funds (FULFILLED, protection expired)
  if (escrow.state === "FULFILLED" && userRole === "seller") {
    const fundedAt = Number(escrow.fundedAt || escrow.createdAt);
    const protectionTime = Number(escrow.buyerProtectionTime);
    const expiresAt = fundedAt + protectionTime;
    
    if (now >= expiresAt) {
      return {
        needsAttention: true,
        reasonKey: "claimFunds",
        priority: "high",
      };
    }
  }

  // Agent needs to resolve (AGENT_INVITED)
  if (escrow.state === "AGENT_INVITED" && userRole === "agent") {
    return {
      needsAttention: true,
      reasonKey: "resolutionNeeded",
      priority: "high",
    };
  }

  // Review split proposal (proposal exists and user hasn't approved)
  if (escrow.splitProposer) {
    const proposerLower = escrow.splitProposer.toLowerCase();
    const userLower = userAddress.toLowerCase();
    
    // User is not the proposer
    if (proposerLower !== userLower) {
      const hasApproved = 
        (userRole === "buyer" && escrow.buyerApprovedSplit) ||
        (userRole === "seller" && escrow.sellerApprovedSplit);
      
      if (!hasApproved) {
        return {
          needsAttention: true,
          reasonKey: "reviewSplit",
          priority: "medium",
        };
      }
    }
  }

  return { needsAttention: false, reasonKey: null, priority: "low" };
}

/**
 * Filters escrows that need attention for the current user.
 */
export function filterEscrowsNeedingAttention(
  escrows: EscrowListItem[],
  userAddress: string | undefined
): EscrowListItem[] {
  if (!userAddress) return [];
  return escrows.filter((escrow) => getAttentionInfo(escrow, userAddress).needsAttention);
}

// =============================================================================
// EMPTY STATE CONFIGURATION
// =============================================================================

interface EmptyStateConfig {
  /** Translation key under `escrows.list.emptyStates.*` for the title */
  titleKey: string;
  /** Translation key under `escrows.list.emptyStates.*` for the description */
  descriptionKey: string;
  showCreateButton: boolean;
}

/**
 * Gets contextual empty state translation keys based on current filters.
 *
 * Returns keys under `escrows.list.emptyStates.*` that consuming components
 * resolve via `t(config.titleKey)` and `t(config.descriptionKey, { role })`.
 */
export function getEmptyStateConfig(
  role: EscrowRole,
  stateTab: EscrowStateTab
): EmptyStateConfig {
  // All roles + All states
  if (role === "all" && stateTab === "all") {
    return {
      titleKey: "emptyStates.noEscrows.title",
      descriptionKey: "emptyStates.noEscrows.description",
      showCreateButton: true,
    };
  }

  // Needs attention tab
  if (stateTab === "needs_attention") {
    return {
      titleKey: "emptyStates.allCaughtUp.title",
      descriptionKey: "emptyStates.allCaughtUp.description",
      showCreateButton: false,
    };
  }

  // State-specific messages
  if (stateTab === "ACTIVE") {
    if (role === "agent") {
      return {
        titleKey: "emptyStates.noActive.title",
        descriptionKey: "emptyStates.noActive.descriptionAgent",
        showCreateButton: false,
      };
    }
    return {
      titleKey: "emptyStates.noActive.title",
      descriptionKey: "emptyStates.noActive.description",
      showCreateButton: true,
    };
  }

  if (stateTab === "IN_DISPUTE") {
    if (role === "agent") {
      return {
        titleKey: "emptyStates.noDisputes.descriptionAgent",
        descriptionKey: "emptyStates.noDisputes.descriptionAgentFull",
        showCreateButton: false,
      };
    }
    return {
      titleKey: "emptyStates.noDisputes.title",
      descriptionKey: "emptyStates.noDisputes.description",
      showCreateButton: false,
    };
  }

  if (stateTab === "COMPLETED") {
    return {
      titleKey: "emptyStates.noCompleted.title",
      descriptionKey: "emptyStates.noCompleted.description",
      showCreateButton: false,
    };
  }

  // Generic fallback
  return {
    titleKey: "emptyStates.generic.title",
    descriptionKey: "emptyStates.generic.description",
    showCreateButton: role !== "agent" && stateTab === "all",
  };
}
