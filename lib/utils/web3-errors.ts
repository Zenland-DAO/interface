/**
 * Web3 Error Handling Utilities
 *
 * Parses blockchain errors and provides user-friendly messages.
 * Logs full error details to console for debugging while
 * displaying clean messages to users.
 */

import { BaseError, ContractFunctionRevertedError } from "viem";

// =============================================================================
// ERROR TYPES
// =============================================================================

/**
 * Parsed web3 error with user-friendly message.
 */
export interface ParsedWeb3Error {
  /** User-friendly error message */
  message: string;
  /** Original error code (if available) */
  code?: string;
  /** Whether the error is a user rejection */
  isUserRejection: boolean;
  /** Whether the error is a network error */
  isNetworkError: boolean;
  /** Whether the error is a contract revert */
  isContractRevert: boolean;
  /** The contract error name (if contract revert) */
  contractErrorName?: string;
  /** The original error for debugging */
  originalError: unknown;
}

// =============================================================================
// ESCROW CONTRACT ERROR MAPPINGS
// =============================================================================

/**
 * Escrow contract error names to user-friendly messages.
 * These match the errors in EscrowErrors.sol.
 */
const ESCROW_ERROR_MESSAGES: Record<string, string> = {
  // Access control errors
  Escrow__NotBuyer: "Only the buyer can perform this action.",
  Escrow__NotSeller: "Only the seller can perform this action.",
  Escrow__NotAgent: "Only the assigned agent can perform this action.",
  Escrow__NotParty: "Only the buyer or seller can perform this action.",

  // State errors
  Escrow__InvalidState: "This action is not available in the current escrow state.",
  Escrow__AlreadyFinalized: "This escrow has already been finalized.",

  // Protection period errors
  Escrow__ProtectionPeriodActive: "The buyer protection period is still active. Please wait for it to expire.",

  // Agent errors
  Escrow__NoAgentAssigned: "No agent is assigned to this escrow.",
  Escrow__AgentUnavailable: "The assigned agent is no longer available.",
  Escrow__AgentTimeoutNotReached: "The agent response timeout has not been reached yet.",
  Escrow__InvalidAgentFee: "The agent fee configuration is invalid.",

  // Acceptance errors
  Escrow__AcceptanceWindowActive: "The seller acceptance window has not expired yet. Please wait for the deadline to pass.",

  // Split errors
  Escrow__InvalidSplitPercentages: "Split percentages must add up to 100%.",
  Escrow__NoSplitProposal: "There is no active split proposal to approve.",
  Escrow__CannotApproveOwnProposal: "You cannot approve your own split proposal.",
  Escrow__SplitProposalChanged: "The split proposal has changed. Please review the new terms.",

  // General errors
  Escrow__ZeroAddress: "Invalid address: zero address is not allowed.",
  Escrow__ZeroAmount: "Amount must be greater than zero.",
  Escrow__TransferFailed: "Token transfer failed. Please check your balance and try again.",
};

/**
 * Factory contract error names to user-friendly messages.
 */
const FACTORY_ERROR_MESSAGES: Record<string, string> = {
  Factory__InvalidToken: "The selected token is not supported.",
  Factory__AmountBelowMinimum: "The escrow amount is below the minimum required.",
  Factory__InvalidAgent: "The selected agent is not valid.",
  Factory__BuyerCannotBeSeller: "Buyer and seller must be different addresses.",
  Factory__InsufficientFee: "Insufficient fee provided.",
  Factory__InvalidProtectionTime: "The protection time is invalid.",
};

/**
 * Agent Registry error names to user-friendly messages.
 */
const AGENT_REGISTRY_ERROR_MESSAGES: Record<string, string> = {
  // New (EscrowErrors.Agent__*) errors
  Agent__NotEscrow: "Only a valid escrow contract can call this function.",
  Agent__AlreadyRegistered: "This wallet is already registered as an agent.",
  Agent__NotRegistered: "This agent is not registered.",
  Agent__StablecoinStakeTooLow: "Stablecoin stake is below the minimum required.",
  Agent__DaoTokenStakeTooLow: "DAO token stake is below the minimum required.",
  Agent__FeeOutOfBounds: "Fee must be within the allowed range.",
  Agent__DescriptionTooLong: "Description is too long.",
  Agent__ContactTooLong: "Contact info is too long.",
  Agent__TokenDecimalsExceedWad: "Selected token has too many decimals.",
  Agent__StablecoinNotAccepted: "Selected stablecoin is not accepted.",
  Agent__HasActiveCases: "Agent has active cases and cannot unstake.",
  Agent__MustBeUnavailable: "You must set availability to unavailable before unstaking.",
  Agent__EngagementCooldownActive: "Engagement cooldown is still active.",
  Agent__SlashExceedsStake: "Slash amount exceeds the agent's available stake.",
  Agent__DaoTokenIsZeroAddress: "DAO token address is not configured.",
  Agent__FactoryIsZeroAddress: "Escrow factory address is not configured.",
  Agent__FeeManagerIsZeroAddress: "Fee manager address is not configured.",
  Agent__PermitFailed: "Permit failed and allowance is insufficient.",

  // Legacy placeholders (kept in case older deployments/clients emit these)
  AgentRegistry__NotRegistered: "This agent is not registered.",
  AgentRegistry__AlreadyRegistered: "This agent is already registered.",
  AgentRegistry__InsufficientStake: "Insufficient stake to perform this action.",
  AgentRegistry__AgentBusy: "This agent has active cases and cannot be modified.",
  AgentRegistry__CooldownActive: "Please wait for the cooldown period to end.",
};

