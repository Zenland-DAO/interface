"use client";

import { useMemo, useState } from "react";
import { useConnection } from "wagmi";
import { disconnect, getConnection } from "wagmi/actions";

import { Button } from "@/components/ui";
import { config } from "@/lib/wagmi/config";
import { formatAddress } from "@/lib/wagmi/formatAddress";

type ConnectedWalletVariant = "sidebar" | "topnav";

export type ConnectedWalletProps = {
  variant: ConnectedWalletVariant;
};

async function copyToClipboard(text: string) {
  if (!text) return;

  // Prefer modern Clipboard API.
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  // Fallback for older browsers.
  const el = document.createElement("textarea");
  el.value = text;
  el.setAttribute("readonly", "");
  el.style.position = "absolute";
  el.style.left = "-9999px";
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);
}

/**
 * Small reusable wallet UI for layouts:
 * - shows address (shortened, full in title)
 * - copy
 * - disconnect
 */
export function ConnectedWallet({ variant }: ConnectedWalletProps) {
  const { address, status } = useConnection();
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

  const displayAddress = useMemo(() => formatAddress(address), [address]);

  const isConnected = status === "connected";

  const handleDisconnect = async () => {
    if (isDisconnecting) return;
    setIsDisconnecting(true);

    try {
      const { connector } = getConnection(config);
      await disconnect(config, { connector });
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleCopy = async () => {
    if (!address || isCopying) return;
    setIsCopying(true);
    try {
      await copyToClipboard(address);
    } finally {
      setIsCopying(false);
    }
  };

  if (!isConnected) return null;

  if (variant === "sidebar") {
    return (
      <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-secondary)] transition-colors hover:border-[var(--border-focus)]/30">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
          {displayAddress.slice(0, 2)}
        </div>

        <div className="flex-1 min-w-0">
          <p
            className="text-xs font-semibold text-[var(--text-primary)] truncate"
            title={address}
          >
            {displayAddress}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse" />
            <p className="text-[10px] text-[var(--text-tertiary)] uppercase font-bold tracking-tighter">Connected</p>
          </div>
        </div>
      </div>
    );
  }

  // topnav
  return (
    <div className="hidden lg:flex items-center gap-2">
      <span
        className="text-sm text-[var(--text-secondary)]"
        title={address}
      >
        {displayAddress}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        isLoading={isCopying}
        title="Copy address"
      >
        Copy
      </Button>
      <Button
        type="button"
        variant="danger"
        size="sm"
        onClick={handleDisconnect}
        isLoading={isDisconnecting}
        title="Disconnect"
      >
        Disconnect
      </Button>
    </div>
  );
}
