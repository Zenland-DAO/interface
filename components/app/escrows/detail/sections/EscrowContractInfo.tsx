"use client";

/**
 * EscrowContractInfo
 *
 * Displays contract information:
 * - Contract address with copy functionality
 * - Link to block explorer
 * - Contract version
 */

import { useState, useCallback } from "react";
import { Copy, Check, ExternalLink, FileCode } from "lucide-react";
import { useChainId } from "wagmi";
import { toast } from "sonner";

import { Card, CardBody, Text } from "@/components/ui";
import { useEscrowDetail } from "../EscrowDetailContext";
import { getAddressExplorerUrl } from "../constants";

// =============================================================================
// COMPONENT
// =============================================================================

export function EscrowContractInfo() {
  const { escrow } = useEscrowDetail();
  const chainId = useChainId();

  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(escrow.id);
      setCopied(true);
      toast.success("Address copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy address");
    }
  }, [escrow.id]);

  const explorerUrl = getAddressExplorerUrl(chainId, escrow.id);

  return (
    <Card variant="outlined">
      <CardBody className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <FileCode size={16} className="text-[var(--text-tertiary)]" />
          <Text className="font-semibold text-sm">Contract</Text>
        </div>

        {/* Address */}
        <div className="space-y-2">
          <Text
            variant="muted"
            className="text-xs uppercase font-bold tracking-wider"
          >
            Contract Address
          </Text>
          <div className="flex items-center gap-2 p-2 bg-neutral-50 dark:bg-neutral-800/50 rounded border border-[var(--border-secondary)]">
            <code className="text-[10px] text-[var(--text-primary)] truncate flex-1 font-mono">
              {escrow.id}
            </code>
            <button
              onClick={handleCopy}
              className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded transition-colors flex-shrink-0"
              title="Copy address"
            >
              {copied ? (
                <Check size={12} className="text-success-500" />
              ) : (
                <Copy size={12} className="text-neutral-400" />
              )}
            </button>
          </div>
        </div>

        {/* Version */}
        <div className="flex items-center justify-between">
          <Text variant="muted" className="text-xs">
            Contract Version
          </Text>
          <Text className="text-xs font-mono font-semibold">
            v{escrow.version}
          </Text>
        </div>

        {/* Explorer Link */}
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-primary-500 hover:text-primary-600 font-semibold transition-colors"
        >
          View on Explorer
          <ExternalLink size={10} />
        </a>
      </CardBody>
    </Card>
  );
}
