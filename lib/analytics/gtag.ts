/**
 * Google Analytics 4 utility functions
 *
 * Uses @next/third-parties/google for optimized loading.
 * Events tracked:
 * - Page views (automatic - handled by GoogleAnalytics component)
 * - Wallet connections (with wallet type)
 * - Escrow creation
 * - Agent registration
 */

import { sendGAEvent } from "@next/third-parties/google";

// Google Analytics Measurement ID
export const GA_MEASUREMENT_ID = "G-6FLFD7VC9B";

/**
 * Track a custom event using @next/third-parties
 * @param eventName - Event name
 * @param params - Additional event parameters
 */
export const trackEvent = (
  eventName: string,
  params?: Record<string, string | number | boolean>
): void => {
  // sendGAEvent is safe to call on server (no-op) but we check client anyway
  if (typeof window === "undefined") return;

  sendGAEvent("event", eventName, params ?? {});
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