/** FeeManager contract error names to user-friendly messages. */
const FEE_MANAGER_ERROR_MESSAGES: Record<string, string> = {
  Fee__TokenNotWhitelisted: "The selected token is not whitelisted.",
  Fee__TokenAlreadyWhitelisted: "This token is already whitelisted.",
  Fee__TokenIsZeroAddress: "Invalid token address.",
  Fee__TreasuryIsZeroAddress: "Treasury address is not configured.",
  Fee__MinimumIsZero: "Minimum amount cannot be zero.",
  Fee__MinFeeExceedsMaxFee: "Fee configuration is invalid (min fee exceeds max fee).",
  Fee__FeeBpsExceedsMax: "Fee is too high.",
};

/**
 * All contract error mappings combined.
 */
const CONTRACT_ERROR_MESSAGES: Record<string, string> = {
  ...ESCROW_ERROR_MESSAGES,
  ...FACTORY_ERROR_MESSAGES,
  ...AGENT_REGISTRY_ERROR_MESSAGES,
  ...FEE_MANAGER_ERROR_MESSAGES,
};

// =============================================================================
// WALLET/PROVIDER ERROR PATTERNS
// =============================================================================

/**
 * Patterns for detecting user rejection.
 */
const USER_REJECTION_PATTERNS = [
  "user rejected",
  "user denied",
  "rejected by user",
  "user cancelled",
  "user canceled",
  "action_rejected",
  "ACTION_REJECTED",
  "4001", // EIP-1193 user rejection code
];

/**
 * Patterns for detecting network errors.
 */
const NETWORK_ERROR_PATTERNS = [
  "network error",
  "failed to fetch",
  "connection refused",
  "timeout",
  "ETIMEDOUT",
  "ECONNREFUSED",
  "network request failed",
  "could not detect network",
];

/**
 * Patterns for detecting insufficient funds.
 */
const INSUFFICIENT_FUNDS_PATTERNS = [
  "insufficient funds",
  "exceeds balance",
  "not enough",
  "insufficient balance",
];

// =============================================================================
// ERROR PARSING FUNCTIONS
// =============================================================================

/**
 * Check if an error message matches any pattern in the list.
 */
function matchesPattern(message: string, patterns: string[]): boolean {
  const lowerMessage = message.toLowerCase();
  return patterns.some((pattern) => lowerMessage.includes(pattern.toLowerCase()));
}

/**
 * Extract contract error name from a viem error.
 */
function extractContractErrorName(error: unknown): string | undefined {
  if (error instanceof BaseError) {
    const revertError = error.walk(
      (err) => err instanceof ContractFunctionRevertedError
    );

    if (revertError instanceof ContractFunctionRevertedError) {
      return revertError.data?.errorName;
    }
  }

  // Try to extract from error message
  const errorString = String(error);
  const match = errorString.match(/reverted with custom error '(\w+)'/);
  if (match) {
    return match[1];
  }

  // Try another common pattern
  const match2 = errorString.match(/error (\w+__\w+)/);
  if (match2) {
    return match2[1];
  }

  return undefined;
}

/**
 * Get a user-friendly message for a contract error.
 */
function getContractErrorMessage(errorName: string): string {
  return (
    CONTRACT_ERROR_MESSAGES[errorName] ||
    `Contract error: ${errorName.replace(/__/g, ": ").replace(/([A-Z])/g, " $1").trim()}`
  );
}

/**
 * Parse a web3 error into a user-friendly format.
 */
