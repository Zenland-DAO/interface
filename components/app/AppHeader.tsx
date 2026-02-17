"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useConnection, useDisconnect } from "wagmi";
import { Wallet, Settings, LogOut, ChevronDown } from "lucide-react";
import { BaseHeader, Dropdown, DropdownItem, DropdownDivider, ThemeToggle, Logo, Button } from "@/components/ui";
import { formatAddress } from "@/lib/wagmi/formatAddress";
import { useWalletModal } from "@/components/providers/WalletModalContext";
import { LanguageSwitcher } from "@/components/marketing/LanguageSwitcher";

/**
 * App Header Component
 *
 * Clean header showing mobile menu button, theme toggle, and profile dropdown.
 * Shows "Connect Wallet" button when wallet is not connected.
 */
export function AppHeader() {
  const { address, status } = useConnection();
  const { disconnect } = useDisconnect();
  const { openModal } = useWalletModal();
  const router = useRouter();
  const displayAddress = useMemo(() => formatAddress(address), [address]);

  const isConnected = status === "connected";

  const handleLogout = () => {
    disconnect();
  };

  return (
    <BaseHeader
      leftSlot={
        <div className="flex items-center gap-4">
          <div className="lg:hidden">
            <Logo size="sm" />
          </div>
        </div>
      }
      rightSlot={
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />

          {isConnected ? (
            <Dropdown
              trigger={
                <button className="flex items-center gap-2 p-1 pl-2 rounded-xl hover:bg-[var(--state-hover)] transition-all border border-transparent hover:border-[var(--border-secondary)]">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-primary-500 to-indigo-500 flex items-center justify-center text-white text-[10px] font-bold">
                    {displayAddress.slice(0, 2)}
                  </div>
                  <div className="hidden sm:block text-left min-w-[100px]">
                    <p className="text-xs font-bold leading-none mb-0.5 tabular-nums">{displayAddress}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                </button>
              }
            >
              <DropdownItem icon={<Settings size={16} />} onClick={() => router.push("/settings")}>Settings</DropdownItem>
              <DropdownDivider />
              <DropdownItem icon={<LogOut size={16} />} onClick={handleLogout} variant="danger">Disconnect</DropdownItem>
            </Dropdown>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={openModal}
              className="flex items-center gap-2"
            >
              <Wallet size={16} />
              <span className="hidden sm:inline">Connect Wallet</span>
              <span className="sm:hidden">Connect</span>
            </Button>
          )}
        </div>
      }
    />
  );
}
