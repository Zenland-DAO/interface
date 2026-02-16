/**
 * Escrow Creation Types
 *
 * TypeScript interfaces for the escrow creation form and wizard.
 * These types follow the Single Responsibility Principle - each interface
 * represents a distinct concept in the escrow creation flow.
 */

import { type Address, type Hex } from "viem";
import { type EscrowQuote } from "@/lib/contracts";

// =============================================================================
// FORM FIELD TYPES
// =============================================================================

/**
 * Buyer protection time preset options.
 */
export type BuyerProtectionPreset = "7d" | "14d" | "30d" | "custom";

/**
 * How the agent was selected.
 */
export type AgentSelectionMode = "none" | "manual" | "browsed";

/**
 * Wizard step identifiers.
 */
export type WizardStep = "form" | "review" | "approve" | "confirm" | "success";

// =============================================================================
// LOCKED ESCROW CONFIRMATIONS
// =============================================================================

/**
 * Required confirmations when creating a locked escrow (no agent).
 * User must acknowledge all risks before proceeding.
 */
export interface LockedEscrowConfirmations {
  /** User understands disputes cannot be resolved without an agent */
  understandNoDispute: boolean;
  /** User understands funds may be locked permanently */
  understandFundsLocked: boolean;
  /** User accepts all risks of a locked escrow */
  acceptRisk: boolean;
}

/**
 * Check if all locked escrow confirmations are complete.
 */
export function areLockedConfirmationsComplete(
  confirmations: LockedEscrowConfirmations
): boolean {
  return (
    confirmations.understandNoDispute &&
    confirmations.understandFundsLocked &&
    confirmations.acceptRisk
  );
}

// =============================================================================
// FORM DATA (User Input)
// =============================================================================

/**
 * Raw form input values as entered by the user.
 * All values are strings to support form input handling.
 */
export interface EscrowFormData {
  /** Seller's Ethereum address */
  sellerAddress: string;

  /** Selected token type (USDC or USDT) */
  tokenType: "USDC" | "USDT";

  /** Escrow amount as entered by user (string for input handling) */
  amount: string;

  /** Selected buyer protection preset */
  buyerProtectionPreset: BuyerProtectionPreset;

  /** Custom protection time in days (used when preset is "custom") */
  customProtectionDays: string;

  /** Contract terms/description for the escrow */
  terms: string;

  /** Agent address (empty string if no agent) */
  agentAddress: string;

  /** How the agent was selected */
  agentSelectionMode: AgentSelectionMode;

  /** Locked escrow risk acknowledgments */
  lockedEscrowConfirmations: LockedEscrowConfirmations;
}

/**
 * Default form data values.
 */
export const DEFAULT_FORM_DATA: EscrowFormData = {
  sellerAddress: "",
  tokenType: "USDC",
  amount: "",
  buyerProtectionPreset: "14d",
  customProtectionDays: "",
  terms: "",
  agentAddress: "",
  agentSelectionMode: "none",
  lockedEscrowConfirmations: {
    understandNoDispute: false,
    understandFundsLocked: false,
    acceptRisk: false,
  },
};

// =============================================================================
// CRITICAL PARAMETERS (For Salt/Quote/PDF Regeneration)
// =============================================================================

/**
 * Parameters that affect the predicted escrow address and PDF content.
 * When ANY of these change, the entire flow must be re-done:
 * salt → quote → PDF
 *
 * These parameters are embedded in the PDF metadata (signed) and the PDF document:
 * - escrowAddress (derived from salt + params)
 * - buyer, seller, agent
 * - token, amount
 * - buyerProtectionTime
 * - terms (in PDF document)
 *
 * IMPORTANT: This list must match what's sent to the PDF service.
 * The termsHash (keccak256 of PDF bytes) is stored on-chain as proof.
 */
export interface QuoteCriticalParams {
  seller: string;
  token: Address;
  amount: string;
  agent: string | null;
  buyerProtectionTime: number;
  terms: string;
}

/**
 * Check if critical params have changed (requires full regeneration).
 * When this returns true, we must: clear salt → clear quote → clear PDF.
 */
export function haveCriticalParamsChanged(
  previous: QuoteCriticalParams | null,
  current: QuoteCriticalParams
): boolean {
  if (!previous) return false;

  return (
    previous.seller.toLowerCase() !== current.seller.toLowerCase() ||
    previous.token.toLowerCase() !== current.token.toLowerCase() ||
    previous.amount !== current.amount ||
    (previous.agent?.toLowerCase() ?? null) !==
      (current.agent?.toLowerCase() ?? null) ||
    previous.buyerProtectionTime !== current.buyerProtectionTime ||
    previous.terms !== current.terms
  );
}

// =============================================================================
// SALT STATE
// =============================================================================

/**
 * Salt generation state for tracking when/why salt was generated.
 */
export interface SaltState {
  /** The generated salt (null if not yet generated) */
  value: Hex | null;

  /** When the salt was generated (timestamp) */
  generatedAt: number | null;

  /** The critical params at time of generation */
  generatedForParams: QuoteCriticalParams | null;
}

/**
 * Default salt state.
 */
export const DEFAULT_SALT_STATE: SaltState = {
  value: null,
  generatedAt: null,
  generatedForParams: null,
};