export function parseWeb3Error(error: unknown): ParsedWeb3Error {
  // Log full error to console for debugging
  console.error("[Web3 Error]", error);

  const errorString = error instanceof Error ? error.message : String(error);

  // Check for user rejection
  if (matchesPattern(errorString, USER_REJECTION_PATTERNS)) {
    return {
      message: "Transaction was cancelled.",
      isUserRejection: true,
      isNetworkError: false,
      isContractRevert: false,
      originalError: error,
    };
  }

  // Check for network errors
  if (matchesPattern(errorString, NETWORK_ERROR_PATTERNS)) {
    return {
      message: "Network error. Please check your connection and try again.",
      isUserRejection: false,
      isNetworkError: true,
      isContractRevert: false,
      originalError: error,
    };
  }

  // Check for insufficient funds
  if (matchesPattern(errorString, INSUFFICIENT_FUNDS_PATTERNS)) {
    return {
      message: "Insufficient funds for this transaction.",
      isUserRejection: false,
      isNetworkError: false,
      isContractRevert: true,
      originalError: error,
    };
  }

  // Check for contract revert
  const contractErrorName = extractContractErrorName(error);
  if (contractErrorName) {
    // For certain errors, try to include parameter context when viem provides args.
    let message = getContractErrorMessage(contractErrorName);
    try {
      if (
        contractErrorName === "Agent__DescriptionTooLong" ||
        contractErrorName === "Agent__ContactTooLong"
      ) {
        if (error instanceof BaseError) {
          const revertError = error.walk((err) => err instanceof ContractFunctionRevertedError);
          if (revertError instanceof ContractFunctionRevertedError) {
            const args = revertError.data?.args as unknown[] | undefined;
            const length = typeof args?.[0] === "bigint" ? Number(args?.[0]) : args?.[0];
            const maxLength = typeof args?.[1] === "bigint" ? Number(args?.[1]) : args?.[1];
            if (typeof length === "number" && typeof maxLength === "number") {
              message = `${message} (${length}/${maxLength} bytes)`;
            }
          }
        }
      }
    } catch {
      // ignore decoding issues; fall back to generic message
    }

    return {
      message,
      contractErrorName,
      isUserRejection: false,
      isNetworkError: false,
      isContractRevert: true,
      originalError: error,
    };
  }

  // Check for generic revert
  if (errorString.includes("reverted") || errorString.includes("revert")) {
    // Try to extract a reason
    const reasonMatch = errorString.match(/reason="([^"]+)"/);
    if (reasonMatch) {
      return {
        message: reasonMatch[1],
        isUserRejection: false,
        isNetworkError: false,
        isContractRevert: true,
        originalError: error,
      };
    }

    return {
      message: "Transaction failed. The contract rejected this action.",
      isUserRejection: false,
      isNetworkError: false,
      isContractRevert: true,
      originalError: error,
    };
  }

  // Check for gas estimation errors
  if (errorString.includes("gas") && errorString.includes("estimate")) {
    return {
      message: "Unable to estimate gas. This transaction may fail.",
      isUserRejection: false,
      isNetworkError: false,
      isContractRevert: true,
      originalError: error,
    };
  }

  // Default error
  return {
    message: "An unexpected error occurred. Please try again.",
    isUserRejection: false,
    isNetworkError: false,
    isContractRevert: false,
    originalError: error,
  };
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get a short error message suitable for toasts.
 */
export function getShortErrorMessage(error: unknown): string {
  const parsed = parseWeb3Error(error);

  // For user rejection, return empty to allow silent handling
  if (parsed.isUserRejection) {
    return "";
  }

  // Truncate long messages for toasts
  const maxLength = 100;
  if (parsed.message.length > maxLength) {
    return parsed.message.substring(0, maxLength - 3) + "...";
  }

  return parsed.message;
}

/**
 * Check if an error is a user rejection (should not show error toast).
 */
export function isUserRejectionError(error: unknown): boolean {
  return parseWeb3Error(error).isUserRejection;
}

/**
 * Check if an error is a network error (should show retry option).
 */
export function isNetworkError(error: unknown): boolean {
  return parseWeb3Error(error).isNetworkError;
}

/**
 * Check if an error is a contract revert (actionable by user).
 */
export function isContractRevert(error: unknown): boolean {
  return parseWeb3Error(error).isContractRevert;
}

// =============================================================================
// ESCROW-SPECIFIC ERROR HELPERS
// =============================================================================

/**
 * Error messages for specific escrow actions.
 * These provide more context than generic contract errors.
 */
export const ESCROW_ACTION_ERROR_CONTEXT: Record<string, string> = {
  confirmFulfillment: "Unable to confirm fulfillment",
  release: "Unable to release funds",
  releaseAfterProtection: "Unable to claim funds",
  sellerRefund: "Unable to issue refund",
  openDispute: "Unable to open dispute",
  inviteAgent: "Unable to invite agent",
  agentResolve: "Unable to resolve dispute",
  claimAgentTimeout: "Unable to claim timeout",
  proposeSplit: "Unable to propose split",
  approveSplit: "Unable to approve split",
  cancelSplit: "Unable to cancel split",
};

/**
 * Get a contextualized error message for an escrow action.
 */
export function getEscrowActionError(action: string, error: unknown): string {
  const parsed = parseWeb3Error(error);
  const context = ESCROW_ACTION_ERROR_CONTEXT[action] || "Action failed";

  if (parsed.isUserRejection) {
    return "";
  }

  return `${context}: ${parsed.message}`;
}
