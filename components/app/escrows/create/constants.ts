/**
 * Escrow Creation Constants
 *
 * Configuration values and utilities for the escrow creation form.
 * These constants are used for validation, UI display, and business logic.
 */

import { type BuyerProtectionPreset } from "./types";

// =============================================================================
// TIME CONSTANTS
// =============================================================================

/**
 * Number of seconds in common time units.
 */
export const SECONDS_PER_MINUTE = 60;
export const SECONDS_PER_HOUR = 60 * SECONDS_PER_MINUTE;
export const SECONDS_PER_DAY = 24 * SECONDS_PER_HOUR;

// =============================================================================
// BUYER PROTECTION PRESETS
// =============================================================================

/**
 * Buyer protection preset configuration.
 */
export interface BuyerProtectionOption {
  /** Preset key */
  value: BuyerProtectionPreset;
  /** Display label */
  label: string;
  /** Duration in days (null for custom) */
  days: number | null;
  /** Duration in seconds (null for custom) */
  seconds: number | null;
  /** Description for tooltip/help text */
  description: string;
}

/**
 * Available buyer protection time presets.
 * Ordered from shortest to longest, with custom at the end.
 */
export const BUYER_PROTECTION_PRESETS: readonly BuyerProtectionOption[] = [
  {
    value: "7d",
    label: "7 Days",
    days: 7,
    seconds: 7 * SECONDS_PER_DAY,
    description: "Standard protection for quick transactions",
  },
  {
    value: "14d",
    label: "14 Days",
    days: 14,
    seconds: 14 * SECONDS_PER_DAY,
    description: "Recommended for most transactions",
  },
  {
    value: "30d",
    label: "30 Days",
    days: 30,
    seconds: 30 * SECONDS_PER_DAY,
    description: "Extended protection for complex deliverables",
  },
  {
    value: "custom",
    label: "Custom",
    days: null,
    seconds: null,
    description: "Set a custom protection period",
  },
] as const;

/**
 * Get preset option by value.
 */
export function getPresetOption(
  preset: BuyerProtectionPreset
): BuyerProtectionOption | undefined {
  return BUYER_PROTECTION_PRESETS.find((p) => p.value === preset);
}

/**
 * Get protection time in seconds from preset or custom days.
 *
 * @param preset - Selected preset value
 * @param customDays - Custom days (used when preset is "custom")
 * @returns Protection time in seconds, or 0 if invalid
 */
export function getProtectionTimeSeconds(
  preset: BuyerProtectionPreset,
  customDays: string
): number {
  const option = getPresetOption(preset);

  if (!option) return 0;

  if (preset === "custom") {
    const days = parseFloat(customDays);
    if (isNaN(days) || days <= 0) return 0;
    return Math.floor(days * SECONDS_PER_DAY);
  }

  return option.seconds ?? 0;
}

/**
 * Convert seconds to days (for display).
 */
export function secondsToDays(seconds: number): number {
  return seconds / SECONDS_PER_DAY;
}

/**
 * Convert days to seconds.
 */
export function daysToSeconds(days: number): number {
  return Math.floor(days * SECONDS_PER_DAY);
}

/**
 * Format seconds as human-readable duration.
 */
export function formatDuration(seconds: number): string {
  const days = secondsToDays(seconds);

  if (days >= 1) {
    const wholeDays = Math.floor(days);
    const remainder = days - wholeDays;

    if (remainder === 0) {
      return `${wholeDays} day${wholeDays === 1 ? "" : "s"}`;
    }

    const hours = Math.floor(remainder * 24);
    return `${wholeDays} day${wholeDays === 1 ? "" : "s"} ${hours} hour${hours === 1 ? "" : "s"}`;
  }

  const hours = seconds / SECONDS_PER_HOUR;
  if (hours >= 1) {
    return `${Math.floor(hours)} hour${Math.floor(hours) === 1 ? "" : "s"}`;
  }

  const minutes = seconds / SECONDS_PER_MINUTE;
  return `${Math.floor(minutes)} minute${Math.floor(minutes) === 1 ? "" : "s"}`;
}

// =============================================================================
// VALIDATION LIMITS
// =============================================================================

