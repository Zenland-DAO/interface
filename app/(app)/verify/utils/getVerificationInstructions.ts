/**
 * Get contextual instructions based on user's role and escrow state
 * 
 * Pure function following Single Responsibility Principle
 */

import {
  ESCROW_STATES,
  TERMINAL_STATES,
  type EscrowRole,
  type EscrowStateValue,
  type WalletInstructions,
} from "./types";

/**
 * Determines the user's role in the escrow contract
 */
export function determineUserRole(
  connectedAddress: string | undefined,
  buyer: string,
  seller: string,
  agent: string | null
): EscrowRole {
  if (!connectedAddress) return "none";
  
  const normalizedAddress = connectedAddress.toLowerCase();
  
  if (normalizedAddress === buyer.toLowerCase()) return "buyer";
  if (normalizedAddress === seller.toLowerCase()) return "seller";
  if (agent && normalizedAddress === agent.toLowerCase()) return "agent";
  
  return "none";
}

/**
 * Check if the state is a terminal (completed) state
 */
function isTerminalState(state: EscrowStateValue): boolean {
  return TERMINAL_STATES.includes(state as typeof TERMINAL_STATES[number]);
}

/**
 * Get instructions for buyer based on escrow state
 */
function getBuyerInstructions(state: EscrowStateValue): WalletInstructions {
  if (isTerminalState(state)) {
    return {
      title: "Contract Completed",
      description: "This contract has been completed and finalized.",
      variant: "completed",
    };
  }

  switch (state) {
    case ESCROW_STATES.PENDING:
      return {
        title: "Waiting for Seller",
        description: "The seller needs to review and accept this contract. Contact them to confirm participation.",
        variant: "info",
      };
    case ESCROW_STATES.ACTIVE:
      return {
        title: "Contract Active",
        description: "The contract is active. Wait for the seller to deliver, then release funds when satisfied.",
        variant: "info",
      };
    case ESCROW_STATES.FULFILLED:
      return {
        title: "Delivery Confirmed",
        description: "The seller has confirmed fulfillment. Review the delivery and release funds if satisfied.",
        variant: "action",
      };
    case ESCROW_STATES.DISPUTED:
      return {
        title: "Dispute Open",
        description: "You have opened a dispute. You can invite the agent to resolve it or propose a settlement.",
        variant: "warning",
      };
    case ESCROW_STATES.AGENT_INVITED:
      return {
        title: "Agent Investigating",
        description: "The agent has been invited to resolve this dispute. Await their decision.",
        variant: "info",
      };
    default:
      return {
        title: "Contract Active",
        description: "This contract is in progress.",
        variant: "info",
      };
  }
}

/**
 * Get instructions for seller based on escrow state
 */
function getSellerInstructions(state: EscrowStateValue): WalletInstructions {
  if (isTerminalState(state)) {
    return {
      title: "Contract Completed",
      description: "This contract has been completed and finalized.",
      variant: "completed",
    };
  }

  switch (state) {
    case ESCROW_STATES.PENDING:
      return {
        title: "Action Required",
        description: "This contract awaits your confirmation. Review the terms carefully and accept to activate the escrow.",
        variant: "action",
      };
    case ESCROW_STATES.ACTIVE:
      return {
        title: "Safe to Deliver",
        description: "The contract is active and funds are locked. It's safe to deliver the product or service. The funds cannot be withdrawn except through the contract rules.",
        variant: "action",
      };
    case ESCROW_STATES.FULFILLED:
      return {
        title: "Awaiting Release",
        description: "You've confirmed fulfillment. Waiting for the buyer to release funds. If they don't release within the protection period, you can claim the funds.",
        variant: "info",
      };
    case ESCROW_STATES.DISPUTED:
      return {
        title: "Dispute Open",
        description: "A dispute has been opened. You can invite the agent to resolve it, propose a settlement, or issue a refund.",
        variant: "warning",
      };
    case ESCROW_STATES.AGENT_INVITED:
      return {
        title: "Agent Investigating",
        description: "The agent has been invited to resolve this dispute. Await their decision.",
        variant: "info",
      };
    default:
      return {
        title: "Contract Active",
        description: "This contract is in progress.",
        variant: "info",
      };
  }
}

/**
 * Get instructions for agent based on escrow state
 */
function getAgentInstructions(state: EscrowStateValue): WalletInstructions {
  if (isTerminalState(state)) {
    return {
      title: "Contract Completed",
      description: "This contract has been completed and finalized.",
      variant: "completed",
    };
  }

  switch (state) {
    case ESCROW_STATES.AGENT_INVITED:
      return {
        title: "Action Required",
        description: "You are the agent. This contract awaits your investigation and resolution. Review the evidence and make a fair decision.",
        variant: "action",
      };
    case ESCROW_STATES.PENDING:
    case ESCROW_STATES.ACTIVE:
    case ESCROW_STATES.FULFILLED:
    case ESCROW_STATES.DISPUTED:
      return {
        title: "Assigned Agent",
        description: "You are the assigned agent for this contract. Parties have not invited you to resolve a dispute yet.",
        variant: "info",
      };
    default:
      return {
        title: "Assigned Agent",
        description: "You are the assigned agent for this contract.",
        variant: "info",
      };
  }
}

/**
 * Get instructions for non-participants or disconnected wallets
 */
function getNonParticipantInstructions(isConnected: boolean): WalletInstructions {
  if (!isConnected) {
    return {
      title: "Connect Wallet",
      description: "Connect your wallet to receive personalized instructions based on your role in this contract.",
      variant: "info",
    };
  }

  return {
    title: "Not a Participant",
    description: "Your connected wallet is not a participant in this contract. You are viewing as a third party.",
    variant: "info",
  };
}

/**
 * Main function to get verification instructions
 * 
 * @param state - Current escrow state (null if contract not deployed)
 * @param role - User's role in the contract
 * @param isConnected - Whether a wallet is connected
 */
export function getVerificationInstructions(
  state: EscrowStateValue | null,
  role: EscrowRole,
  isConnected: boolean
): WalletInstructions {
  // Contract not deployed - no instructions to give
  if (state === null) {
    return {
      title: "Contract Not Found",
      description: "This contract has not been deployed on-chain. No actions are available.",
      variant: "warning",
    };
  }

  switch (role) {
    case "buyer":
      return getBuyerInstructions(state);
    case "seller":
      return getSellerInstructions(state);
    case "agent":
      return getAgentInstructions(state);
    case "none":
      return getNonParticipantInstructions(isConnected);
  }
}
