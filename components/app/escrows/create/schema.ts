/**
 * Escrow Creation Validation Schema
 *
 * Zod schemas for validating escrow creation form data.
 * Follows the Single Responsibility Principle with composable schemas.
 */

import { z } from "zod";
import { isAddress, type Address, parseUnits, formatUnits } from "viem";

import {
  ERROR_MESSAGES,
  MAX_CUSTOM_PROTECTION_DAYS,
  MIN_CUSTOM_PROTECTION_DAYS,
  getProtectionTimeSeconds,
  secondsToDays,
} from "./constants";
import {
  type EscrowFormData,
  type BuyerProtectionPreset,
  type LockedEscrowConfirmations,
  areLockedConfirmationsComplete,
} from "./types";

// =============================================================================
// PRIMITIVE SCHEMAS
// =============================================================================

/**
 * Ethereum address validation schema.
 * Validates that the string is a valid checksummed or lowercase Ethereum address.
 */
export const ethereumAddressSchema = z
  .string()
  .refine((val) => !val || isAddress(val), {
    message: ERROR_MESSAGES.sellerAddressInvalid,
  });

/**
 * Required Ethereum address schema.
 */
export const requiredEthereumAddressSchema = z
  .string()
  .min(1, ERROR_MESSAGES.sellerAddressRequired)
  .refine((val) => isAddress(val), {
    message: ERROR_MESSAGES.sellerAddressInvalid,
  });

/**
 * Positive number string schema.
 * Validates that a string represents a positive number.
 */
export const positiveNumberStringSchema = z
  .string()
  .min(1, ERROR_MESSAGES.amountRequired)
  .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: ERROR_MESSAGES.amountTooSmall,
  });

/**
 * Token type schema.
 */
export const tokenTypeSchema = z.enum(["USDC", "USDT"]);

/**
 * Buyer protection preset schema.
 */
export const buyerProtectionPresetSchema = z.enum([
  "7d",
  "14d",
  "30d",
  "custom",
]);

/**
 * Agent selection mode schema.
 */
export const agentSelectionModeSchema = z.enum(["none", "manual", "browsed"]);

// =============================================================================
// LOCKED ESCROW CONFIRMATIONS SCHEMA
// =============================================================================

/**
 * Locked escrow confirmations schema.
 */
export const lockedEscrowConfirmationsSchema = z.object({
  understandNoDispute: z.boolean(),
  understandFundsLocked: z.boolean(),
  acceptRisk: z.boolean(),
});

// =============================================================================
// FORM DATA SCHEMA
// =============================================================================

/**
 * Complete form data schema.
 * Note: This schema validates structure but not cross-field business logic.
 * Business logic validation is handled separately in validateFormData.
 */
export const escrowFormDataSchema = z.object({
  sellerAddress: z.string(),
  tokenType: tokenTypeSchema,
  amount: z.string(),
  buyerProtectionPreset: buyerProtectionPresetSchema,
  customProtectionDays: z.string(),
  terms: z.string(),
  agentAddress: z.string(),
  agentSelectionMode: agentSelectionModeSchema,
  lockedEscrowConfirmations: lockedEscrowConfirmationsSchema,
});

// =============================================================================
// VALIDATION CONTEXT
// =============================================================================

/**
 * Context required for validation.
 * Contains external data needed for validation rules.
 */
export interface ValidationContext {
  /** Connected wallet address (buyer) */
  buyerAddress: Address | undefined;

  /** Minimum buyer protection time in seconds (from contract) */
  minProtectionTimeSeconds: number | undefined;

  /** Token balance of buyer (for amount validation) */
  buyerBalance: bigint | undefined;

  /** Token decimals (for amount parsing) */
  tokenDecimals: number;

  /** Whether to validate locked escrow confirmations */
  validateLockedConfirmations: boolean;
}

/**
 * Default validation context.
 */
export const DEFAULT_VALIDATION_CONTEXT: ValidationContext = {
  buyerAddress: undefined,
  minProtectionTimeSeconds: undefined,
  buyerBalance: undefined,
  tokenDecimals: 6, // Default to USDC/USDT decimals
  validateLockedConfirmations: true,
};

// =============================================================================
// FIELD VALIDATORS
// =============================================================================

/**
 * Validate seller address field.
 */
export function validateSellerAddress(
  value: string,
  context: ValidationContext
): string | undefined {
  if (!value.trim()) {
    return ERROR_MESSAGES.sellerAddressRequired;
  }

  if (!isAddress(value)) {
    return ERROR_MESSAGES.sellerAddressInvalid;
  }

  if (
    context.buyerAddress &&
    value.toLowerCase() === context.buyerAddress.toLowerCase()
  ) {
    return ERROR_MESSAGES.sellerAddressSameAsBuyer;
  }

  return undefined;
}

