/**
 * Escrow Detail Constants
 *
 * Configuration constants for the escrow detail page including
 * state colors, labels, modal content, and action descriptions.
 */

import type { EscrowState, EscrowAction, ConfirmationModalType } from "./types";

// =============================================================================
// STATE CONFIGURATION
// =============================================================================

/**
 * Badge color variants for escrow states.
 * Maps to the Badge component's variant prop.
 */
// =============================================================================
// STATE CONFIGURATION
// =============================================================================

/**
 * Badge color variants for escrow states.
 * Maps to the Badge component's variant prop.
 */
export const STATE_COLORS: Record<EscrowState, "primary" | "success" | "warning" | "danger" | "neutral"> = {
  PENDING: "primary",
  ACTIVE: "primary",
  FULFILLED: "warning",
  RELEASED: "success",
  DISPUTED: "danger",
  AGENT_INVITED: "warning",
  AGENT_RESOLVED: "success",
  REFUNDED: "neutral",
  SPLIT: "success",
};

/**
 * Human-readable labels for escrow states.
 */
export const STATE_LABELS: Record<EscrowState, string> = {
  PENDING: "Pending Acceptance",
  ACTIVE: "Active",
  FULFILLED: "Fulfilled",
  RELEASED: "Released",
  DISPUTED: "Disputed",
  AGENT_INVITED: "Agent Invited",
  AGENT_RESOLVED: "Agent Resolved",
  REFUNDED: "Refunded",
  SPLIT: "Split",
};

/**
 * Descriptions for each escrow state.
 */
export const STATE_DESCRIPTIONS: Record<EscrowState, string> = {
  PENDING: "The escrow is funded and waiting for the seller to accept the terms.",
  ACTIVE: "The escrow is active and waiting for the seller to confirm delivery.",
  FULFILLED: "The seller has confirmed fulfillment. Buyer can release funds or wait for protection to expire.",
  RELEASED: "Funds have been released to the seller. This escrow is complete.",
  DISPUTED: "A dispute has been opened. Parties can invite an agent or negotiate a split.",
  AGENT_INVITED: "An agent has been invited to resolve the dispute.",
  AGENT_RESOLVED: "The agent has resolved the dispute. This escrow is complete.",
  REFUNDED: "Funds have been refunded to the buyer. This escrow is complete.",
  SPLIT: "Funds have been split between buyer and seller. This escrow is complete.",
};

// =============================================================================
// ACTION CONFIGURATION
// =============================================================================

/**
 * Human-readable labels for actions.
 */
export const ACTION_LABELS: Record<EscrowAction, string> = {
  accept: "Accept Escrow",
  decline: "Decline Escrow",
  cancelExpired: "Cancel & Refund",
  confirmFulfillment: "Confirm Fulfillment",
  release: "Release Funds",
  releaseAfterProtection: "Claim Funds",
  sellerRefund: "Issue Refund",
  openDispute: "Open Dispute",
  inviteAgent: "Invite Agent",
  agentResolve: "Resolve Dispute",
  claimAgentTimeout: "Claim Agent Timeout",
  proposeSplit: "Propose Split",
  approveSplit: "Approve Split",
  cancelSplit: "Cancel Split Proposal",
};

/**
 * Descriptions for each action.
 */
export const ACTION_DESCRIPTIONS: Record<EscrowAction, string> = {
  accept: "Accept the escrow terms and start the engagement.",
  decline: "Decline the escrow and refund the buyer immediately.",
  cancelExpired: "The seller did not accept in time. Cancel the escrow and get a refund.",
  confirmFulfillment: "Mark the work/delivery as complete and start the buyer protection period.",
  release: "Release the escrowed funds to the seller immediately.",
  releaseAfterProtection: "The protection period has expired. Claim the funds as the seller.",
  sellerRefund: "Return all funds to the buyer. This action cannot be undone.",
  openDispute: "Open a dispute to pause the escrow and seek resolution.",
  inviteAgent: "Invite the assigned agent to help resolve this dispute.",
  agentResolve: "As the agent, decide how to split the funds between parties.",
  claimAgentTimeout: "The agent did not respond in time. Return to dispute state.",
  proposeSplit: "Propose a split of funds between buyer and seller.",
  approveSplit: "Approve the proposed split. If both parties approve, funds are distributed.",
  cancelSplit: "Cancel your split proposal.",
};

