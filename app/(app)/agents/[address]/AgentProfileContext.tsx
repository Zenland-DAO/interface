"use client";

/**
 * AgentProfileContext
 *
 * Provides agent data to all child components.
 * Follows the same pattern as EscrowDetailContext for consistency.
 */

import { createContext, useContext, type ReactNode } from "react";
import { type Address } from "viem";

// =============================================================================
// TYPES
// =============================================================================

export interface AgentData {
  id: Address;
  isActive: boolean;
  isAvailable: boolean;
  registrationTime: string | null;
  description: string | null;
  contact: string | null;
  stablecoinStake: string;
  stablecoinDecimals: number;
  daoTokenStake: string;
  totalEarnings: string;
  totalSlashed: string;
  totalResolved: number;
  activeCases: number;
  assignmentFeeBps: number;
  disputeFeeBps: number;
}

interface AgentProfileContextValue {
  /** Agent data */
  agent: AgentData;
  /** Whether current user is viewing their own profile */
  isOwnProfile: boolean;
  /** Whether in select mode (selecting agent for escrow) */
  isSelectMode: boolean;
  /** Handler to select this agent */
  onSelectAgent: () => void;
}

// =============================================================================
// CONTEXT
// =============================================================================

const AgentProfileContext = createContext<AgentProfileContextValue | null>(null);

// =============================================================================
// PROVIDER
// =============================================================================

interface AgentProfileProviderProps {
  children: ReactNode;
  agent: AgentData;
  isOwnProfile: boolean;
  isSelectMode: boolean;
  onSelectAgent: () => void;
}

export function AgentProfileProvider({
  children,
  agent,
  isOwnProfile,
  isSelectMode,
  onSelectAgent,
}: AgentProfileProviderProps) {
  return (
    <AgentProfileContext.Provider
      value={{
        agent,
        isOwnProfile,
        isSelectMode,
        onSelectAgent,
      }}
    >
      {children}
    </AgentProfileContext.Provider>
  );
}

// =============================================================================
// HOOK
// =============================================================================

export function useAgentProfile(): AgentProfileContextValue {
  const context = useContext(AgentProfileContext);
  if (!context) {
    throw new Error("useAgentProfile must be used within AgentProfileProvider");
  }
  return context;
}
