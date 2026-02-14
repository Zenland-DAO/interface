"use client";

/**
 * SuccessStep Component
 *
 * Final step of the escrow creation wizard.
 * Shows success message, transaction details, and navigation options.
 */

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Card,
  CardBody,
  Button,
  Heading,
  Text,
} from "@/components/ui";
import {
  Shield,
  Copy,
  Check,
  ExternalLink,
  ArrowRight,
  Plus,
  Wallet,
  FileText,
  Download,
  Send,
  Clock,
  BadgeCheck,
  AlertCircle,
} from "lucide-react";

import type { UseEscrowFormReturn } from "../useEscrowForm";

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface CopyableAddressProps {
  label: string;
  address: string | undefined;
  explorerUrl?: string;
}

function CopyableAddress({ label, address, explorerUrl }: CopyableAddressProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    toast("Address copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  }, [address]);

  if (!address) return null;

  const shortAddress = `${address.slice(0, 10)}...${address.slice(-8)}`;

  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800">
      <div className="flex items-center gap-3">
        <Wallet size={18} className="text-[var(--text-tertiary)]" />
        <div>
          <Text variant="muted" className="text-xs">
            {label}
          </Text>
          <Text className="font-mono text-sm">{shortAddress}</Text>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className="p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
          title="Copy address"
        >
          {copied ? (
            <Check size={16} className="text-success-500" />
          ) : (
            <Copy size={16} className="text-[var(--text-tertiary)]" />
          )}
        </button>
        {explorerUrl && (
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
            title="View on explorer"
          >
            <ExternalLink size={16} className="text-[var(--text-tertiary)]" />
          </a>
        )}
      </div>
    </div>
  );
}

interface TransactionHashProps {
  txHash: string | undefined;
  explorerUrl?: string;
}

