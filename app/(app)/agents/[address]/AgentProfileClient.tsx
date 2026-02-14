"use client";

/**
 * AgentProfileClient
 *
 * Main component for the agent profile page.
 * Fetches data, provides context, and composes all section components.
 * Follows the same pattern as EscrowDetailClient for consistency.
 */

import { Shield } from "lucide-react";
import { type Address } from "viem";

import { Button, Card, CardBody, Heading, Text, SkeletonCard } from "@/components/ui";
import { useAgent } from "@/hooks";
import { useConnection } from "wagmi";
import { useAgentSelectionSender } from "@/components/app/escrows/create/useAgentSelectionSender";

import { AgentProfileProvider, type AgentData } from "./AgentProfileContext";
import {
  AgentHeader,
  AgentStats,
  AgentContact,
  AgentCollateral,
  SelectModeBanner,
} from "./sections";

// =============================================================================
// TYPES
// =============================================================================

interface AgentProfileClientProps {
  /** Agent wallet address */
  address: string;
  /** Whether in select mode (selecting agent for escrow) */
  isSelectMode?: boolean;
}

// =============================================================================
// LOADING SKELETON
// =============================================================================

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <SkeletonCard className="h-36" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonCard key={i} className="h-24" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SkeletonCard className="lg:col-span-2 h-48" />
        <SkeletonCard className="h-48" />
      </div>
    </div>
  );
}

// =============================================================================
// ERROR STATE
// =============================================================================

function ErrorState({ message }: { message?: string }) {
  return (
    <Card variant="outlined" className="border-error-200 dark:border-error-900/30">
      <CardBody className="p-12 text-center flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-error-50 dark:bg-error-900/20 flex items-center justify-center text-error-500">
          <Shield size={32} />
        </div>
        <div className="space-y-1">
          <Heading level={3}>Agent Not Found</Heading>
          <Text variant="muted">
            {message || "The requested agent could not be located."}
          </Text>
        </div>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </CardBody>
    </Card>
  );
}

// =============================================================================
// MAIN LAYOUT
// =============================================================================

function AgentProfileLayout() {
  return (
    <div className="space-y-6">
      {/* Agent Header Card */}
      <AgentHeader />

      {/* Stats Grid */}
      <AgentStats />

      {/* Content Grid: Contact & Collateral */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AgentContact />
        </div>
        <div>
          <AgentCollateral />
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function AgentProfileClient({ address, isSelectMode = false }: AgentProfileClientProps) {
  const { data: agentData, isLoading, error } = useAgent(address);
  const { address: userAddress } = useConnection();
  const { sendSelection } = useAgentSelectionSender();

  // Loading state
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  // Error state
  if (error || !agentData) {
    return <ErrorState message={error?.message} />;
  }

  // Check if user is viewing their own profile
  const isOwnProfile = userAddress
    ? address.toLowerCase() === userAddress.toLowerCase()
    : false;

  // Handle select agent
  const handleSelectAgent = () => {
    sendSelection(address);
  };

  // Transform indexer data to our AgentData type
  // Note: BigIntScalar from SDK can be string | number | bigint, so we convert to string
  const agent: AgentData = {
    id: agentData.id as Address,
    isActive: agentData.isActive,
    isAvailable: agentData.isAvailable,
    registrationTime: agentData.registrationTime ? String(agentData.registrationTime) : null,
    description: agentData.description,
    contact: agentData.contact,
    stablecoinStake: String(agentData.stablecoinStake),
    stablecoinDecimals: agentData.stablecoinDecimals || 6,
    daoTokenStake: String(agentData.daoTokenStake),
    totalEarnings: String(agentData.totalEarnings),
    totalSlashed: String(agentData.totalSlashed || "0"),
    totalResolved: agentData.totalResolved,
    activeCases: agentData.activeCases,
    assignmentFeeBps: agentData.assignmentFeeBps,
    disputeFeeBps: agentData.disputeFeeBps,
  };

  return (
    <AgentProfileProvider
      agent={agent}
      isOwnProfile={isOwnProfile}
      isSelectMode={isSelectMode}
      onSelectAgent={handleSelectAgent}
    >
      <div className="space-y-6 animate-fade-in">
        {/* Select Mode Banner */}
        {isSelectMode && <SelectModeBanner />}

        {/* Main Layout */}
        <AgentProfileLayout />
      </div>
    </AgentProfileProvider>
  );
}
