/**
 * Google Analytics 4 utility functions
 *
 * gtag.js is loaded by components/layout/GoogleAnalytics.
 * Events tracked:
 * - Page views (automatic - GA4 enhanced measurement)
 * - Wallet connections (with wallet type)
 * - Escrow creation
 * - Agent registration
 */

declare global {
  interface Window {
    // Defined by the inline init script in components/layout/GoogleAnalytics
    gtag?: (...args: unknown[]) => void;
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
