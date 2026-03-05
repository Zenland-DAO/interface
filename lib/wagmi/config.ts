import { createConfig, http } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { walletConnect, baseAccount } from "wagmi/connectors";
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
 * - WalletConnect for mobile wallet support (MetaMask mobile, Trust Wallet, Rainbow, etc.)
 * - Base Account (Coinbase) SDK for mobile deep-linking into Coinbase Wallet
 * - All EIP-6963 injected providers (MetaMask, Rabby, Brave, OKX, Ledger, etc.) on desktop
 * - Only Mainnet + Sepolia chains
 * - SSR enabled for Next.js App Router
 *
 * Notes:
 * - EIP-6963 discovery is enabled by default via createConfig's multiInjectedProviderDiscovery
 *   (no explicit injected() connector needed — all browser wallets are auto-discovered)
 * - WalletConnect provides QR code connection for MetaMask mobile
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
    // (also covers MetaMask mobile, Trust Wallet, Rainbow, etc.)
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
    // Base Account (Coinbase) - Smart wallet with mobile deep-linking
    baseAccount({
      appName: "Zenland",
      appLogoUrl: "https://zen.land/branding/favicon/favicon.svg",
    }),
    // EIP-6963 injected wallets (MetaMask, Rabby, Brave, OKX, Ledger, etc.)
    // are auto-discovered by createConfig — no explicit connector needed.
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});
