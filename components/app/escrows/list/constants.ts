/**
 * Constants, types, and utilities for the escrows list components.
 * Follows DRY principle - all escrow list logic is centralized here.
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

/** Attention item with reason */
export interface AttentionInfo {
  needsAttention: boolean;
  reason: string | null;
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

/** Human-readable state labels */
export const STATE_LABELS: Record<string, string> = {
  PENDING: "Pending Acceptance",
  ACTIVE: "Active",
  FULFILLED: "Fulfilled",
  RELEASED: "Released",
  DISPUTED: "In Dispute",
  AGENT_INVITED: "Agent Invited",
  AGENT_RESOLVED: "Resolved by Agent",
  REFUNDED: "Refunded",
  SPLIT: "Split Settlement",
};

// =============================================================================
// FILTER TAB CONFIGURATION
// =============================================================================

export const STATE_TABS: { value: EscrowStateTab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "needs_attention", label: "Needs Attention" },
  { value: "ACTIVE", label: "Active" },
  { value: "IN_DISPUTE", label: "In Dispute" },
  { value: "COMPLETED", label: "Completed" },
];

export const ROLE_FILTERS: { value: EscrowRole; label: string }[] = [
  { value: "all", label: "All Roles" },
  { value: "buyer", label: "As Buyer" },
  { value: "seller", label: "As Seller" },
  { value: "agent", label: "As Agent" },
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
 */
export function getAttentionInfo(
  escrow: EscrowListItem,
  userAddress: string | undefined
): AttentionInfo {
  if (!userAddress) {
    return { needsAttention: false, reason: null, priority: "low" };
  }

  const userRole = getUserRole(escrow, userAddress);
  const now = Math.floor(Date.now() / 1000);

  // Seller needs to accept/decline (PENDING state)
  if (escrow.state === "PENDING" && userRole === "seller") {
    const deadline = Number(escrow.sellerAcceptDeadline);
    if (deadline > 0 && now < deadline) {
      return {
        needsAttention: true,
        reason: "Accept or decline escrow",
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
        reason: "Can cancel expired escrow",
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
        reason: "Claim your funds",
        priority: "high",
      };
    }
  }

  // Agent needs to resolve (AGENT_INVITED)
  if (escrow.state === "AGENT_INVITED" && userRole === "agent") {
    return {
      needsAttention: true,
      reason: "Resolution needed",
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
          reason: "Review split proposal",
          priority: "medium",
        };
      }
    }
  }

  return { needsAttention: false, reason: null, priority: "low" };
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
// EMPTY STATE MESSAGES
// =============================================================================

interface EmptyStateConfig {
  title: string;
  description: string;
  showCreateButton: boolean;
}

/**
 * Gets contextual empty state message based on current filters.
 */
export function getEmptyStateConfig(
  role: EscrowRole,
  stateTab: EscrowStateTab
): EmptyStateConfig {
  // All roles + All states
  if (role === "all" && stateTab === "all") {
    return {
      title: "No escrows found",
      description: "You haven't created or participated in any escrow contracts yet.",
      showCreateButton: true,
    };
  }

  // Needs attention tab
  if (stateTab === "needs_attention") {
    return {
      title: "All caught up!",
      description: "No escrows require your attention right now.",
      showCreateButton: false,
    };
  }

  // Role-specific empty states
  const roleLabels: Record<EscrowRole, string> = {
    all: "",
    buyer: "as a buyer",
    seller: "as a seller",
    agent: "as an agent",
  };

  const stateLabels: Record<EscrowStateTab, string> = {
    all: "",
    needs_attention: "",
    ACTIVE: "active",
    IN_DISPUTE: "disputed",
    COMPLETED: "completed",
  };

  const roleLabel = roleLabels[role];
  const stateLabel = stateLabels[stateTab];

  // State-specific messages
  if (stateTab === "ACTIVE") {
    if (role === "agent") {
      return {
        title: "No active escrows",
        description: "You are not assigned as an agent to any active escrows.",
        showCreateButton: false,
      };
    }
    return {
      title: "No active escrows",
      description: `You don't have any active escrows${roleLabel ? ` ${roleLabel}` : ""}.`,
      // (At this point role is narrowed to buyer/seller/all)
      showCreateButton: true,
    };
  }

  if (stateTab === "IN_DISPUTE") {
    if (role === "agent") {
      return {
        title: "No disputes to resolve",
        description: "No disputes are currently assigned to you for resolution.",
        showCreateButton: false,
      };
    }
    return {
      title: "No disputes",
      description: `You don't have any escrows in dispute${roleLabel ? ` ${roleLabel}` : ""}.`,
      showCreateButton: false,
    };
  }

  if (stateTab === "COMPLETED") {
    return {
      title: "No completed escrows",
      description: `No completed escrows found${roleLabel ? ` ${roleLabel}` : ""}.`,
      showCreateButton: false,
    };
  }

  // Generic fallback
  return {
    title: "No escrows found",
    description: `No ${stateLabel} escrows found${roleLabel ? ` ${roleLabel}` : ""}.`,
    showCreateButton: role !== "agent" && stateTab === "all",
  };
}