/**
 * Minimum escrow amount in token's smallest unit.
 * This is a UI-level minimum; the contract may have its own minimum.
 */
export const MIN_ESCROW_AMOUNT = 1;

/**
 * Maximum custom protection days allowed.
 */
export const MAX_CUSTOM_PROTECTION_DAYS = 365;

/**
 * Minimum custom protection days allowed.
 */
export const MIN_CUSTOM_PROTECTION_DAYS = 1;

// =============================================================================
// UI CONSTANTS
// =============================================================================

/**
 * Debounce delay for form validation (ms).
 */
export const VALIDATION_DEBOUNCE_MS = 300;

/**
 * Debounce delay for quote fetching (ms).
 */
export const QUOTE_DEBOUNCE_MS = 500;

/**
 * Number of decimal places to show for token amounts.
 */
export const DISPLAY_DECIMALS = 2;

// =============================================================================
// ERROR MESSAGES
// =============================================================================

/**
 * Validation error messages.
 * Centralized for consistency and easy i18n in the future.
 */
export const ERROR_MESSAGES = {
  // Seller address
  sellerAddressRequired: "Seller address is required",
  sellerAddressInvalid: "Please enter a valid Ethereum address",
  sellerAddressSameAsBuyer: "Seller address cannot be the same as your address",

  // Amount
  amountRequired: "Amount is required",
  amountInvalid: "Please enter a valid amount",
  amountTooSmall: "Amount must be greater than 0",
  amountExceedsBalance: "Amount exceeds your balance",

  // Protection time
  protectionTimeRequired: "Protection time is required",
  protectionTimeTooShort: (minDays: number) =>
    `Protection time must be at least ${minDays} day${minDays === 1 ? "" : "s"}`,
  protectionTimeTooLong: `Protection time cannot exceed ${MAX_CUSTOM_PROTECTION_DAYS} days`,
  protectionTimeInvalid: "Please enter a valid number of days",

  // Terms
  termsRequired: "Contract terms are required",

  // Agent
  agentAddressInvalid: "Please enter a valid agent address",
  agentAddressSameAsBuyer: "Agent cannot be the same as buyer",
  agentAddressSameAsSeller: "Agent cannot be the same as seller",
  agentNotRegistered: "This address is not a registered agent",

  // Locked escrow
  lockedConfirmationsRequired:
    "You must acknowledge all risks to create a locked escrow",

  // General
  walletNotConnected: "Please connect your wallet",
  insufficientAllowance: "Insufficient token allowance",
} as const;

// =============================================================================
// LOCKED ESCROW WARNINGS
// =============================================================================

/**
 * Warning messages for locked escrow creation.
 */
export const LOCKED_ESCROW_WARNINGS = {
  title: "⚠️ Creating a Locked Escrow",
  subtitle: "You are creating an escrow without an agent",

  confirmations: [
    {
      key: "understandNoDispute" as const,
      label: "I understand that disputes cannot be resolved without an agent",
      description:
        "If a disagreement occurs, there will be no third party to mediate.",
    },
    {
      key: "understandFundsLocked" as const,
      label: "I understand that funds may be permanently locked",
      description:
        "If the buyer and seller cannot agree, funds may remain locked forever.",
    },
    {
      key: "acceptRisk" as const,
      label: "I accept all risks associated with a locked escrow",
      description:
        "I have read and understood the implications of creating an escrow without an agent.",
    },
  ],

  recommendation:
    "We strongly recommend assigning an agent for dispute resolution.",
} as const;

// =============================================================================
// SUPPORTED TOKENS
// =============================================================================

/**
 * Supported token types for escrow creation.
 * This is a subset of all tokens - only stablecoins are allowed.
 */
export const SUPPORTED_ESCROW_TOKENS = ["USDC", "USDT"] as const;
export type SupportedEscrowToken = (typeof SUPPORTED_ESCROW_TOKENS)[number];

/**
 * Check if a token type is supported for escrow creation.
 */
export function isSupportedEscrowToken(
  tokenType: string
): tokenType is SupportedEscrowToken {
  return SUPPORTED_ESCROW_TOKENS.includes(tokenType as SupportedEscrowToken);
}