/**
 * Button variants for actions.
 */
export const ACTION_BUTTON_VARIANTS: Record<EscrowAction, "primary" | "secondary" | "outline" | "ghost" | "danger"> = {
  accept: "primary",
  decline: "outline",
  cancelExpired: "outline",
  confirmFulfillment: "primary",
  release: "primary",
  releaseAfterProtection: "primary",
  sellerRefund: "danger",
  openDispute: "danger",
  inviteAgent: "secondary",
  agentResolve: "primary",
  claimAgentTimeout: "secondary",
  proposeSplit: "outline",
  approveSplit: "primary",
  cancelSplit: "ghost",
};

// =============================================================================
// CONFIRMATION MODAL CONTENT
// =============================================================================

/**
 * Configuration for confirmation modals.
 */
export interface ModalConfig {
  title: string;
  description: string;
  confirmLabel: string;
  confirmVariant: "primary" | "danger";
  icon: "release" | "refund" | "dispute" | "agent" | "split" | "timeout" | "check" | "x";
}

export const MODAL_CONFIG: Record<NonNullable<ConfirmationModalType>, ModalConfig> = {
  accept: {
    title: "Accept Escrow",
    description: "You are about to accept the escrow terms. This will activate the escrow.",
    confirmLabel: "Accept Escrow",
    confirmVariant: "primary",
    icon: "check",
  },
  decline: {
    title: "Decline Escrow",
    description: "You are about to decline this escrow. The funds will be refunded to the buyer.",
    confirmLabel: "Decline Escrow",
    confirmVariant: "danger",
    icon: "x",
  },
  cancelExpired: {
    title: "Cancel & Refund",
    description: "The seller acceptance window has expired. You can cancel the escrow and get a full refund.",
    confirmLabel: "Cancel & Refund",
    confirmVariant: "primary",
    icon: "refund",
  },
  release: {
    title: "Release Funds",
    description: "You are about to release the escrowed funds to the seller. This action cannot be undone.",
    confirmLabel: "Release Funds",
    confirmVariant: "primary",
    icon: "release",
  },
  refund: {
    title: "Issue Refund",
    description: "You are about to refund all escrowed funds to the buyer. This action cannot be undone.",
    confirmLabel: "Issue Refund",
    confirmVariant: "danger",
    icon: "refund",
  },
  dispute: {
    title: "Open Dispute",
    description: "Opening a dispute will pause the escrow and allow you to seek resolution. You can invite an agent or negotiate a split with the seller.",
    confirmLabel: "Open Dispute",
    confirmVariant: "danger",
    icon: "dispute",
  },
  inviteAgent: {
    title: "Invite Agent",
    description: "The assigned agent will be invited to review and resolve this dispute. The agent will have the authority to decide how funds are distributed.",
    confirmLabel: "Invite Agent",
    confirmVariant: "primary",
    icon: "agent",
  },
  agentResolve: {
    title: "Resolve Dispute",
    description: "As the agent, you will determine how the escrowed funds are split between the buyer and seller. Your decision is final.",
    confirmLabel: "Submit Resolution",
    confirmVariant: "primary",
    icon: "agent",
  },
  claimTimeout: {
    title: "Claim Agent Timeout",
    description: "The agent did not respond within the required time. This will return the escrow to the disputed state with no agent assigned.",
    confirmLabel: "Claim Timeout",
    confirmVariant: "primary",
    icon: "timeout",
  },
  proposeSplit: {
    title: "Propose Split",
    description: "You are proposing a split of the escrowed funds. If the other party approves, the funds will be distributed automatically.",
    confirmLabel: "Propose Split",
    confirmVariant: "primary",
    icon: "split",
  },
  approveSplit: {
    title: "Approve Split",
    description: "You are approving the proposed split. Once confirmed, the funds will be distributed according to the agreed percentages.",
    confirmLabel: "Approve & Execute",
    confirmVariant: "primary",
    icon: "split",
  },
};

