"use client";

/**
 * EscrowDetailClient
 *
 * Main component for the escrow detail page.
 * Fetches data, provides context, and composes all section components.
 * Implements mobile-first responsive layout.
 */

import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { type Address, type Hex } from "viem";

import { Button, Heading, Text, SkeletonCard } from "@/components/ui";
import { useEscrow } from "@/hooks";

import { EscrowDetailProvider, type EscrowData, type TokenInfo } from "./EscrowDetailContext";
import {
  EscrowHeader,
  EscrowDetails,
  EscrowTimeline,
  EscrowProtection,
  EscrowAgentTimer,
  EscrowContractInfo,
  EscrowAcceptanceTimer,
} from "./sections";
import { ActionsCard } from "./actions";

// =============================================================================
// TYPES
// =============================================================================

interface EscrowDetailClientProps {
  /** Escrow contract address */
  id: string;
}

// =============================================================================
// LOADING SKELETON
// =============================================================================

function LoadingSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <div className="h-4 w-24 bg-neutral-200 dark:bg-neutral-800 rounded" />
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-neutral-200 dark:bg-neutral-800 rounded" />
            <div className="h-4 w-40 bg-neutral-200 dark:bg-neutral-800 rounded" />
          </div>
          <div className="h-6 w-20 bg-neutral-200 dark:bg-neutral-800 rounded" />
        </div>
      </div>

      {/* Content Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <SkeletonCard className="h-64" />
          <SkeletonCard className="h-48" />
        </div>
        <div className="space-y-6 order-first lg:order-none">
          <SkeletonCard className="h-48" />
          <SkeletonCard className="h-32" />
          <SkeletonCard className="h-24" />
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// ERROR STATE
// =============================================================================

function ErrorState({ message }: { message?: string }) {
  return (
    <div className="max-w-4xl mx-auto py-20 text-center space-y-4">
      <div className="w-16 h-16 bg-error-50 dark:bg-error-900/10 rounded-full flex items-center justify-center mx-auto text-error-500">
        <AlertCircle size={32} />
      </div>
      <Heading level={2}>Escrow Not Found</Heading>
      <Text variant="muted">
        {message || "We couldn't find the escrow contract you're looking for. It might not be indexed yet."}
      </Text>
      <Link href="/escrows" className="inline-block pt-4">
        <Button variant="outline">
          <ArrowLeft size={16} className="mr-2" />
          Back to Escrows
        </Button>
      </Link>
    </div>
  );
}

// =============================================================================
// MAIN LAYOUT
// =============================================================================

function EscrowDetailLayout() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Page Header - Full Width */}
      <EscrowHeader />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details & Timeline (desktop) */}
        <div className="lg:col-span-2 space-y-6">
          <EscrowDetails />
          <EscrowTimeline />
        </div>

        {/* Right Column - Actions & Timers */}
        {/* Note: order-first on mobile makes this appear BEFORE details */}
        <div className="space-y-6 order-first lg:order-none">
          <EscrowAcceptanceTimer />
          <ActionsCard />
          <EscrowProtection />
          <EscrowAgentTimer />
          <EscrowContractInfo />
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

// Default agent response time (7 days in seconds)
// TODO: Fetch from factory contract config
const DEFAULT_AGENT_RESPONSE_TIME = BigInt(7 * 24 * 60 * 60);

export function EscrowDetailClient({ id }: EscrowDetailClientProps) {
  // Fetch escrow data from indexer
  const {
    data: escrowData,
    isLoading: escrowLoading,
    error: escrowError,
    refetch: refetchEscrow,
  } = useEscrow(id);

  // Loading state
  if (escrowLoading) {
    return <LoadingSkeleton />;
  }

  // Error state
  if (escrowError || !escrowData) {
    return <ErrorState message={escrowError?.message} />;
  }

  // Transform indexer data to our EscrowData type
  const escrow: EscrowData = {
    id: escrowData.id as Address,
    buyer: escrowData.buyer as Address,
    seller: escrowData.seller as Address,
    agent: escrowData.agent as Address | null,
    amount: BigInt(escrowData.amount),
    token: escrowData.token as Address,
    state: escrowData.state as EscrowData["state"],
    createdAt: BigInt(escrowData.createdAt),
    buyerProtectionTime: BigInt(escrowData.buyerProtectionTime),
    sellerAcceptDeadline: BigInt(escrowData.sellerAcceptDeadline || 0),
    termsHash: escrowData.termsHash as Hex,
    version: escrowData.version,
    fundedAt: BigInt(escrowData.fundedAt || 0),
    fulfilledAt: escrowData.fulfilledAt ? BigInt(escrowData.fulfilledAt) : null,
    resolvedAt: escrowData.resolvedAt ? BigInt(escrowData.resolvedAt) : null,
    agentInvitedAt: escrowData.agentInvitedAt ? BigInt(escrowData.agentInvitedAt) : null,
    splitProposer: (escrowData.splitProposer as Address) || null,
    proposedBuyerBps: escrowData.proposedBuyerBps ?? null,
    proposedSellerBps: escrowData.proposedSellerBps ?? null,
    buyerApprovedSplit: escrowData.buyerApprovedSplit ?? null,
    sellerApprovedSplit: escrowData.sellerApprovedSplit ?? null,
    buyerReceived: escrowData.buyerReceived ? BigInt(escrowData.buyerReceived) : null,
    sellerReceived: escrowData.sellerReceived ? BigInt(escrowData.sellerReceived) : null,
    agentFeeReceived: escrowData.agentFeeReceived ? BigInt(escrowData.agentFeeReceived) : null,
    creationFee: BigInt(escrowData.creationFee || 0),
  };

  // Token info - hardcoded for now, could be fetched from token contract
  // TODO: Fetch actual token info from contract or have it in indexer
  const tokenInfo: TokenInfo = {
    address: escrow.token,
    symbol: "USDT", // TODO: Get from token contract
    decimals: 6, // TODO: Get from token contract
  };

  return (
    <EscrowDetailProvider
      escrow={escrow}
      tokenInfo={tokenInfo}
      agentResponseTime={DEFAULT_AGENT_RESPONSE_TIME}
      onRefetch={async () => {
        await refetchEscrow();
      }}
    >
      <EscrowDetailLayout />
    </EscrowDetailProvider>
  );
}
