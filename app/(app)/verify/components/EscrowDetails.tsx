"use client";

/**
 * EscrowDetails component
 * 
 * Displays escrow metadata extracted from the PDF
 */

import { useState } from "react";
import Link from "next/link";
import {
  Shield,
  Copy,
  CheckCircle2,
  ExternalLink,
  FileCheck,
  RefreshCw,
} from "lucide-react";
import {
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Heading,
  Text,
  Badge,
  Button,
} from "@/components/ui";
import type { ZenlandEscrowPdfEnvelopeV1 } from "@/lib/pdf/verifyEscrowPdf";
import { getChainName, getBlockExplorerUrl } from "../utils";

interface EscrowDetailsProps {
  envelope: ZenlandEscrowPdfEnvelopeV1;
  onReset: () => void;
  showActions?: boolean;
}

/**
 * Format address for display
 */
function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Format duration from seconds to human readable
 */
function formatDuration(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);

  if (days > 0) {
    return hours > 0 ? `${days}d ${hours}h` : `${days} days`;
  }
  return `${hours} hours`;
}

/**
 * Copy text to clipboard
 */
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function EscrowDetails({ envelope, onReset, showActions = true }: EscrowDetailsProps) {
  const escrow = envelope.escrow;
  const chainName = getChainName(escrow.chainId);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = async (text: string, field: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  return (
    <Card variant="default">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary-500" />
          <Heading level={4}>Escrow Details</Heading>
        </div>
      </CardHeader>
      <CardBody>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Escrow Address */}
          <div className="space-y-1">
            <Text variant="small" className="text-neutral-500">
              Escrow Address
            </Text>
            <div className="flex items-center gap-2">
              <code className="text-sm font-mono">
                {formatAddress(escrow.escrowAddress)}
              </code>
              <button
                onClick={() => handleCopy(escrow.escrowAddress, "escrow")}
                className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors"
                title="Copy address"
              >
                {copiedField === "escrow" ? (
                  <CheckCircle2 className="w-3 h-3 text-success-500" />
                ) : (
                  <Copy className="w-3 h-3 text-neutral-400" />
                )}
              </button>
              <a
                href={getBlockExplorerUrl(escrow.chainId, escrow.escrowAddress)}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors"
                title="View on block explorer"
              >
                <ExternalLink className="w-3 h-3 text-neutral-400" />
              </a>
            </div>
          </div>

          {/* Network */}
          <div className="space-y-1">
            <Text variant="small" className="text-neutral-500">
              Network
            </Text>
            <Badge variant="secondary">{chainName}</Badge>
          </div>

          {/* Buyer */}
          <div className="space-y-1">
            <Text variant="small" className="text-neutral-500">
              Buyer
            </Text>
            <div className="flex items-center gap-2">
              <code className="text-sm font-mono">
                {formatAddress(escrow.buyer)}
              </code>
              <button
                onClick={() => handleCopy(escrow.buyer, "buyer")}
                className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors"
                title="Copy address"
              >
                {copiedField === "buyer" ? (
                  <CheckCircle2 className="w-3 h-3 text-success-500" />
                ) : (
                  <Copy className="w-3 h-3 text-neutral-400" />
                )}
              </button>
            </div>
          </div>

          {/* Seller */}
          <div className="space-y-1">
            <Text variant="small" className="text-neutral-500">
              Seller
            </Text>
            <div className="flex items-center gap-2">
              <code className="text-sm font-mono">
                {formatAddress(escrow.seller)}
              </code>
              <button
                onClick={() => handleCopy(escrow.seller, "seller")}
                className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors"
                title="Copy address"
              >
                {copiedField === "seller" ? (
                  <CheckCircle2 className="w-3 h-3 text-success-500" />
                ) : (
                  <Copy className="w-3 h-3 text-neutral-400" />
                )}
              </button>
            </div>
          </div>

          {/* Agent */}
          <div className="space-y-1">
            <Text variant="small" className="text-neutral-500">
              Agent
            </Text>
            {escrow.agent ? (
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono">
                  {formatAddress(escrow.agent)}
                </code>
                <button
                  onClick={() => handleCopy(escrow.agent!, "agent")}
                  className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors"
                  title="Copy address"
                >
                  {copiedField === "agent" ? (
                    <CheckCircle2 className="w-3 h-3 text-success-500" />
                  ) : (
                    <Copy className="w-3 h-3 text-neutral-400" />
                  )}
                </button>
              </div>
            ) : (
              <Badge variant="warning">No Agent (Locked)</Badge>
            )}
          </div>

          {/* Lock Status */}
          <div className="space-y-1">
            <Text variant="small" className="text-neutral-500">
              Lock Status
            </Text>
            <Badge variant={escrow.isLocked ? "warning" : "success"}>
              {escrow.isLocked ? "Locked" : "Unlocked"}
            </Badge>
          </div>

          {/* Amount */}
          <div className="space-y-1">
            <Text variant="small" className="text-neutral-500">
              Amount
            </Text>
            <Text className="font-medium">
              {escrow.amount} {escrow.token.symbol}
            </Text>
          </div>

          {/* Buyer Protection */}
          <div className="space-y-1">
            <Text variant="small" className="text-neutral-500">
              Buyer Protection
            </Text>
            <Text>{formatDuration(escrow.timeouts.buyerProtectionTime)}</Text>
          </div>
        </div>
      </CardBody>
      
      {showActions && (
        <CardFooter className="flex flex-col sm:flex-row gap-3">
          <Link href={`/escrows/${escrow.escrowAddress}`} className="flex-1">
            <Button variant="primary" className="w-full">
              <FileCheck className="w-4 h-4 mr-2" />
              View Escrow Details
            </Button>
          </Link>
          <Button variant="outline" onClick={onReset} className="flex-1 sm:flex-none">
            <RefreshCw className="w-4 h-4 mr-2" />
            Verify Another
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
