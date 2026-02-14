/**
 * Wallet Icon Mapping Utility
 * 
 * Maps wallet connector IDs and names to their corresponding icon paths.
 * Follows Single Responsibility Principle - only handles icon resolution.
 */

import type { Connector } from "wagmi";

/**
 * Mapping of wallet identifiers (connector.id or connector.name) to icon paths.
 * Icons are served from /public/assets/wallets/
 */
const WALLET_ICONS: Record<string, string> = {
  // NYKNYC - Sponsored wallet
  nyknyc: "/assets/wallets/nyknyc-icon.svg",
  NYKNYC: "/assets/wallets/nyknyc-icon.svg",
  
  // MetaMask
  metamask: "/assets/wallets/metamask-icon.svg",
  MetaMask: "/assets/wallets/metamask-icon.svg",
  "io.metamask": "/assets/wallets/metamask-icon.svg",
  
  // WalletConnect
  walletConnect: "/assets/wallets/walletconnect-icon.svg",
  WalletConnect: "/assets/wallets/walletconnect-icon.svg",
  
  // Coinbase
  coinbaseWallet: "/assets/wallets/coinbase-icon.svg",
  "Coinbase Wallet": "/assets/wallets/coinbase-icon.svg",
  coinbase: "/assets/wallets/coinbase-icon.svg",
  
  // Brave
  brave: "/assets/wallets/brave-icon.svg",
  "Brave Wallet": "/assets/wallets/brave-icon.svg",
  "com.brave.wallet": "/assets/wallets/brave-icon.svg",
  
  // Rabby
  rabby: "/assets/wallets/rabby-icon.svg",
  "Rabby Wallet": "/assets/wallets/rabby-icon.svg",
  Rabby: "/assets/wallets/rabby-icon.svg",
  "io.rabby": "/assets/wallets/rabby-icon.svg",
  
  // Trust Wallet
  trust: "/assets/wallets/trustwallet-icon.svg",
  "Trust Wallet": "/assets/wallets/trustwallet-icon.svg",
  trustWallet: "/assets/wallets/trustwallet-icon.svg",
  
  // OKX
  okx: "/assets/wallets/okx-icon.svg",
  "OKX Wallet": "/assets/wallets/okx-icon.svg",
  okxWallet: "/assets/wallets/okx-icon.svg",
  
  // Ledger
  ledger: "/assets/wallets/ledger-icon.svg",
  "Ledger Live": "/assets/wallets/ledger-icon.svg",
  ledgerLive: "/assets/wallets/ledger-icon.svg",
};

/**
 * Default fallback icon for unknown wallets
 */
const DEFAULT_WALLET_ICON_LIGHT = "/assets/wallets/browser-wallet-light.svg";
const DEFAULT_WALLET_ICON_DARK = "/assets/wallets/browser-wallet-dark.svg";

/**
 * Resolves the icon path for a given wallet connector.
 * Checks both connector.id and connector.name for matches.
 * 
 * @param connector - The wagmi Connector object
 * @returns The path to the wallet icon SVG
 */
export function getWalletIcon(connector: Connector): string {
  // Try to match by connector.id first (more specific)
  if (WALLET_ICONS[connector.id]) {
    return WALLET_ICONS[connector.id];
  }
  
  // Try to match by connector.name
  if (WALLET_ICONS[connector.name]) {
    return WALLET_ICONS[connector.name];
  }
  
  // Return default fallback
  return DEFAULT_WALLET_ICON_DARK;
}

/**
 * Checks if the connector is the NYKNYC wallet (sponsored by Zenland).
 * 
 * @param connector - The wagmi Connector object
 * @returns true if the connector is NYKNYC
 */
export function isNYKNYC(connector: Connector): boolean {
  const id = connector.id.toLowerCase();
  const name = connector.name.toLowerCase();
  return id === "nyknyc" || name === "nyknyc";
}

/**
 * Returns wallet metadata for display purposes.
 * Centralizes wallet-specific display information.
 */
export interface WalletMetadata {
  icon: string;
  isSponsored: boolean;
  sponsorBadge?: string;
  description: string;
}

export function getWalletMetadata(connector: Connector): WalletMetadata {
  const icon = getWalletIcon(connector);
  const sponsored = isNYKNYC(connector);
  
  return {
    icon,
    isSponsored: sponsored,
    sponsorBadge: sponsored ? "Sponsored by Zenland - No gas fees" : undefined,
    description: sponsored 
      ? "Connect with gas-free transactions" 
      : "Connect with browser extension",
  };
}
