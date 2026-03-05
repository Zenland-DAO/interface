"use client";

/**
 * Connect Wallet Modal
 *
 * Mobile-first modal for wallet connection.
 * - Full-screen slide-up on mobile
 * - Centered dialog on desktop (scrollable wallet list with fixed header/footer)
 * - Auto-closes on successful wallet connection
 * - Features NYKNYC as sponsored/recommended wallet with gas-free transactions
 * - Deduplicates EIP-6963 connectors to avoid duplicates
 * - Caps visible wallets with "Show all" expansion
 */

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wallet, AlertCircle, Sparkles, ChevronDown } from "lucide-react";
import { useConnect, useConnectors, type Connector } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import Link from "next/link";

import { Heading, Text, WalletOption } from "@/components/ui";
import { useWalletModal } from "@/components/providers/WalletModalContext";
import { useEnsureChain } from "@/hooks/wallet/useEnsureChain";
import { getWalletMetadata } from "@/lib/wallets";
import { trackWalletConnected } from "@/lib/analytics/gtag";

// Defer state updates to avoid `react-hooks/set-state-in-effect`.
function defer(fn: () => void) {
  setTimeout(fn, 0);
}

/** Maximum number of "Other Wallets" shown before "Show all" is needed. */
const MAX_VISIBLE_WALLETS = 6;

// =============================================================================
// TYPES
// =============================================================================

type WalletViewModel = {
  key: string;
  name: string;
  description: string;
  icon: string;
  sponsored?: boolean;
  sponsorBadge?: string;
  connector: Connector;
};

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const mobileModalVariants = {
  hidden: { y: "100%" },
  visible: {
    y: 0,
    transition: { type: "spring" as const, damping: 30, stiffness: 300 },
  },
  exit: { y: "100%", transition: { duration: 0.2 } },
};

const desktopModalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } },
};

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Normalise a connector name into a dedup key.
 * "MetaMask" / "metamask" / "MetaMask SDK" → "metamask"
 */
function dedupeKey(connector: Connector): string {
  return connector.name
    .toLowerCase()
    .replace(/\s*(sdk|wallet|extension)\s*/gi, "")
    .replace(/\s+/g, "");
}

/**
 * Map raw connector error messages to user-friendly strings.
 * Third-party SDK errors (WalletConnect, etc.) often surface cryptic messages
 * that confuse users — this translates them into actionable guidance.
 */
function friendlyConnectError(error: Error | null): string {
  if (!error) return "";
  const msg = error.message;

  // WalletConnect proposal expired — user didn't approve in time
  if (msg.includes("Proposal expired") || msg.includes("Request expired")) {
    return "Connection timed out. Please try again.";
  }

  // WalletConnect pairing reset — user closed QR modal before completing
  if (msg.includes("Connection request reset")) {
    return "Connection was cancelled. Please try again.";
  }

  return msg;
}

/**
 * Deduplicate and filter connectors.
 *
 * Rules:
 * 1. Skip the generic "injected" connector when specific EIP-6963 wallets exist.
 * 2. Deduplicate by normalised name (first one wins — explicit config connectors
 *    come before EIP-6963 discovered connectors, so they take priority).
 */
