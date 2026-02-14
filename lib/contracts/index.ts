/**
 * Contract configuration exports.
 *
 * Provides multichain-ready contract addresses, token configs, and ABIs.
 */

// Addresses
export {
  CONTRACT_ADDRESSES,
  SUPPORTED_CHAIN_IDS,
  getContractAddresses,
  isSupportedChain,
  isNonZeroAddress,
  isChainReady,
  type SupportedChainId,
} from "./addresses";

// Tokens
export {
  TOKEN_CONFIGS,
  getStablecoins,
  getTokenConfig,
  getDaoToken,
  getTokenByAddress,
  tokenSupportsPermit,
  type TokenConfig,
  type TokenType,
  type StablecoinType,
} from "./tokens";

// ABIs
export { agentRegistryAbi } from "./abis/agentRegistry";
export { erc20Abi, PERMIT_TYPES } from "./abis/erc20";
export {
  escrowFactoryAbi,
  type CreateEscrowParams,
  type PermitParams,
  type EscrowQuote,
} from "./abis/escrowFactory";
export {
  feeManagerAbi,
  type TokenConfig as FeeManagerTokenConfig,
} from "./abis/feeManager";

// Permit helpers
export { EMPTY_PERMIT, toPermitParams, type PermitParams as PermitParamsTuple } from "./permit";
