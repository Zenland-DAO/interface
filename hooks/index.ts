export { useScrollAnimation, AnimateOnScroll } from "./useScrollAnimation";

// Indexer hooks - Re-exports from SDK for simple hooks
export { useAgents, useAgent, useEscrow } from "@zenland/sdk/react";
export type { GqlAgent, GqlEscrow } from "@zenland/sdk/react";

// Indexer hooks - Interface-specific with added functionality
export { useProtocolStats, type ProtocolStats } from "./indexer/useProtocolStats";
export { useUserStats, useGlobalStats, type UserDashboardStats } from "./indexer/useUserStats";
export {
  useDashboardStats,
  type DashboardViewMode,
  type DashboardStats,
  type UseDashboardStatsReturn,
} from "./indexer/useDashboardStats";

export {
  useAgentEligibilityForEscrow,
  formatUsdLikeAmount,
  type AgentEligibilityStatus,
} from "./indexer/useAgentEligibilityForEscrow";

export {
  useRecentEscrows,
  type RecentEscrow,
} from "./indexer/useRecentEscrows";

// Contract hooks
export {
  useTokenApproval,
  type ApprovalStatus,
  type PermitSignature,
  type UseTokenApprovalReturn,
} from "./contracts/useTokenApproval";

export { useTokenBalance, type UseTokenBalanceArgs } from "./contracts/useTokenBalance";

export {
  useAgentRegistration,
  type RegistrationStatus,
  type RegistrationFormData,
  type ValidationErrors,
  type UseAgentRegistrationReturn,
} from "./contracts/useAgentRegistration";
export { useAgentActions, AgentActionsProvider } from "./contracts/useAgentActions";
export { useRegistryParameters } from "./contracts/useRegistryParameters";

// Escrow hooks
export {
  useEscrows,
  STATE_GROUPS,
  type EscrowRole,
  type EscrowStateTab,
  type UseEscrowsArgs,
} from "./indexer/useEscrows";

export {
  useEscrowQuote,
  useMinBuyerProtectionTime,
  useDefaultVersion,
  type UseEscrowQuoteParams,
  type UseEscrowQuoteReturn,
} from "./contracts/useEscrowQuote";

export {
  useCreateEscrow,
  toCreateEscrowParams,
  type CreateEscrowStatus,
  type UseCreateEscrowReturn,
  type CreateEscrowInput,
} from "./contracts/useCreateEscrow";

// FeeManager hooks
export {
  useTokenValidation,
  useTokenMinimum,
  useCalculateFee,
  useTokenConfig,
  useTreasury,
  useWhitelistedTokens,
  useFeeInfo,
} from "./contracts/useFeeManager";

// Wallet / chain helpers
export { useEnsureChain, type UseEnsureChainArgs, type UseEnsureChainReturn } from "./wallet/useEnsureChain";
export { useNetworkGuard, type UseNetworkGuardOptions, type UseNetworkGuardReturn } from "./wallet/useNetworkGuard";
export { useWalletAction, type UseWalletActionReturn } from "./wallet/useWalletAction";

// Service hooks
export {
  usePdfGeneration,
  type PdfLanguage,
  type GeneratePdfRequest,
  type GeneratePdfResponse,
  type UsePdfGenerationReturn,
} from "./services/usePdfGeneration";