function deduplicateConnectors(connectors: readonly Connector[]): Connector[] {
  const hasEip6963 = connectors.some(
    (c) => c.type === "injected" && c.id !== "injected",
  );

  const seen = new Set<string>();
  const result: Connector[] = [];

  for (const connector of connectors) {
    // Skip the generic "Injected" fallback when real EIP-6963 wallets exist
    if (connector.id === "injected" && connector.type === "injected" && hasEip6963) {
      continue;
    }

    const key = dedupeKey(connector);
    if (seen.has(key)) continue;
    seen.add(key);

    result.push(connector);
  }

  return result;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function ConnectWalletModal() {
  const { isOpen, closeModal } = useWalletModal();
  const connectors = useConnectors();
  const connect = useConnect();

  const { connection, chainError, clearChainError } = useEnsureChain({
    supportedChainIds: [mainnet.id, sepolia.id],
    desiredChainId: mainnet.id,
    autoSwitch: true,
  });

  const [connectorAvailable, setConnectorAvailable] = useState<
    Record<string, boolean>
  >({});
  const [connectingUid, setConnectingUid] = useState<string | null>(null);

  const isConnected = connection.status === "connected";

  // Determine connector availability.
  // WalletConnect / SDK-based connectors are always available (they don't need
  // a pre-existing browser provider). Only injected-style connectors need a
  // pre-existing provider in the browser.
  useEffect(() => {
    let isActive = true;

    async function run() {
      const entries = await Promise.all(
        connectors.map(async (connector) => {
          // SDK-based connectors (WalletConnect, Base Account, NYKNYC)
          // have their own connection mechanism.
          if (connector.type !== "injected") {
            return [connector.uid, true] as const;
          }
          try {
            const provider = await connector.getProvider();
            return [connector.uid, !!provider] as const;
          } catch {
            return [connector.uid, false] as const;
          }
        }),
      );

      if (!isActive) return;
      setConnectorAvailable(Object.fromEntries(entries));
    }

    if (isOpen) {
      run();
    }

    return () => {
      isActive = false;
    };
  }, [connectors, isOpen]);

  // Reset connecting state when modal closes
  useEffect(() => {
    if (!isOpen) {
      defer(() => setConnectingUid(null));
    }
  }, [isOpen]);

  // Build deduplicated wallet view models with metadata
  const walletOptions: WalletViewModel[] = useMemo(() => {
    const deduped = deduplicateConnectors(connectors);

    return deduped.map((connector) => {
      const metadata = getWalletMetadata(connector);
      return {
        key: connector.uid,
        connector,
        name: connector.name,
        description: metadata.description,
        icon: metadata.icon,
        sponsored: metadata.isSponsored,
        sponsorBadge: metadata.sponsorBadge,
      };
    });
  }, [connectors]);

  // Separate sponsored from other wallets, filtering unavailable ones
  const { sponsoredWallets, otherWallets } = useMemo(() => {
    const sponsored: WalletViewModel[] = [];
    const others: WalletViewModel[] = [];

    walletOptions.forEach((wallet) => {
      const isAvailable = connectorAvailable[wallet.connector.uid] ?? true;

      // Only show available wallets
      if (!isAvailable) return;

      if (wallet.sponsored) {
        sponsored.push(wallet);
      } else {
        others.push(wallet);
      }
    });

    // Sort other wallets alphabetically
    others.sort((a, b) => a.name.localeCompare(b.name));

    return { sponsoredWallets: sponsored, otherWallets: others };
  }, [walletOptions, connectorAvailable]);

  const handleConnect = (connector: Connector) => {
    // Use connect.isPending instead of connection.status to avoid
    // permanently blocking buttons when a previous connection attempt
    // left the connection in a non-"disconnected" state.
    if (connect.isPending || connectingUid) return;

    clearChainError();
    setConnectingUid(connector.uid);

    connect.mutate(
      { connector },
      {
        onSuccess: () => {
          setConnectingUid(null);
          // Track wallet connection for analytics
          trackWalletConnected(connector.name);
        },
        onError: () => setConnectingUid(null),
      },
    );
  };

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeModal();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeModal]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end lg:items-center lg:justify-center"
          data-lenis-prevent
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={handleBackdropClick}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Mobile: Full-width bottom sheet */}
          <motion.div
            className="relative w-full lg:hidden bg-[var(--bg-primary)] rounded-t-3xl max-h-[85vh] overflow-hidden flex flex-col"
            variants={mobileModalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <ModalContent
              sponsoredWallets={sponsoredWallets}
              otherWallets={otherWallets}
              connectingUid={connectingUid}
              isConnectPending={connect.isPending}
              isConnected={isConnected}
              chainError={chainError}
              connectError={connect.error}
              onConnect={handleConnect}
              onClose={closeModal}
            />
          </motion.div>

          {/* Desktop: Centered dialog — max-h ensures scrollability */}
          <motion.div
            className="relative hidden lg:flex lg:flex-col w-full max-w-md max-h-[70vh] bg-[var(--bg-primary)] rounded-2xl shadow-2xl overflow-hidden border border-[var(--border-secondary)]"
            variants={desktopModalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <ModalContent
              sponsoredWallets={sponsoredWallets}
              otherWallets={otherWallets}
              connectingUid={connectingUid}
              isConnectPending={connect.isPending}
              isConnected={isConnected}
              chainError={chainError}
              connectError={connect.error}
              onConnect={handleConnect}
              onClose={closeModal}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// =============================================================================
// MODAL CONTENT
// =============================================================================

interface ModalContentProps {
  sponsoredWallets: WalletViewModel[];
  otherWallets: WalletViewModel[];
  connectingUid: string | null;
  isConnectPending: boolean;
  isConnected: boolean;
  chainError: string | null;
  connectError: Error | null;
  onConnect: (connector: Connector) => void;
  onClose: () => void;
}

function ModalContent({
  sponsoredWallets,
  otherWallets,
  connectingUid,
  isConnectPending,
  isConnected,
  chainError,
  connectError,
  onConnect,
  onClose,
}: ModalContentProps) {
  const [showAll, setShowAll] = useState(false);

  // Reset "Show all" when modal content changes (e.g., re-open)
  useEffect(() => {
    setShowAll(false);
  }, [otherWallets.length]);

  const visibleOtherWallets =
    showAll || otherWallets.length <= MAX_VISIBLE_WALLETS
      ? otherWallets
      : otherWallets.slice(0, MAX_VISIBLE_WALLETS);

  const hiddenCount = otherWallets.length - visibleOtherWallets.length;

  return (
    <>
      {/* Header — always visible */}
      <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-[var(--border-secondary)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-primary-500" />
          </div>
          <div>
            <Heading level={4}>Connect Wallet</Heading>
            <Text variant="small" className="text-[var(--text-tertiary)]">
              Choose your wallet to continue
            </Text>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-[var(--state-hover)] transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-[var(--text-secondary)]" />
        </button>
      </div>

      {/* Content — scrollable */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 py-4 space-y-4">
        {/* Sponsored/Recommended Section */}
        {sponsoredWallets.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-1">
              <Sparkles className="w-4 h-4 text-primary-500" />
              <Text
                variant="caption"
                className="text-primary-600 dark:text-primary-400 uppercase tracking-wider"
              >
                Recommended
              </Text>
            </div>
            {sponsoredWallets.map((wallet, index) => {
              const isConnecting = connectingUid === wallet.connector.uid;

              return (
                <motion.div
                  key={wallet.key}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <WalletOption
                    imageSrc={wallet.icon}
                    name={wallet.name}
                    description={
                      isConnecting ? "Connecting…" : wallet.description
                    }
                    sponsored={wallet.sponsored}
                    sponsorBadge={wallet.sponsorBadge}
                    disabled={isConnecting || (isConnectPending && connectingUid !== wallet.connector.uid)}
                    onClick={() => onConnect(wallet.connector)}
                  />
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Other Wallets Section */}
        {visibleOtherWallets.length > 0 && (
          <div className="space-y-2">
            {sponsoredWallets.length > 0 && (
              <div className="flex items-center gap-2 px-1 pt-2">
                <Text
                  variant="caption"
                  className="text-[var(--text-tertiary)] uppercase tracking-wider"
                >
                  Other Wallets
                </Text>
              </div>
            )}
            {visibleOtherWallets.map((wallet, index) => {
              const isConnecting = connectingUid === wallet.connector.uid;

              return (
                <motion.div
                  key={wallet.key}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.2,
                    delay: sponsoredWallets.length * 0.05 + index * 0.03,
                  }}
                >
                  <WalletOption
                    imageSrc={wallet.icon}
                    name={wallet.name}
                    description={
                      isConnecting ? "Connecting…" : wallet.description
                    }
                    disabled={isConnecting || (isConnectPending && connectingUid !== wallet.connector.uid)}
                    onClick={() => onConnect(wallet.connector)}
                  />
                </motion.div>
              );
            })}

            {/* "Show all" button when there are hidden wallets */}
            {hiddenCount > 0 && (
              <button
                type="button"
                onClick={() => setShowAll(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--state-hover)] transition-colors"
              >
                <ChevronDown className="w-4 h-4" />
                Show {hiddenCount} more wallet{hiddenCount > 1 ? "s" : ""}
              </button>
            )}
          </div>
        )}

        {/* Empty State */}
        {sponsoredWallets.length === 0 && otherWallets.length === 0 && (
          <div className="py-8 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center">
              <Wallet className="w-6 h-6 text-[var(--text-tertiary)]" />
            </div>
            <Text className="text-[var(--text-secondary)]">
              No wallets detected
            </Text>
            <Text variant="small" className="mt-1 text-[var(--text-tertiary)]">
              Please install a Web3 wallet to continue
            </Text>
          </div>
        )}
      </div>

      {/* Error message */}
      {(connectError || (isConnected && chainError)) && (
        <div className="flex-shrink-0 px-6 pb-4">
          <div className="flex items-start gap-2 p-3 rounded-lg bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800">
            <AlertCircle className="w-4 h-4 text-error-500 shrink-0 mt-0.5" />
            <Text variant="small" className="text-error-600 dark:text-error-400">
              {isConnected && chainError
                ? chainError
                : friendlyConnectError(connectError)}
            </Text>
          </div>
        </div>
      )}

      {/* Footer — always visible */}
      <div className="flex-shrink-0 px-6 py-4 border-t border-[var(--border-secondary)] bg-[var(--bg-secondary)]">
        <Text
          variant="small"
          className="text-center text-[var(--text-tertiary)]"
        >
          By connecting, you agree to our{" "}
          <Link
            href="/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-500 hover:underline"
          >
            Terms
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-500 hover:underline"
          >
            Privacy Policy
          </Link>
        </Text>
      </div>
    </>
  );
}
