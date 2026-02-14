/**
 * Utility functions exports.
 */

export {
  generateUserSalt,
  isValidBytes32,
  stringToBytes32,
  ZERO_BYTES32,
} from "./salt";

export { parseUserAmountToUnits, normalizeUserAmount, formatAmount } from "./amount";

export { formatUsdValue, formatCompactNumber } from "./format";

export {
  parseWeb3Error,
  getShortErrorMessage,
  isUserRejectionError,
  isNetworkError,
  isContractRevert,
  getEscrowActionError,
  ESCROW_ACTION_ERROR_CONTEXT,
} from "./web3-errors";

export type { ParsedWeb3Error } from "./web3-errors";
