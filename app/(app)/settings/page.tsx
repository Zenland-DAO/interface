"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useConnection, useDisconnect } from "wagmi";
import { Wallet } from "lucide-react";
import { Button, Card, CardHeader, CardBody, ThemeToggleWithLabel } from "@/components/ui";
import { PageHeader, NetworkSwitcher } from "@/components/shared";
import { formatAddress } from "@/lib/wagmi/formatAddress";
import { useWalletModal } from "@/components/providers/WalletModalContext";
import { VERSION, COMMIT_HASH, getCommitUrl, IS_DEV_BUILD, GITHUB_REPO_URL } from "@/lib/version";

export default function SettingsPage() {
  const { address, status } = useConnection();
  const { disconnect, isPending: isDisconnecting } = useDisconnect();
  const { openModal } = useWalletModal();

  const isConnected = status === "connected";
  const displayAddress = useMemo(() => formatAddress(address), [address]);

  const handleDisconnect = () => {
    disconnect();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your account preferences"
      />

      {/* Wallet Section */}
      <Card variant="elevated" className="overflow-visible">
        <CardHeader>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Wallet
          </h2>
        </CardHeader>
        <CardBody className="space-y-4">
          {isConnected ? (
            <>
              {/* Connected Wallet */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    Connected Wallet
                  </p>
                  <p
                    className="text-sm text-[var(--text-tertiary)] font-mono"
                    title={address}
                  >
                    {displayAddress}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDisconnect}
                  isLoading={isDisconnecting}
                >
                  Disconnect
                </Button>
              </div>

              {/* Network */}
              <div className="border-t border-[var(--border-secondary)] pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      Network
                    </p>
                    <p className="text-sm text-[var(--text-tertiary)]">
                      Switch between mainnet and testnet
                    </p>
                  </div>
                  <NetworkSwitcher size="sm" />
                </div>
              </div>
            </>
          ) : (
            /* Not Connected State */
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  No wallet connected
                </p>
                <p className="text-sm text-[var(--text-tertiary)]">
                  Connect your wallet to access all features
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={openModal}
                className="flex items-center gap-2"
              >
                <Wallet size={16} />
                Connect Wallet
              </Button>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Appearance Section */}
      <Card variant="elevated">
        <CardHeader>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Appearance
          </h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">
                Theme
              </p>
              <p className="text-sm text-[var(--text-tertiary)]">
                Switch between light and dark mode
              </p>
            </div>
            <ThemeToggleWithLabel />
          </div>
        </CardBody>
      </Card>

      {/* About Section */}
      <Card variant="elevated">
        <CardHeader>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            About
          </h2>
        </CardHeader>
        <CardBody className="space-y-4">
          {/* Version Info */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">
                Version
              </p>
              <p className="text-sm text-[var(--text-tertiary)]">
                Current application version
              </p>
            </div>
            <div className="text-right">
              <span className="text-sm font-medium text-[var(--text-primary)]">
                v{VERSION}
              </span>
              {!IS_DEV_BUILD && (
                <>
                  <span className="text-sm text-[var(--text-tertiary)] mx-1.5">·</span>
                  <a
                    href={getCommitUrl() || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-mono text-[var(--color-primary-500)] hover:underline"
                    title="View commit on GitHub"
                  >
                    {COMMIT_HASH}
                  </a>
                </>
              )}
              {IS_DEV_BUILD && (
                <span className="text-sm text-[var(--text-tertiary)] ml-1.5 font-mono">
                  (dev)
                </span>
              )}
            </div>
          </div>

          <div className="border-t border-[var(--border-secondary)] pt-4">
            {/* Links */}
            <div className="grid grid-cols-2 gap-3">
              <a 
                href="https://docs.zen.land" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--color-primary-500)] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Documentation
              </a>
              <a 
                href={GITHUB_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--color-primary-500)] transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                GitHub
              </a>
              <Link 
                href="/terms" 
                className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--color-primary-500)] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Terms of Service
              </Link>
              <Link 
                href="/privacy" 
                className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--color-primary-500)] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Privacy Policy
              </Link>
              <a 
                href="https://t.me/zenlandofficial" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--color-primary-500)] transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                </svg>
                Support
              </a>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
