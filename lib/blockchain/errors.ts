/**
 * Utility for parsing and humanizing blockchain errors.
 *
 * IMPORTANT:
 * Prefer the shared `parseWeb3Error()` implementation for DRY behavior across the app.
 * This module is kept as the single "friendly message" entrypoint for the UI.
 */

import { parseWeb3Error } from "@/lib/utils/web3-errors";

/**
 * Common error messages for users
 */
export const ERROR_MESSAGES = {
  USER_REJECTED: "Transaction was cancelled in your wallet.",
  INSUFFICIENT_FUNDS: "You don't have enough ETH for gas fees.",
  INSUFFICIENT_BALANCE: "Insufficient token balance for this transaction.",
  ALLOWANCE_REQUIRED: "Token approval is required before this action.",
  CHAIN_MISMATCH: "Please switch to the correct network in your wallet.",
  CONTRACT_REVERT: "The contract call failed. Please check the requirements.",
  PENDING_TRANSACTION: "You already have a pending transaction. Please wait.",
  UNKNOWN: "An unexpected blockchain error occurred.",
  TIMEOUT: "The transaction took too long. Check your wallet for status.",
  GAS_LIMIT_TOO_HIGH: "Transaction simulation failed (gas limit too high). This often means you have insufficient funds to cover the amount plus fees, or the contract requirements were not met.",
};

/**
 * Parses a blockchain error and returns a human-friendly string.
 * @param error The original error object from wagmi/viem/ethers
 * @param fallback A custom fallback message
 * @returns A user-friendly error message
 */
export function humanizeBlockchainError(error: unknown, fallback?: string): string {
  if (!error) return fallback || ERROR_MESSAGES.UNKNOWN;

  // Let the shared error parser do the heavy lifting.
  const parsed = parseWeb3Error(error);
  if (parsed.isUserRejection) return ERROR_MESSAGES.USER_REJECTED;

  // Preserve the existing fallback behavior for callers that want a custom title.
  // (Use parsed.message when it is meaningful.)
  return parsed.message || fallback || ERROR_MESSAGES.UNKNOWN;
}
