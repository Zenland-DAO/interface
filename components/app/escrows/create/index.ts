/**
 * Escrow Creation Module
 *
 * This module provides all the building blocks for the escrow creation wizard:
 * - Type definitions
 * - Constants and configuration
 * - Validation schemas
 * - React Context for state management
 * - Composable hooks
 *
 * @example
 * ```tsx
 * import {
 *   EscrowFormProvider,
 *   useEscrowForm,
 *   BUYER_PROTECTION_PRESETS,
 * } from '@/components/app/escrows/create';
 *
 * function CreateEscrowPage() {
 *   return (
 *     <EscrowFormProvider>
 *       <CreateEscrowWizard />
 *     </EscrowFormProvider>
 *   );
 * }
 * ```
 */

// =============================================================================
// TYPES
// =============================================================================

export {
  // Form field types
  type BuyerProtectionPreset,
  type AgentSelectionMode,
  type WizardStep,

  // Data structures
  type LockedEscrowConfirmations,
  type EscrowFormData,
  type QuoteCriticalParams,
  type SaltState,
  type EscrowFormState,
  type FormValidationErrors,
  type EscrowFormAction,
  type EscrowFormComputed,
  type EscrowFormContextValue,

  // Default values
  DEFAULT_FORM_DATA,
  DEFAULT_SALT_STATE,
  DEFAULT_FORM_STATE,

  // Utility functions
  areLockedConfirmationsComplete,
  haveCriticalParamsChanged,
  hasValidationErrors,
} from "./types";

// =============================================================================
// CONSTANTS
// =============================================================================

export {
  // Time constants
  SECONDS_PER_MINUTE,
  SECONDS_PER_HOUR,
  SECONDS_PER_DAY,

  // Buyer protection
  BUYER_PROTECTION_PRESETS,
  type BuyerProtectionOption,
  getPresetOption,
  getProtectionTimeSeconds,
  secondsToDays,
  daysToSeconds,
  formatDuration,

  // Validation limits
  MIN_ESCROW_AMOUNT,
  MAX_CUSTOM_PROTECTION_DAYS,
  MIN_CUSTOM_PROTECTION_DAYS,

  // UI constants
  VALIDATION_DEBOUNCE_MS,
  QUOTE_DEBOUNCE_MS,
  DISPLAY_DECIMALS,

  // Error messages
  ERROR_MESSAGES,

  // Locked escrow warnings
  LOCKED_ESCROW_WARNINGS,

  // Token support
  SUPPORTED_ESCROW_TOKENS,
  type SupportedEscrowToken,
  isSupportedEscrowToken,
} from "./constants";

// =============================================================================
// VALIDATION SCHEMA
// =============================================================================

export {
  // Zod schemas
  ethereumAddressSchema,
  requiredEthereumAddressSchema,
  positiveNumberStringSchema,
  tokenTypeSchema,
  buyerProtectionPresetSchema,
  agentSelectionModeSchema,
  lockedEscrowConfirmationsSchema,
  escrowFormDataSchema,

  // Validation context
  type ValidationContext,
  DEFAULT_VALIDATION_CONTEXT,

  // Field validators
  validateSellerAddress,
  validateAmount,
  validateBuyerProtectionTime,
  validateTerms,
  validateAgentAddress,
  validateLockedConfirmations,

  // Full form validation
  type ValidationResult,
  validateFormData,
  getVisibleErrors,

  // Amount utilities
  parseAmountToBigInt,
  formatAmount,
} from "./schema";

// =============================================================================
// CONTEXT
// =============================================================================

export {
  // Provider
  EscrowFormProvider,
  type EscrowFormProviderProps,

  // Main hook
  useEscrowFormContext,

  // Selector hooks (optimized for specific use cases)
  useEscrowFormData,
  useEscrowFormComputed,
  useEscrowFormValidation,
  useEscrowWizardStep,
} from "./EscrowFormContext";

// =============================================================================
// HOOKS
// =============================================================================

export {
  // Master hook
  useEscrowForm,
  type UseEscrowFormReturn,
  type StepValidation,
  type SubmissionStatus,

  // Agent selection utilities
  useAgentSelectionListener,
  useAgentSelectionOpener,
} from "./useEscrowForm";

export {
  // Agent selection sender (for agents page)
  useAgentSelectionSender,
  type UseAgentSelectionSenderReturn,
  type AgentSelectedMessage,
  AGENT_SELECTED_MESSAGE_TYPE,
  AGENT_SELECTION_CHANNEL,
} from "./useAgentSelectionSender";

// =============================================================================
// COMPONENTS
// =============================================================================

export {
  AgentSelector,
  type AgentSelectorProps,
} from "./AgentSelector";

export {
  WizardProgress,
  type WizardProgressProps,
} from "./WizardProgress";

export {
  CreateEscrowWizard,
  type CreateEscrowWizardProps,
} from "./CreateEscrowWizard";

// Step Components
export {
  FormStep,
  ReviewStep,
  ApproveStep,
  ConfirmStep,
  SuccessStep,
} from "./steps";
