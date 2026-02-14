"use client";

/**
 * VerificationStatusBanner component
 * 
 * Displays the verification status with appropriate styling:
 * - Success (hash match): Green success banner
 * - Not Deployed: Alarming yellow/red warning
 * - Hash Mismatch: Alarming red scam warning
 * - Error: Red error banner
 * - Loading: Loading state
 */

import { CheckCircle2, XCircle, AlertTriangle, Loader2, ShieldAlert } from "lucide-react";
import { Card, CardBody, Heading, Text } from "@/components/ui";
import type { OnChainStatus } from "../utils";

interface VerificationStatusBannerProps {
  status: OnChainStatus;
  signerAddress?: string;
}

/**
 * Format address for display
 */
function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Success banner - hash matches on-chain
 */
function SuccessBanner({ signerAddress }: { signerAddress?: string }) {
  return (
    <Card variant="elevated" className="overflow-hidden">
      <div className="bg-success-100 dark:bg-success-900/20 px-6 py-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-success-500 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-6 h-6 text-white" />
        </div>
        <div>
          <Heading level={3} className="text-success-700 dark:text-success-400">
            Verified ✓
          </Heading>
          <Text variant="small" className="text-success-600 dark:text-success-500">
            This PDF matches the on-chain contract record
          </Text>
        </div>
      </div>
      {signerAddress && (
        <CardBody className="py-3">
          <div className="flex items-center justify-between">
            <Text variant="small" className="text-neutral-500">
              Signed by Zenland
            </Text>
            <code className="text-sm font-mono">{formatAddress(signerAddress)}</code>
          </div>
        </CardBody>
      )}
    </Card>
  );
}

/**
 * Not Deployed banner - contract doesn't exist on-chain
 * Uses alarming yellow/red design
 */
function NotDeployedBanner() {
  return (
    <Card variant="elevated" className="overflow-hidden border-2 border-warning-500">
      <div className="bg-warning-100 dark:bg-warning-900/30 px-6 py-5">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-warning-500 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-7 h-7 text-white" />
          </div>
          <div className="space-y-2">
            <Heading level={3} className="text-warning-700 dark:text-warning-400">
              Contract Not Deployed
            </Heading>
            <Text className="text-warning-600 dark:text-warning-500">
              This PDF was signed by Zenland, but the contract does not exist on the blockchain.
            </Text>
          </div>
        </div>
      </div>
      
      {/* Alarming warning box */}
      <CardBody className="bg-error-50 dark:bg-error-900/20 border-t-2 border-error-300 dark:border-error-800">
        <div className="flex items-center gap-3 p-3 bg-error-100 dark:bg-error-900/40 rounded-lg border border-error-300 dark:border-error-700">
          <ShieldAlert className="w-6 h-6 text-error-600 dark:text-error-400 shrink-0" />
          <div>
            <Text className="font-bold text-error-700 dark:text-error-300 text-lg">
              THIS IS NOT AN ACTIVE CONTRACT
            </Text>
            <Text variant="small" className="text-error-600 dark:text-error-400 mt-1">
              Do not send any funds or goods based on this PDF. The contract must be deployed first.
            </Text>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

/**
 * Hash Mismatch banner - potential scam/tampering
 * Uses alarming red design
 */
function HashMismatchBanner({ pdfHash, onChainHash }: { pdfHash: string; onChainHash: string }) {
  return (
    <Card variant="elevated" className="overflow-hidden border-2 border-error-500">
      <div className="bg-error-100 dark:bg-error-900/30 px-6 py-5">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-error-600 flex items-center justify-center shrink-0 animate-pulse">
            <ShieldAlert className="w-7 h-7 text-white" />
          </div>
          <div className="space-y-2">
            <Heading level={3} className="text-error-700 dark:text-error-400">
              🚨 Hash Mismatch - Potential Scam
            </Heading>
            <Text className="text-error-600 dark:text-error-500">
              This PDF does not match the on-chain contract record. The document may have been tampered with.
            </Text>
          </div>
        </div>
      </div>
      
      {/* Hash comparison */}
      <CardBody className="space-y-3">
        <div className="space-y-1">
          <Text variant="small" className="text-neutral-500">PDF Hash (this document)</Text>
          <code className="text-xs font-mono bg-neutral-100 dark:bg-neutral-800 px-3 py-2 rounded block overflow-x-auto">
            {pdfHash}
          </code>
        </div>
        <div className="space-y-1">
          <Text variant="small" className="text-neutral-500">On-chain Hash (expected)</Text>
          <code className="text-xs font-mono bg-neutral-100 dark:bg-neutral-800 px-3 py-2 rounded block overflow-x-auto">
            {onChainHash}
          </code>
        </div>
      </CardBody>
      
      {/* Alarming warning box */}
      <CardBody className="bg-error-100 dark:bg-error-900/40 border-t-2 border-error-400 dark:border-error-700 pt-4">
        <div className="flex items-center gap-3 p-4 bg-error-200 dark:bg-error-900/60 rounded-lg border-2 border-error-400 dark:border-error-600">
          <XCircle className="w-8 h-8 text-error-600 dark:text-error-400 shrink-0" />
          <div>
            <Text className="font-bold text-error-700 dark:text-error-300 text-lg">
              ⛔ DO NOT TRUST THIS DOCUMENT
            </Text>
            <Text variant="small" className="text-error-600 dark:text-error-400 mt-1">
              This could be a scam or an outdated/modified version of the contract.
              Only trust documents that match the on-chain hash.
            </Text>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

/**
 * Error banner - generic error
 */
function ErrorBanner({ message }: { message: string }) {
  return (
    <Card variant="elevated" className="overflow-hidden">
      <div className="bg-error-100 dark:bg-error-900/20 px-6 py-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-error-500 flex items-center justify-center shrink-0">
          <XCircle className="w-6 h-6 text-white" />
        </div>
        <div>
          <Heading level={3} className="text-error-700 dark:text-error-400">
            Verification Error
          </Heading>
          <Text variant="small" className="text-error-600 dark:text-error-500">
            {message}
          </Text>
        </div>
      </div>
    </Card>
  );
}

/**
 * Loading banner
 */
function LoadingBanner() {
  return (
    <Card variant="elevated" className="overflow-hidden">
      <div className="bg-neutral-100 dark:bg-neutral-800 px-6 py-4 flex items-center gap-4">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        <div>
          <Heading level={4}>Verifying on-chain...</Heading>
          <Text variant="small" className="text-neutral-500">
            Checking contract data on the blockchain
          </Text>
        </div>
      </div>
    </Card>
  );
}

/**
 * Main component
 */
export function VerificationStatusBanner({ status, signerAddress }: VerificationStatusBannerProps) {
  switch (status.status) {
    case "loading":
      return <LoadingBanner />;
    
    case "hash_match":
      return <SuccessBanner signerAddress={signerAddress} />;
    
    case "not_deployed":
      return <NotDeployedBanner />;
    
    case "hash_mismatch":
      return <HashMismatchBanner pdfHash={status.pdfHash} onChainHash={status.onChainHash} />;
    
    case "error":
      return <ErrorBanner message={status.message} />;
    
    default:
      return null;
  }
}