// =============================================================================
// TIMELINE EVENT CONFIGURATION
// =============================================================================

/**
 * Event names from the smart contract.
 */
export const ESCROW_EVENTS = {
  PENDING: "EscrowPending",
  ACCEPTED: "SellerAccepted",
  DECLINED: "SellerDeclined",
  CANCELLED_EXPIRED: "EscrowCancelledExpired",
  ACTIVE: "EscrowFunded", // Renamed from FUNDED to ACTIVE in UI, usually implies "Deposited" or "Created" if auto-funded
  // Note: If contract emits EscrowFunded, we map it here. If mostly EscrowPending, we use that.
  FULFILLMENT_CONFIRMED: "FulfillmentConfirmed",
  FUNDS_RELEASED: "FundsReleased",
  DISPUTE_OPENED: "DisputeOpened",
  AGENT_INVITED: "AgentInvited",
  AGENT_RESOLVED: "AgentResolved",
  AGENT_TIMED_OUT: "AgentTimedOut",
  REFUNDED: "Refunded",
  SPLIT_PROPOSED: "SplitProposed",
  SPLIT_APPROVED: "SplitApproved",
  SPLIT_CANCELLED: "SplitProposalCancelled",
  SPLIT_EXECUTED: "SplitExecuted",
} as const;

/**
 * Human-readable labels for timeline events.
 */
export const EVENT_LABELS: Record<string, string> = {
  [ESCROW_EVENTS.PENDING]: "Escrow Created",
  [ESCROW_EVENTS.ACCEPTED]: "Seller Accepted",
  [ESCROW_EVENTS.DECLINED]: "Seller Declined",
  [ESCROW_EVENTS.CANCELLED_EXPIRED]: "Cancelled (Expired)",
  [ESCROW_EVENTS.ACTIVE]: "Escrow Funded",
  [ESCROW_EVENTS.FULFILLMENT_CONFIRMED]: "Fulfillment Confirmed",
  [ESCROW_EVENTS.FUNDS_RELEASED]: "Funds Released",
  [ESCROW_EVENTS.DISPUTE_OPENED]: "Dispute Opened",
  [ESCROW_EVENTS.AGENT_INVITED]: "Agent Invited",
  [ESCROW_EVENTS.AGENT_RESOLVED]: "Dispute Resolved",
  [ESCROW_EVENTS.AGENT_TIMED_OUT]: "Agent Timed Out",
  [ESCROW_EVENTS.REFUNDED]: "Refund Issued",
  [ESCROW_EVENTS.SPLIT_PROPOSED]: "Split Proposed",
  [ESCROW_EVENTS.SPLIT_APPROVED]: "Split Approved",
  [ESCROW_EVENTS.SPLIT_CANCELLED]: "Split Cancelled",
  [ESCROW_EVENTS.SPLIT_EXECUTED]: "Split Executed",
};

/**
 * Icon names for timeline events.
 */
export const EVENT_ICONS: Record<string, "check" | "clock" | "alert" | "user" | "split" | "refresh" | "x"> = {
  [ESCROW_EVENTS.PENDING]: "clock",
  [ESCROW_EVENTS.ACCEPTED]: "check",
  [ESCROW_EVENTS.DECLINED]: "x",
  [ESCROW_EVENTS.CANCELLED_EXPIRED]: "x",
  [ESCROW_EVENTS.ACTIVE]: "check",
  [ESCROW_EVENTS.FULFILLMENT_CONFIRMED]: "check",
  [ESCROW_EVENTS.FUNDS_RELEASED]: "check",
  [ESCROW_EVENTS.DISPUTE_OPENED]: "alert",
  [ESCROW_EVENTS.AGENT_INVITED]: "user",
  [ESCROW_EVENTS.AGENT_RESOLVED]: "check",
  [ESCROW_EVENTS.AGENT_TIMED_OUT]: "clock",
  [ESCROW_EVENTS.REFUNDED]: "refresh",
  [ESCROW_EVENTS.SPLIT_PROPOSED]: "split",
  [ESCROW_EVENTS.SPLIT_APPROVED]: "check",
  [ESCROW_EVENTS.SPLIT_CANCELLED]: "x",
  [ESCROW_EVENTS.SPLIT_EXECUTED]: "check",
};

