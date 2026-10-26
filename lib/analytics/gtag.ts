/**
 * Google Analytics 4 utility functions
 *
 * gtag.js is loaded by components/layout/GoogleAnalytics.
 * Events tracked:
 * - Page views (automatic - GA4 enhanced measurement)
 * - Wallet funnel: wallet_modal_opened → wallet_connect_attempt →
 *   wallet_connected | wallet_connect_failed, wallet_modal_dismissed
 * - Escrow funnel: escrow_step_{form,review,approve,confirm,success},
 *   escrow_form_started, escrow_form_error, escrow_insufficient_balance,
 *   escrow_approve_failed, escrow_create_submitted, escrow_create_failed,
 *   escrow_created
 * - Agent registration
 *
 * Event names are the funnel (the analytics/ report reads them without any GA
 * admin setup); params like `reason` / `field` need registering as custom
 * dimensions to show up in reports. Keep analytics/src/events.ts in sync.
 *
 * Events are mirrored to Microsoft Clarity (when loaded) so session recordings
 * can be filtered by them.
 */

import { parseWeb3Error } from "@/lib/utils/web3-errors";

declare global {
  interface Window {
    // Defined by the inline init script in components/layout/GoogleAnalytics
    gtag?: (...args: unknown[]) => void;
    // Defined by components/layout/MicrosoftClarity when a project ID is set
    clarity?: (...args: unknown[]) => void;
  }
}

// Google Analytics Measurement ID
export const GA_MEASUREMENT_ID = "G-6FLFD7VC9B";

/**
 * Track a custom event. Calls made before gtag.js has loaded are queued in
 * `dataLayer` by the gtag() stub and sent once it loads.
 * @param eventName - Event name
 * @param params - Additional event parameters
 */
export const trackEvent = (
  eventName: string,
  params?: Record<string, string | number | boolean>
): void => {
  if (typeof window === "undefined") return;

  window.gtag?.("event", eventName, params ?? {});
  window.clarity?.("event", eventName);
};

// =============================================================================
// PRE-BUILT EVENT HELPERS
// =============================================================================

/**
 * Track wallet connection
 * @param walletName - Name of the wallet (e.g., "MetaMask", "WalletConnect")
 */
export const trackWalletConnected = (walletName: string): void => {
  trackEvent("wallet_connected", {
    wallet_type: walletName,
  });
};

/**
 * Track successful escrow creation
 */
export const trackEscrowCreated = (): void => {
  trackEvent("escrow_created");
};

/**
 * Track successful agent registration
 */
export const trackAgentRegistered = (): void => {
  trackEvent("agent_registered");
};

// =============================================================================
// FUNNEL EVENT HELPERS
// =============================================================================

/** Why a wallet / transaction action failed, bucketed for reporting. */
export type FailureReason =
  | "user_rejected"
  | "timeout"
  | "network"
  | "contract_revert"
  | "other";

/** Bucket a web3 error into a coarse, low-cardinality reason. */
export const classifyError = (error: unknown): FailureReason => {
  const message = error instanceof Error ? error.message : String(error ?? "");
  if (/expired|timed? ?out/i.test(message)) return "timeout";

  const parsed = parseWeb3Error(error);
  if (parsed.isUserRejection) return "user_rejected";
  if (parsed.isNetworkError) return "network";
  if (parsed.isContractRevert) return "contract_revert";
  return "other";
};

/**
 * First line of an error message, capped at GA4's 100-char param limit.
 * viem appends request details (addresses, calldata) after the first line.
 */
const errorSummary = (error: unknown): string =>
  (error instanceof Error ? error.message : String(error ?? "")).split("\n")[0].slice(0, 100);

export const trackWalletModalOpened = (): void => {
  trackEvent("wallet_modal_opened");
};

/** Modal closed by the user without a connected wallet. */
export const trackWalletModalDismissed = (): void => {
  trackEvent("wallet_modal_dismissed");
};

export const trackWalletConnectAttempt = (walletName: string): void => {
  trackEvent("wallet_connect_attempt", { wallet_type: walletName });
};

export const trackWalletConnectFailed = (walletName: string, error: unknown): void => {
  trackEvent("wallet_connect_failed", {
    wallet_type: walletName,
    reason: classifyError(error),
    error_message: errorSummary(error),
  });
};

/** A wizard step became visible: escrow_step_form, escrow_step_review, ... */
export const trackEscrowStep = (
  step: "form" | "review" | "approve" | "confirm" | "success"
): void => {
  trackEvent(`escrow_step_${step}`);
};

/** First edit of any field in the create-escrow form. */
export const trackEscrowFormStarted = (): void => {
  trackEvent("escrow_form_started");
};

/** A validation error was shown for a field. */
export const trackEscrowFormError = (field: string, message: string): void => {
  trackEvent("escrow_form_error", { field, error_message: errorSummary(message) });
};

/** The user's token balance doesn't cover the escrow amount + fees. */
export const trackEscrowInsufficientBalance = (token: string, step: string): void => {
  trackEvent("escrow_insufficient_balance", { token, step });
};

export const trackEscrowApproveFailed = (reason: FailureReason, message: string): void => {
  trackEvent("escrow_approve_failed", { reason, error_message: errorSummary(message) });
};

export const trackEscrowCreateSubmitted = (params: {
  token: string;
  has_agent: boolean;
  method: "permit" | "approve";
}): void => {
  trackEvent("escrow_create_submitted", params);
};

export const trackEscrowCreateFailed = (error: unknown): void => {
  trackEvent("escrow_create_failed", {
    reason: classifyError(error),
    error_message: errorSummary(error),
  });
};
