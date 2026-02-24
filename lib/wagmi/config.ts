import { createConfig, http } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { injected, walletConnect, metaMask, baseAccount } from "wagmi/connectors";
import { nyknyc } from "@nyknyc/wagmi-connector";

/**
 * Supported chains for the app.
 *
 * Note: Keep this list small and explicit.
 */
export const appChains = [mainnet, sepolia] as const;

/**
 * Wagmi config for Zenland.
 *
 * Requirements:
 * - NYKNYC (sponsored, gas-free transactions)
 * - WalletConnect for mobile wallet support
 * - MetaMask SDK for mobile deep-linking into MetaMask app
 * - Base Account (Coinbase) SDK for mobile deep-linking into Coinbase Wallet
 * - All EIP-6963 injected providers (MetaMask, Rabby, Coinbase, etc.) on desktop
 * - Only Mainnet + Sepolia chains
 * - SSR enabled for Next.js App Router
 *
 * Note: `injected()` uses EIP-6963 discovery (multiInjectedProviderDiscovery)
 * which automatically detects all browser wallets on desktop.
 * SDK-based connectors (metaMask, baseAccount, walletConnect) work on mobile
 * via deep-linking and relay — no browser extension needed.
 */
export const config = createConfig({
  chains: appChains,
  ssr: true,
  connectors: [
    // NYKNYC - Sponsored wallet with gas-free transactions
    nyknyc({
      appId: "dapp_7fed642d3b1f1cec5d431bc2",
    }),
    // WalletConnect - For mobile wallet connections via QR / relay
    walletConnect({
      projectId: "8f2526d42d726ccf5415e804a796442c",
      metadata: {
        name: "Zenland",
        description: "Zenland - Web3 Escrow Platform",
        url: "https://zen.land",
        icons: ["https://zen.land/branding/favicon/favicon.svg"],
      },
      showQrModal: true,
    }),
    // MetaMask SDK - Deep-links into MetaMask mobile app on mobile browsers
    metaMask({
      dappMetadata: {
        name: "Zenland",
        url: "https://zen.land",
        iconUrl: "https://zen.land/branding/favicon/favicon.svg",
      },
    }),
    // Base Account (Coinbase) - Smart wallet with mobile deep-linking
    baseAccount({
      appName: "Zenland",
      appLogoUrl: "https://zen.land/branding/favicon/favicon.svg",
    }),
    // Generic injected connector - auto-discovers all EIP-6963 wallets on desktop
    // (Rabby, Brave, Trust Wallet, OKX, Ledger, etc.)
    injected(),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});
