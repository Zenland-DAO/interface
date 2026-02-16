/**
 * Escrow Detail Hooks
 *
 * Barrel export for all escrow detail page hooks.
 */

// Role detection
export { useEscrowRole, type UseEscrowRoleParams, type UseEscrowRoleReturn } from "./useEscrowRole";

// Timer management
export {
  useEscrowTimers,
  formatRemainingTime,
  formatExpiryDate,
  type UseEscrowTimersParams,
  type UseEscrowTimersReturn,
} from "./useEscrowTimers";

// Available actions (permission matrix)
export {
  useAvailableActions,
  calculateAvailableActions,
  type UseAvailableActionsParams,
  type UseAvailableActionsReturn,
} from "./useAvailableActions";

// Transaction history
export {
  useEscrowTransactions,
  getEventData,
  formatEventTimestamp,
  getRelativeTime,
  type UseEscrowTransactionsParams,
  type UseEscrowTransactionsReturn,
} from "./useEscrowTransactions";

// Contract write actions
export {
  useEscrowActions,
  type UseEscrowActionsParams,
  type UseEscrowActionsReturn,
} from "./useEscrowActions";

// Chain validation
export {
  useEscrowChainGuard,
  SUPPORTED_CHAIN_IDS,
  type SupportedChainId,
  type UseEscrowChainGuardParams,
  type UseEscrowChainGuardReturn,
} from "./useEscrowChainGuard";