function TransactionHash({ txHash, explorerUrl }: TransactionHashProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    if (!txHash) return;
    navigator.clipboard.writeText(txHash);
    setCopied(true);
    toast("Transaction hash copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  }, [txHash]);

  if (!txHash) return null;

  const shortHash = `${txHash.slice(0, 10)}...${txHash.slice(-8)}`;

  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800">
      <div className="flex items-center gap-3">
        <FileText size={18} className="text-[var(--text-tertiary)]" />
        <div>
          <Text variant="muted" className="text-xs">
            Transaction Hash
          </Text>
          <Text className="font-mono text-sm">{shortHash}</Text>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className="p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
          title="Copy transaction hash"
        >
          {copied ? (
            <Check size={16} className="text-success-500" />
          ) : (
            <Copy size={16} className="text-[var(--text-tertiary)]" />
          )}
        </button>
        {explorerUrl && (
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
            title="View on explorer"
          >
            <ExternalLink size={16} className="text-[var(--text-tertiary)]" />
          </a>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export interface SuccessStepProps {
  form: UseEscrowFormReturn;
}

export function SuccessStep({ form }: SuccessStepProps) {
  const { escrowCreation, display, reset, pdf } = form;

  const escrowAddress = escrowCreation.escrowAddress;
  const txHash = escrowCreation.txHash;

  // Show success toast on mount
  const hasShownToast = useRef(false);
  useEffect(() => {
    if (!hasShownToast.current && escrowAddress) {
      hasShownToast.current = true;
      toast.success("Escrow created successfully!", {
        description: "Your escrow contract has been deployed on-chain.",
      });
    }
  }, [escrowAddress]);

  // TODO: Get explorer URL from chain config
  const explorerBaseUrl = "https://sepolia.etherscan.io";
  const escrowExplorerUrl = escrowAddress
    ? `${explorerBaseUrl}/address/${escrowAddress}`
    : undefined;
  const txExplorerUrl = txHash
    ? `${explorerBaseUrl}/tx/${txHash}`
    : undefined;

  return (
    <div className="max-w-2xl mx-auto">
      <Card variant="elevated" className="border-none shadow-2xl shadow-primary-500/5">
        <CardBody className="p-6 sm:p-12 text-center">
          {/* Professional Success Header */}
          <div className="relative mb-8">
            {/* Shield icon with subtle glow */}
            <div className="relative w-16 h-16 mx-auto mb-6">
              <div className="absolute inset-0 rounded-2xl bg-primary-500/20 blur-xl" />
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
                <Shield size={32} className="text-white" strokeWidth={2} />
              </div>
            </div>
            
            {/* Success Message */}
            <Heading level={1} className="text-2xl sm:text-3xl mb-2">
              Contract Created Successfully
            </Heading>
            <Text variant="muted" className="text-sm sm:text-base">
              Your escrow contract has been securely deployed on-chain.
            </Text>
          </div>

          {/* Transaction Details */}
          <div className="space-y-4 mb-10">
            <CopyableAddress
              label="Escrow Address"
              address={escrowAddress}
              explorerUrl={escrowExplorerUrl}
            />
            <TransactionHash txHash={txHash} explorerUrl={txExplorerUrl} />
          </div>

          {/* Summary */}
          <div className="p-6 rounded-2xl bg-primary-50 dark:bg-primary-900/10 border border-primary-200 dark:border-primary-800 mb-10 space-y-4">
            <div className="flex justify-between items-center">
              <Text variant="muted" className="text-sm">
                Amount in Escrow
              </Text>
              <Text className="font-bold text-xl text-primary-600 dark:text-primary-400">
                {display.amount} {display.tokenSymbol}
              </Text>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-primary-200/50 dark:border-primary-800/50">
              <Text variant="muted" className="text-sm">
                Buyer Protection
              </Text>
              <Text className="font-semibold">
                {display.protectionTime}
              </Text>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {escrowAddress && (
              <Link href={`/escrows/${escrowAddress}`} className="sm:col-span-2">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full h-14 text-lg shadow-lg shadow-primary-500/20"
                  rightIcon={<ArrowRight size={18} />}
                >
                  View Escrow Dashboard
                </Button>
              </Link>
            )}

            {pdf.pdfUrl ? (
              <a
                href={pdf.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full h-12"
                  leftIcon={<Download size={18} />}
                >
                  Download PDF
                </Button>
              </a>
            ) : (
              <Button
                variant="outline"
                size="lg"
                className="w-full h-12"
                leftIcon={<Download size={18} />}
                onClick={() => void pdf.regenerate()}
                disabled={pdf.status === "loading"}
              >
                {pdf.status === "loading" ? "Generating..." : "Generate PDF"}
              </Button>
            )}

            <Button
              variant="outline"
              size="lg"
              className="w-full h-12"
              onClick={reset}
              leftIcon={<Plus size={18} />}
            >
              Create Another
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* PDF Important Notice */}
      <div className="mt-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50">
        <div className="flex gap-3">
          <AlertCircle size={20} className="text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <Heading level={5} className="text-sm mb-1 text-amber-800 dark:text-amber-400">
              Save Your Contract PDF
            </Heading>
            <Text className="text-xs text-amber-700 dark:text-amber-300/80">
              Download and keep your PDF contract safe. It serves as proof of agreement you can share with the seller, and an agent may require this document if a dispute arises.
            </Text>
          </div>
        </div>
      </div>

      {/* What's Next Steps */}
      <div className="mt-4 p-5 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800">
        <Heading level={5} className="text-sm mb-4">
          What&apos;s Next?
        </Heading>
        <div className="space-y-4">
          {/* Step 1: Inform Seller */}
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
              <Send size={16} className="text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <Text className="text-sm font-medium">Inform the Seller</Text>
              <Text variant="muted" className="text-xs">
                Share the escrow address or contract PDF with the seller so they can review and accept the terms.
              </Text>
            </div>
          </div>

          {/* Step 2: Wait for Delivery */}
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0">
              <Clock size={16} className="text-neutral-500" />
            </div>
            <div>
              <Text className="text-sm font-medium">Wait for Delivery</Text>
              <Text variant="muted" className="text-xs">
                Once the seller accepts, they will deliver the goods or services as agreed.
              </Text>
            </div>
          </div>

          {/* Step 3: Release Funds */}
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0">
              <BadgeCheck size={16} className="text-neutral-500" />
            </div>
            <div>
              <Text className="text-sm font-medium">Release Funds</Text>
              <Text variant="muted" className="text-xs">
                When you&apos;re satisfied with the delivery, release the funds to complete the transaction.
              </Text>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default SuccessStep;