/**
 * Color variants for timeline events.
 */
export const EVENT_COLORS: Record<string, "success" | "warning" | "danger" | "neutral" | "primary"> = {
  [ESCROW_EVENTS.PENDING]: "primary",
  [ESCROW_EVENTS.ACCEPTED]: "success",
  [ESCROW_EVENTS.DECLINED]: "danger",
  [ESCROW_EVENTS.CANCELLED_EXPIRED]: "neutral",
  [ESCROW_EVENTS.ACTIVE]: "success",
  [ESCROW_EVENTS.FULFILLMENT_CONFIRMED]: "success",
  [ESCROW_EVENTS.FUNDS_RELEASED]: "success",
  [ESCROW_EVENTS.DISPUTE_OPENED]: "danger",
  [ESCROW_EVENTS.AGENT_INVITED]: "warning",
  [ESCROW_EVENTS.AGENT_RESOLVED]: "success",
  [ESCROW_EVENTS.AGENT_TIMED_OUT]: "warning",
  [ESCROW_EVENTS.REFUNDED]: "neutral",
  [ESCROW_EVENTS.SPLIT_PROPOSED]: "primary",
  [ESCROW_EVENTS.SPLIT_APPROVED]: "success",
  [ESCROW_EVENTS.SPLIT_CANCELLED]: "neutral",
  [ESCROW_EVENTS.SPLIT_EXECUTED]: "success",
};

// =============================================================================
// ROLE CONFIGURATION
// =============================================================================

/**
 * Labels for user roles.
 */
export const ROLE_LABELS = {
  buyer: "Buyer",
  seller: "Seller",
  agent: "Agent",
  viewer: "Viewer",
} as const;

/**
 * Role badge colors.
 */
export const ROLE_COLORS = {
  buyer: "primary",
  seller: "success",
  agent: "warning",
  viewer: "neutral",
} as const;

// =============================================================================
// TIME CONSTANTS
// =============================================================================

/**
 * Basis points denominator (100% = 10000).
 */
export const BPS_DENOMINATOR = 10000;

/**
 * Minimum split percentage (0%).
 */
export const MIN_SPLIT_BPS = 0;

/**
 * Maximum split percentage (100%).
 */
export const MAX_SPLIT_BPS = 10000;

/**
 * Timer update interval in milliseconds.
 */
export const TIMER_UPDATE_INTERVAL_MS = 1000;

// =============================================================================
// EXPLORER LINKS
// =============================================================================

/**
 * Block explorer URLs by chain ID.
 */
export const EXPLORER_URLS: Record<number, string> = {
  1: "https://etherscan.io",
  11155111: "https://sepolia.etherscan.io",
  // Add more chains as needed
};

/**
 * Get the explorer URL for a chain.
 */
export function getExplorerUrl(chainId: number): string {
  return EXPLORER_URLS[chainId] || EXPLORER_URLS[11155111]; // Default to Sepolia
}

/**
 * Get the explorer address URL.
 */
export function getAddressExplorerUrl(chainId: number, address: string): string {
  return `${getExplorerUrl(chainId)}/address/${address}`;
}

/**
 * Get the explorer transaction URL.
 */
export function getTxExplorerUrl(chainId: number, txHash: string): string {
  return `${getExplorerUrl(chainId)}/tx/${txHash}`;
}
