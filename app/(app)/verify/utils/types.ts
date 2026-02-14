/**
 * Types for PDF verification page
 */

import type { Address, Hex } from "viem";
import type { ZenlandEscrowPdfEnvelopeV1 } from "@/lib/pdf/verifyEscrowPdf";

/**
 * Escrow states as defined in the contract
 * Order: PENDING, ACTIVE, FULFILLED, RELEASED, DISPUTED, AGENT_INVITED, AGENT_RESOLVED, REFUNDED, SPLIT
 */
export const ESCROW_STATES = {
  PENDING: 0,
  ACTIVE: 1,
  FULFILLED: 2,
  RELEASED: 3,
  DISPUTED: 4,
  AGENT_INVITED: 5,
  AGENT_RESOLVED: 6,
  REFUNDED: 7,
  SPLIT: 8,
} as const;

export type EscrowStateValue = typeof ESCROW_STATES[keyof typeof ESCROW_STATES];

export const ESCROW_STATE_NAMES: Record<EscrowStateValue, string> = {
  [ESCROW_STATES.PENDING]: "PENDING",
  [ESCROW_STATES.ACTIVE]: "ACTIVE",
  [ESCROW_STATES.FULFILLED]: "FULFILLED",
  [ESCROW_STATES.RELEASED]: "RELEASED",
  [ESCROW_STATES.DISPUTED]: "DISPUTED",
  [ESCROW_STATES.AGENT_INVITED]: "AGENT_INVITED",
  [ESCROW_STATES.AGENT_RESOLVED]: "AGENT_RESOLVED",
  [ESCROW_STATES.REFUNDED]: "REFUNDED",
  [ESCROW_STATES.SPLIT]: "SPLIT",
};

/**
 * Terminal states - contract is completed
 */
export const TERMINAL_STATES = [
  ESCROW_STATES.RELEASED,
  ESCROW_STATES.AGENT_RESOLVED,
  ESCROW_STATES.REFUNDED,
  ESCROW_STATES.SPLIT,
] as const;

/**
 * User's role in the escrow contract
 */
export type EscrowRole = "buyer" | "seller" | "agent" | "none";

/**
 * On-chain verification status
 */
export type OnChainStatus =
  | { status: "not_deployed" }
  | { status: "hash_match"; state: EscrowStateValue }
  | { status: "hash_mismatch"; onChainHash: Hex; pdfHash: Hex; state: EscrowStateValue }
  | { status: "loading" }
  | { status: "error"; message: string };

/**
 * Result from the full verification process
 */
export interface VerificationResult {
  envelope: ZenlandEscrowPdfEnvelopeV1;
  signer: Address;
  pdfHash: Hex;
  onChainStatus: OnChainStatus;
}

/**
 * Wallet instructions based on role and state
 */
export interface WalletInstructions {
  title: string;
  description: string;
  variant: "info" | "action" | "completed" | "warning";
}
