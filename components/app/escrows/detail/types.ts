/**
 * Escrow Detail Types
 *
 * TypeScript interfaces for the escrow detail page.
 * These types follow the Single Responsibility Principle - each interface
 * represents a distinct concept in the escrow management flow.
 */

import { type Address, type Hex } from "viem";

// =============================================================================
// ESCROW STATE ENUM (matches Solidity)
// =============================================================================

/**
 * Escrow states matching the smart contract.
 */
export type EscrowState =
  | "PENDING"
  | "ACTIVE"
  | "FULFILLED"
  | "RELEASED"
  | "DISPUTED"
  | "AGENT_INVITED"
  | "AGENT_RESOLVED"
  | "REFUNDED"
  | "SPLIT";

/**
 * Terminal states where no further actions are possible.
 */
export const TERMINAL_STATES: readonly EscrowState[] = [
  "RELEASED",
  "AGENT_RESOLVED",
  "REFUNDED",
  "SPLIT",
] as const;

/**
 * Check if a state is terminal (no further actions possible).
 */
export function isTerminalState(state: EscrowState): boolean {
  return TERMINAL_STATES.includes(state);
}

// =============================================================================
// USER ROLE
// =============================================================================

/**
 * User's role in the escrow.
 * A user can have multiple roles (e.g., buyer in one escrow, seller in another).
 */
export type EscrowRole = "buyer" | "seller" | "agent" | "viewer";

/**
 * Check if the user is a party (buyer or seller).
 */
export function isParty(role: EscrowRole): boolean {
  return role === "buyer" || role === "seller";
}

// =============================================================================
// ESCROW DATA (from indexer)
// =============================================================================

/**
 * Escrow data as returned from the indexer.
 * This matches the schema in ponder.schema.ts.
 */
export interface EscrowData {
  /** Escrow contract address (primary key) */
  id: Address;
  /** Chain ID where this escrow is deployed (1 for mainnet, 11155111 for sepolia) */
  chainId: number;
  /** Buyer's address */
  buyer: Address;
  /** Seller's address */
  seller: Address;
  /** Agent's address (nullable - may not have agent) */
  agent: Address | null;
  /** Token address */
  token: Address;
  /** Escrow amount in token's smallest unit */
  amount: bigint;
  /** Fee paid at creation */
  creationFee: bigint;
  /** Buyer protection time in seconds */
  buyerProtectionTime: bigint;
  /** Calculated seller acceptance deadline (timestamp) */
  sellerAcceptDeadline: bigint;
  /** Hash of the escrow terms */
  termsHash: Hex;
  /** Contract version */
  version: number;
  /** Current state */
  state: EscrowState;
  /** Creation timestamp */
  createdAt: bigint;
  /** Funding timestamp */
  fundedAt: bigint;
  /** Fulfillment timestamp (nullable) */
  fulfilledAt: bigint | null;
  /** Resolution timestamp (nullable) */
  resolvedAt: bigint | null;
  /** Agent invited timestamp (nullable) */
  agentInvitedAt: bigint | null;
  /** Split proposer address (nullable) */
  splitProposer: Address | null;
  /** Proposed buyer split bps (nullable) */
  proposedBuyerBps: number | null;
  /** Proposed seller split bps (nullable) */
  proposedSellerBps: number | null;
  /** Whether buyer approved split (nullable) */
  buyerApprovedSplit: boolean | null;
  /** Whether seller approved split (nullable) */
  sellerApprovedSplit: boolean | null;
  /** Amount received by buyer (nullable, set on resolution) */
  buyerReceived: bigint | null;
  /** Amount received by seller (nullable, set on resolution) */
  sellerReceived: bigint | null;
  /** Agent fee received (nullable, set on agent resolution) */
  agentFeeReceived: bigint | null;
}

// =============================================================================
// SPLIT PROPOSAL
// =============================================================================

/**
 * Split proposal data from the contract.
 */
export interface SplitProposal {
  /** Who proposed the split */
  proposer: Address | null;
  /** Proposed buyer percentage in basis points (0-10000) */
  buyerBps: number;
  /** Proposed seller percentage in basis points (0-10000) */
  sellerBps: number;
  /** Whether buyer has approved */
  buyerApproved: boolean;
  /** Whether seller has approved */
  sellerApproved: boolean;
}

/**
 * Default empty split proposal.
 */
export const EMPTY_SPLIT_PROPOSAL: SplitProposal = {
  proposer: null,
  buyerBps: 0,
  sellerBps: 0,
  buyerApproved: false,
  sellerApproved: false,
};

// =============================================================================
// TRANSACTION LOG (from indexer)
// =============================================================================

/**
 * Transaction log entry from the indexer.
 */