// =============================================================================
// FORM STATE (Complete Wizard State)
// =============================================================================

/**
 * Complete escrow form state including form data and wizard metadata.
 */
export interface EscrowFormState {
  /** User-entered form data */
  formData: EscrowFormData;

  /** Salt generation state */
  salt: SaltState;

  /** Current quote from the factory contract */
  quote: EscrowQuote | null;

  /** Generated PDF URL (temporary) */
  pdfUrl: string | null;

  /** Hash of the terms for on-chain storage */
  termsHash: Hex | null;

  /** Current wizard step */
  currentStep: WizardStep;

  /** Created escrow address after successful creation */
  createdEscrowAddress: Address | null;

  /** Transaction hash of the creation transaction */
  txHash: Hex | null;

  /** Fields that have been touched (for validation display) */
  touchedFields: Set<keyof EscrowFormData>;

  /** Whether the form is currently submitting */
  isSubmitting: boolean;
}

/**
 * Default form state.
 */
export const DEFAULT_FORM_STATE: Omit<EscrowFormState, "touchedFields"> & {
  touchedFields: Set<keyof EscrowFormData>;
} = {
  formData: DEFAULT_FORM_DATA,
  salt: DEFAULT_SALT_STATE,
  quote: null,
  pdfUrl: null,
  termsHash: null,
  currentStep: "form",
  createdEscrowAddress: null,
  txHash: null,
  touchedFields: new Set(),
  isSubmitting: false,
};

// =============================================================================
// VALIDATION ERRORS
// =============================================================================

/**
 * Validation error messages keyed by field name.
 */
export type FormValidationErrors = Partial<Record<keyof EscrowFormData, string>>;

/**
 * Check if there are any validation errors.
 */
export function hasValidationErrors(errors: FormValidationErrors): boolean {
  return Object.values(errors).some((error) => !!error);
}

// =============================================================================
// FORM ACTIONS
// =============================================================================

/**
 * Actions that can be dispatched to update form state.
 */
export type EscrowFormAction =
  | { type: "SET_FIELD"; field: keyof EscrowFormData; value: unknown }
  | { type: "SET_TOUCHED"; field: keyof EscrowFormData }
  | { type: "SET_ALL_TOUCHED" }
  | { type: "SET_SALT"; salt: SaltState }
  | { type: "REGENERATE_SALT" }
  | { type: "SET_QUOTE"; quote: EscrowQuote | null }
  | { type: "SET_PDF"; url: string | null; termsHash: Hex | null }
  | { type: "SET_STEP"; step: WizardStep }
  | { type: "SET_SUBMITTING"; isSubmitting: boolean }
  | { type: "SET_CREATED_ESCROW"; address: Address; txHash: Hex }
  | { type: "RESET" }
  | { type: "SET_LOCKED_CONFIRMATION"; key: keyof LockedEscrowConfirmations; value: boolean }
  | { type: "SET_AGENT"; address: string; mode: AgentSelectionMode };

// =============================================================================
// COMPUTED VALUES
// =============================================================================

/**
 * Computed/derived values from form state.
 */
export interface EscrowFormComputed {
  /** Whether an agent is assigned */
  hasAgent: boolean;

  /** Whether this is a locked escrow (no agent) */
  isLockedEscrow: boolean;

  /** Buyer protection time in seconds */
  buyerProtectionTimeSeconds: number;

  /** Parsed amount as bigint (in token decimals) */
  amountBigInt: bigint | undefined;

  /** Token address for the selected token */
  tokenAddress: Address | undefined;

  /** Token decimals */
  tokenDecimals: number;

  /** Total approval needed (amount + fees) */
  totalApprovalNeeded: bigint | undefined;

  /** Whether locked escrow confirmations are required */
  requiresLockedConfirmations: boolean;

  /** Whether all required locked confirmations are checked */
  lockedConfirmationsComplete: boolean;

  /** Current critical params for change detection */
  criticalParams: QuoteCriticalParams | null;

  /** Whether critical params have changed since salt generation */
  criticalParamsChanged: boolean;
}

// =============================================================================
// CONTEXT VALUE
// =============================================================================

/**
 * Value provided by the EscrowFormContext.
 */
export interface EscrowFormContextValue {
  /** Current form state */
  state: EscrowFormState;

  /** Computed/derived values */
  computed: EscrowFormComputed;

  /** Validation errors */
  errors: FormValidationErrors;

  /** Whether the form is valid */
  isValid: boolean;

  /** Dispatch action to update state */
  dispatch: (action: EscrowFormAction) => void;

  /** Update a single field */
  setField: <K extends keyof EscrowFormData>(
    field: K,
    value: EscrowFormData[K]
  ) => void;

  /** Mark a field as touched */
  setTouched: (field: keyof EscrowFormData) => void;

  /** Set agent with mode */
  setAgent: (address: string, mode: AgentSelectionMode) => void;

  /** Set locked escrow confirmation */
  setLockedConfirmation: (
    key: keyof LockedEscrowConfirmations,
    value: boolean
  ) => void;

  /** Generate or regenerate salt */
  generateSalt: () => void;

  /** Navigate to a step */
  goToStep: (step: WizardStep) => void;

  /** Reset the form */
  reset: () => void;
}
