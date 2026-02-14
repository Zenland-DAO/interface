"use client";

import { useConnection } from "wagmi";
import { formatAddress } from "@/lib/wagmi/formatAddress";
import { useMemo } from "react";
import { Copy } from "lucide-react";
import { toast } from "@/components/ui";

export function UserProfile() {
  const { address } = useConnection();
  const displayAddress = useMemo(() => formatAddress(address), [address]);

  const handleCopy = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    toast("Address Copied", {
      description: "Wallet address copied to clipboard",
    });
  };

  if (!address) return null;

  return (
    <div className="px-4 py-8 mb-4">
      <div className="flex flex-col items-center">
        {/* Avatar Placeholder */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary-500/20 to-indigo-500/20 flex items-center justify-center mb-4 border border-primary-500/10 shadow-sm relative group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary-500 to-indigo-500 opacity-10 group-hover:opacity-20 transition-opacity" />
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-tr from-primary-600 to-indigo-600">
            {displayAddress.slice(0, 2)}
          </span>
        </div>

        <div className="text-center">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-[var(--state-hover)] transition-colors group"
          >
            <span className="text-xs font-medium text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)]">
              {displayAddress}
            </span>
            <Copy className="w-3 h-3 text-[var(--text-tertiary)] group-hover:text-primary-500 transition-colors" />
          </button>
        </div>
      </div>
    </div>
  );
}
