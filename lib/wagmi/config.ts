import { createConfig, http } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";
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
 * - All EIP-6963 injected providers (MetaMask, Rabby, Coinbase, etc.)
 * - Only Mainnet + Sepolia chains
 * - SSR enabled for Next.js App Router
 *
 * Note: `injected()` uses EIP-6963 discovery (multiInjectedProviderDiscovery)
 * which automatically detects all browser wallets including MetaMask.
 * No need for explicit MetaMask connector as it will be discovered via EIP-6963.
 */
export const config = createConfig({
  chains: appChains,
  ssr: true,
  connectors: [
    // NYKNYC - Sponsored wallet with gas-free transactions
    nyknyc({
      appId: "dapp_7fed642d3b1f1cec5d431bc2",
    }),
    // WalletConnect - For mobile wallet connections
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
    // Generic injected connector - auto-discovers all EIP-6963 wallets
    // (MetaMask, Rabby, Coinbase Wallet, Brave, Trust Wallet, etc.)
    injected(),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});