export interface TransactionLogEntry {
  /** Unique ID: "{txHash}-{logIndex}" */
  id: string;
  /** Transaction hash */
  txHash: Hex;
  /** Block number */
  blockNumber: bigint;
  /** Block timestamp */
  timestamp: bigint;
  /** Event name (e.g., "EscrowFunded", "FulfillmentConfirmed") */
  eventName: string;
  /** Contract address that emitted the event */
  contractAddress: Address;
  /** Contract type */
  contractType: "FACTORY" | "AGENT_REGISTRY" | "ESCROW";
  /** Related escrow address (nullable) */
  escrowAddress: Address | null;
  /** Related agent address (nullable) */
  agentAddress: Address | null;
  /** Related user address (nullable) */
  userAddress: Address | null;
  /** Event-specific data as JSON string */
  eventData: string;
}

// =============================================================================
// AVAILABLE ACTIONS
// =============================================================================

/**
 * All possible actions on an escrow.
 */
export type EscrowAction =
  | "accept"
  | "decline"
  | "cancelExpired"
  | "confirmFulfillment"
  | "release"
  | "releaseAfterProtection"
  | "sellerRefund"
  | "openDispute"
  | "inviteAgent"
  | "agentResolve"
  | "claimAgentTimeout"
  | "proposeSplit"
  | "approveSplit"
  | "cancelSplit";

/**
 * Map of actions to their availability status.
 */
export type AvailableActions = Record<EscrowAction, boolean>;

/**
 * Default: all actions unavailable.
 */
export const DEFAULT_AVAILABLE_ACTIONS: AvailableActions = {
  accept: false,
  decline: false,
  cancelExpired: false,
  confirmFulfillment: false,
  release: false,
  releaseAfterProtection: false,
  sellerRefund: false,
  openDispute: false,
  inviteAgent: false,
  agentResolve: false,
  claimAgentTimeout: false,
  proposeSplit: false,
  approveSplit: false,
  cancelSplit: false,
};

// =============================================================================
// TIMER STATE
// =============================================================================

/**
 * Timer state for countdowns (protection period, agent response).
 */
export interface TimerState {
  /** Whether there's a time limit */
  hasLimit: boolean;
  /** Total duration in seconds */
  totalSeconds: number;
  /** Remaining seconds (can be negative if expired) */
  remainingSeconds: number;
  /** Whether the timer has expired */
  isExpired: boolean;
  /** Expiry timestamp (unix seconds) */
  expiryTimestamp: number;
  /** Progress percentage (0-100) */
  progressPercent: number;
}

/**
 * Default timer state (no limit).
 */
export const DEFAULT_TIMER_STATE: TimerState = {
  hasLimit: false,
  totalSeconds: 0,
  remainingSeconds: 0,
  isExpired: true,
  expiryTimestamp: 0,
  progressPercent: 100,
};

// =============================================================================
// DETAIL PAGE STATE
// =============================================================================

/**
 * Current UI state of the detail page.
 */
export type DetailUIState =
  | "idle"
  | "loading"
  | "confirming"
  | "pending"
  | "success"
  | "error";

/**
 * Modal types for confirmation dialogs.
 */
/**
 * Modal types for confirmation dialogs.
 */
export type ConfirmationModalType =
  | "accept"
  | "decline"
  | "cancelExpired"
  | "release"
  | "refund"
  | "dispute"
  | "inviteAgent"
  | "agentResolve"
  | "claimTimeout"
  | "proposeSplit"
  | "approveSplit"
  | null;

/**
 * Complete state for the escrow detail page.
 */
export interface EscrowDetailState {
  /** Escrow data from indexer */
  escrow: EscrowData | null;
  /** Split proposal data from contract */
  splitProposal: SplitProposal;
  /** Current user's role */
  userRole: EscrowRole;
  /** Currently available actions */
  availableActions: AvailableActions;
  /** Seller acceptance timer */
  acceptanceTimer: TimerState;
  /** Buyer protection timer */
  protectionTimer: TimerState;
  /** Agent response timer (when AGENT_INVITED) */
  agentTimer: TimerState;
  /** Current UI state */
  uiState: DetailUIState;
  /** Currently open confirmation modal */
  activeModal: ConfirmationModalType;
  /** Pending action (for optimistic UI) */
  pendingAction: EscrowAction | null;
  /** Error message (if any) */
  errorMessage: string | null;
  /** Last transaction hash (for success state) */
  lastTxHash: Hex | null;
}

/**
 * Default detail page state.
 */
/**
 * Default detail page state.
 */
export const DEFAULT_DETAIL_STATE: EscrowDetailState = {
  escrow: null,
  splitProposal: EMPTY_SPLIT_PROPOSAL,
  userRole: "viewer",
  availableActions: DEFAULT_AVAILABLE_ACTIONS,
  acceptanceTimer: DEFAULT_TIMER_STATE,
  protectionTimer: DEFAULT_TIMER_STATE,
  agentTimer: DEFAULT_TIMER_STATE,
  uiState: "loading",
  activeModal: null,
  pendingAction: null,
  errorMessage: null,
  lastTxHash: null,
};