/**
 * Validate amount field.
 */
export function validateAmount(
  value: string,
  context: ValidationContext
): string | undefined {
  if (!value.trim()) {
    return ERROR_MESSAGES.amountRequired;
  }

  const parsed = parseFloat(value);
  if (isNaN(parsed)) {
    return ERROR_MESSAGES.amountInvalid;
  }

  if (parsed <= 0) {
    return ERROR_MESSAGES.amountTooSmall;
  }

  // Optional: validate against balance
  // This can be expensive, so only do it if balance is provided
  if (context.buyerBalance !== undefined) {
    try {
      const amountInSmallestUnit = BigInt(
        Math.floor(parsed * Math.pow(10, context.tokenDecimals))
      );
      if (amountInSmallestUnit > context.buyerBalance) {
        return ERROR_MESSAGES.amountExceedsBalance;
      }
    } catch {
      return ERROR_MESSAGES.amountInvalid;
    }
  }

  return undefined;
}

/**
 * Validate buyer protection time.
 */
export function validateBuyerProtectionTime(
  preset: BuyerProtectionPreset,
  customDays: string,
  context: ValidationContext
): string | undefined {
  const protectionSeconds = getProtectionTimeSeconds(preset, customDays);

  if (protectionSeconds === 0) {
    if (preset === "custom") {
      const days = parseFloat(customDays);
      if (!customDays.trim() || isNaN(days)) {
        return ERROR_MESSAGES.protectionTimeRequired;
      }
      if (days <= 0) {
        return ERROR_MESSAGES.protectionTimeTooShort(MIN_CUSTOM_PROTECTION_DAYS);
      }
    }
    return ERROR_MESSAGES.protectionTimeRequired;
  }

  // Check minimum from contract
  if (
    context.minProtectionTimeSeconds !== undefined &&
    protectionSeconds < context.minProtectionTimeSeconds
  ) {
    const minDays = Math.ceil(secondsToDays(context.minProtectionTimeSeconds));
    return ERROR_MESSAGES.protectionTimeTooShort(minDays);
  }

  // Check maximum for custom
  if (preset === "custom") {
    const days = parseFloat(customDays);
    if (days > MAX_CUSTOM_PROTECTION_DAYS) {
      return ERROR_MESSAGES.protectionTimeTooLong;
    }
    if (days < MIN_CUSTOM_PROTECTION_DAYS) {
      return ERROR_MESSAGES.protectionTimeTooShort(MIN_CUSTOM_PROTECTION_DAYS);
    }
  }

  return undefined;
}

/**
 * Validate terms field.
 */
export function validateTerms(value: string): string | undefined {
  if (!value.trim()) {
    return ERROR_MESSAGES.termsRequired;
  }

  return undefined;
}

/**
 * Validate agent address field.
 * Note: Agent is optional, but if provided must be valid.
 */
export function validateAgentAddress(
  value: string,
  sellerAddress: string,
  context: ValidationContext
): string | undefined {
  // Empty agent is valid (locked escrow)
  if (!value.trim()) {
    return undefined;
  }

  if (!isAddress(value)) {
    return ERROR_MESSAGES.agentAddressInvalid;
  }

  if (
    context.buyerAddress &&
    value.toLowerCase() === context.buyerAddress.toLowerCase()
  ) {
    return ERROR_MESSAGES.agentAddressSameAsBuyer;
  }

  if (
    sellerAddress &&
    value.toLowerCase() === sellerAddress.toLowerCase()
  ) {
    return ERROR_MESSAGES.agentAddressSameAsSeller;
  }

  // Note: Agent registration check would require async validation
  // This is handled separately in the hook

  return undefined;
}

/**
 * Validate locked escrow confirmations.
 */
export function validateLockedConfirmations(
  confirmations: LockedEscrowConfirmations,
  hasAgent: boolean,
  shouldValidate: boolean
): string | undefined {
  // Only validate if no agent and validation is required
  if (hasAgent || !shouldValidate) {
    return undefined;
  }

  if (!areLockedConfirmationsComplete(confirmations)) {
    return ERROR_MESSAGES.lockedConfirmationsRequired;
  }

  return undefined;
}

// =============================================================================
// COMPLETE FORM VALIDATION
// =============================================================================

/**
 * Validation result type.
 */
export interface ValidationResult {
  /** Whether the form is valid */
  isValid: boolean;
  /** Field-level errors */
  errors: Partial<Record<keyof EscrowFormData, string>>;
}

/**
 * Validate complete form data.
 * Returns field-level errors for inline display.
 *
 * @param formData - Form data to validate
 * @param context - Validation context with external data
 * @returns Validation result with errors
 */