// =============================================================================
// ACTIONS (REDUCER)
// =============================================================================

/**
 * Actions that can be dispatched to update detail page state.
 */
export type EscrowDetailAction =
  | { type: "SET_ESCROW"; escrow: EscrowData }
  | { type: "SET_SPLIT_PROPOSAL"; proposal: SplitProposal }
  | { type: "SET_USER_ROLE"; role: EscrowRole }
  | { type: "SET_AVAILABLE_ACTIONS"; actions: AvailableActions }
  | {
    type: "UPDATE_TIMERS";
    acceptance: TimerState;
    protection: TimerState;
    agent: TimerState;
  }
  | { type: "SET_UI_STATE"; state: DetailUIState }
  | { type: "OPEN_MODAL"; modal: ConfirmationModalType }
  | { type: "CLOSE_MODAL" }
  | { type: "START_ACTION"; action: EscrowAction }
  | { type: "ACTION_SUCCESS"; txHash: Hex }
  | { type: "ACTION_ERROR"; message: string }
  | { type: "CLEAR_ERROR" }
  | { type: "RESET" };

// =============================================================================
// CONTEXT VALUE
// =============================================================================

/**
 * Computed values derived from state.
 */
export interface EscrowDetailComputed {
  /** Is the escrow in a terminal state */
  isTerminal: boolean;
  /** Is the current user a party (buyer or seller) */
  isParty: boolean;
  /** Is the current user the buyer */
  isBuyer: boolean;
  /** Is the current user the seller */
  isSeller: boolean;
  /** Is the current user the agent */
  isAgent: boolean;
  /** Does this escrow have an assigned agent */
  hasAgent: boolean;
  /** Is there an active split proposal */
  hasActiveSplitProposal: boolean;
  /** Is the current user the split proposer */
  isSplitProposer: boolean;
  /** Can the current user approve the split */
  canApproveSplit: boolean;
  /** Is the protection period expired (for seller release) */
  isProtectionExpired: boolean;
  /** Is the agent response time expired */
  isAgentTimeoutExpired: boolean;
  /** Formatted amount with token symbol */
  formattedAmount: string;
}

/**
 * Value provided by the EscrowDetailContext.
 */
export interface EscrowDetailContextValue {
  /** Current state */
  state: EscrowDetailState;
  /** Computed values */
  computed: EscrowDetailComputed;
  /** Dispatch action to update state */
  dispatch: (action: EscrowDetailAction) => void;
  /** Open confirmation modal */
  openModal: (modal: ConfirmationModalType) => void;
  /** Close confirmation modal */
  closeModal: () => void;
  /** Refetch escrow data */
  refetch: () => Promise<void>;
}

// =============================================================================
// ACTION BUTTON PROPS
// =============================================================================

/**
 * Standard props for action buttons.
 */
export interface ActionButtonProps {
  /** Whether the action is available */
  available: boolean;
  /** Whether the action is currently loading */
  loading: boolean;
  /** Click handler */
  onClick: () => void;
  /** Optional disabled override */
  disabled?: boolean;
}

// =============================================================================
// CONFIRMATION MODAL PROPS
// =============================================================================

/**
 * Props for the confirmation modal.
 */
export interface ConfirmationModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Modal type (determines title, description, etc.) */
  type: ConfirmationModalType;
  /** Close handler */
  onClose: () => void;
  /** Confirm handler */
  onConfirm: () => void;
  /** Whether confirming is in progress */
  isLoading: boolean;
  /** Additional data for the modal (e.g., split percentages) */
  data?: {
    buyerBps?: number;
    sellerBps?: number;
    amount?: string;
  };
}

// =============================================================================
// AGENT RESOLVE INPUT
// =============================================================================

/**
 * Input for agent resolution.
 */
export interface AgentResolveInput {
  /** Buyer percentage in basis points (0-10000) */
  buyerBps: number;
  /** Seller percentage in basis points (0-10000) */
  sellerBps: number;
}

/**
 * Default agent resolve input (50/50 split).
 */
export const DEFAULT_AGENT_RESOLVE_INPUT: AgentResolveInput = {
  buyerBps: 5000,
  sellerBps: 5000,
};

// =============================================================================
// SPLIT PROPOSAL INPUT
// =============================================================================

/**
 * Input for split proposal.
 */
export interface SplitProposalInput {
  /** Buyer percentage in basis points (0-10000) */
  buyerBps: number;
  /** Seller percentage in basis points (0-10000) */
  sellerBps: number;
}

/**
 * Default split proposal input (50/50 split).
 */
export const DEFAULT_SPLIT_PROPOSAL_INPUT: SplitProposalInput = {
  buyerBps: 5000,
  sellerBps: 5000,
};