export function validateFormData(
  formData: EscrowFormData,
  context: ValidationContext
): ValidationResult {
  const errors: Partial<Record<keyof EscrowFormData, string>> = {};

  // Validate seller address
  const sellerError = validateSellerAddress(formData.sellerAddress, context);
  if (sellerError) {
    errors.sellerAddress = sellerError;
  }

  // Validate amount
  const amountError = validateAmount(formData.amount, context);
  if (amountError) {
    errors.amount = amountError;
  }

  // Validate buyer protection time
  const protectionError = validateBuyerProtectionTime(
    formData.buyerProtectionPreset,
    formData.customProtectionDays,
    context
  );
  if (protectionError) {
    // Assign to appropriate field based on preset
    if (formData.buyerProtectionPreset === "custom") {
      errors.customProtectionDays = protectionError;
    } else {
      errors.buyerProtectionPreset = protectionError;
    }
  }

  // Validate terms
  const termsError = validateTerms(formData.terms);
  if (termsError) {
    errors.terms = termsError;
  }

  // Validate agent address
  const agentError = validateAgentAddress(
    formData.agentAddress,
    formData.sellerAddress,
    context
  );
  if (agentError) {
    errors.agentAddress = agentError;
  }

  // Validate locked escrow confirmations
  const hasAgent = !!formData.agentAddress.trim() && isAddress(formData.agentAddress);
  const lockedError = validateLockedConfirmations(
    formData.lockedEscrowConfirmations,
    hasAgent,
    context.validateLockedConfirmations
  );
  if (lockedError) {
    errors.lockedEscrowConfirmations = lockedError;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Get visible errors (only for touched fields).
 */
export function getVisibleErrors(
  errors: Partial<Record<keyof EscrowFormData, string>>,
  touchedFields: Set<keyof EscrowFormData>
): Partial<Record<keyof EscrowFormData, string>> {
  const visibleErrors: Partial<Record<keyof EscrowFormData, string>> = {};

  for (const [field, error] of Object.entries(errors)) {
    if (touchedFields.has(field as keyof EscrowFormData) && error) {
      visibleErrors[field as keyof EscrowFormData] = error;
    }
  }

  return visibleErrors;
}

// =============================================================================
// AMOUNT PARSING
// =============================================================================

/**
 * Parse amount string to bigint in token's smallest unit.
 *
 * @param amount - Amount as string (e.g., "100.50")
 * @param decimals - Token decimals
 * @returns Amount in smallest unit, or undefined if invalid
 */
export function parseAmountToBigInt(
  amount: string,
  decimals: number
): bigint | undefined {
  if (!amount.trim()) return undefined;

  try {
    const sanitized = sanitizeDecimalInput(amount);
    if (!sanitized) return undefined;

    const units = parseUnits(sanitized, decimals);
    if (units <= BigInt(0)) return undefined;
    return units;
  } catch {
    return undefined;
  }
}

/**
 * Normalize user-entered decimal string into a canonical representation.
 *
 * Canonicalization rules:
 * - trims whitespace
 * - removes commas
 * - converts ".5" -> "0.5"
 * - converts "1." -> "1.0"
 * - parses into smallest units (parseUnits)
 * - converts back to decimal string (formatUnits)
 *
 * This is used to produce a stable string for hashing so that e.g.
 * "1", "1.0", "1.00" all normalize to "1".
 */
export function normalizeAmountForHash(
  amount: string,
  decimals: number
): string | undefined {
  try {
    const sanitized = sanitizeDecimalInput(amount);
    if (!sanitized) return undefined;

    const units = parseUnits(sanitized, decimals);
    if (units <= BigInt(0)) return undefined;

    return formatUnits(units, decimals);
  } catch {
    return undefined;
  }
}

/**
 * Minimal sanitization for decimal strings we accept from user input.
 * Returns undefined if input is empty after trim.
 */
function sanitizeDecimalInput(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  // Remove common thousands separators ("1,000.5")
  let out = trimmed.replace(/,/g, "");

  // ".5" -> "0.5"
  if (out.startsWith(".")) out = `0${out}`;

  // "1." -> "1.0" (parseUnits rejects trailing dot)
  if (out.endsWith(".")) out = `${out}0`;

  return out;
}

/**
 * Format bigint amount to display string.
 *
 * @param amount - Amount in smallest unit
 * @param decimals - Token decimals
 * @param displayDecimals - Number of decimal places to show
 * @returns Formatted amount string
 */
export function formatAmount(
  amount: bigint,
  decimals: number,
  displayDecimals: number = 2
): string {
  // For display we keep a locale-friendly formatting, but avoid JS floating
  // point math where possible.
  const raw = formatUnits(amount, decimals);
  const asNumber = Number(raw);

  // If the number is too large for JS Number, fall back to the raw string.
  if (!Number.isFinite(asNumber)) return raw;

  return asNumber.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: displayDecimals,
  });
}
