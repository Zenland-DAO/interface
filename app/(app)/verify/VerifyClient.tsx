"use client";

/**
 * VerifyClient
 *
 * Enhanced PDF verification page for Zenland escrow agreements.
 * 
 * Features:
 * 1. PDF upload via drag-and-drop
 * 2. Zenland signature verification
 * 3. On-chain hash comparison with clear status messages
 * 4. Connected wallet role-based instructions
 */

import { useState, useCallback } from "react";
import { keccak256, type Address, type Hex } from "viem";
import { useAccount } from "wagmi";
import { CheckCircle2, Shield } from "lucide-react";

import { Card, Heading, Text, Button } from "@/components/ui";
import { PageHeader } from "@/components/shared";
import {
  verifyZenlandEscrowPdf,
  type ZenlandEscrowPdfEnvelopeV1,
  type VerifyZenlandEscrowPdfResult,
} from "@/lib/pdf/verifyEscrowPdf";

// Local components and utilities
import {
  DropZone,
  VerificationStatusBanner,
  WalletInstructions,
  EscrowDetails,
} from "./components";
import {
  verifyOnChain,
  determineUserRole,
  getVerificationInstructions,
  type OnChainStatus,
  type EscrowStateValue,
} from "./utils";

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * Allowed PDF signers for Zenland.
 * This is the public key derived from the PDF signing private key.
 */
const ZENLAND_ALLOWED_SIGNERS: readonly Address[] = [
  "0x04311E018004AF0a8Ab3e74ABf75675D88Bd2549",
];

// =============================================================================
// TYPES
// =============================================================================

type VerificationState =
  | { status: "idle" }
  | { status: "loading"; fileName: string }
  | { status: "signature_failed"; reason: string }
  | {
      status: "verified";
      envelope: ZenlandEscrowPdfEnvelopeV1;
      signer: Address;
      pdfHash: Hex;
      onChainStatus: OnChainStatus;
      escrowState: EscrowStateValue | null;
    };

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function VerifyClient() {
  const [state, setState] = useState<VerificationState>({ status: "idle" });
  const { address: connectedAddress, isConnected } = useAccount();

  /**
   * Verify the uploaded PDF
   */
  const verifyPdf = useCallback(async (file: File) => {
    setState({ status: "loading", fileName: file.name });

    try {
      // Read file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      const pdfBytes = new Uint8Array(arrayBuffer);

      // Compute PDF hash
      const pdfHash = keccak256(pdfBytes);

      // Verify signature
      const verificationResult: VerifyZenlandEscrowPdfResult =
        await verifyZenlandEscrowPdf(pdfBytes, {
          allowedSigners: ZENLAND_ALLOWED_SIGNERS,
        });

      if (!verificationResult.ok || !verificationResult.envelope) {
        setState({
          status: "signature_failed",
          reason: verificationResult.reason || "Unknown verification error",
        });
        return;
      }

      const envelope = verificationResult.envelope;
      const escrow = envelope.escrow;

      // Set initial verified state with loading on-chain status
      setState({
        status: "verified",
        envelope,
        signer: verificationResult.signer!,
        pdfHash,
        onChainStatus: { status: "loading" },
        escrowState: null,
      });

      // Verify on-chain
      const onChainResult = await verifyOnChain(
        escrow.escrowAddress as Address,
        escrow.chainId,
        pdfHash
      );

      // Update state with on-chain result
      setState((prevState) => {
        if (prevState.status !== "verified") return prevState;
        return {
          ...prevState,
          onChainStatus: onChainResult.status,
          escrowState: onChainResult.state ?? null,
        };
      });
    } catch (err) {
      setState({
        status: "signature_failed",
        reason:
          err instanceof Error ? err.message : "An unexpected error occurred",
      });
    }
  }, []);

  /**
   * Reset to initial state
   */
  const handleReset = useCallback(() => {
    setState({ status: "idle" });
  }, []);

  // Get role and instructions if we have a verified envelope
  const role =
    state.status === "verified"
      ? determineUserRole(
          connectedAddress,
          state.envelope.escrow.buyer,
          state.envelope.escrow.seller,
          state.envelope.escrow.agent
        )
      : "none";

  const instructions =
    state.status === "verified"
      ? getVerificationInstructions(state.escrowState, role, isConnected)
      : null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="Verify PDF"
        description="Upload a Zenland escrow agreement PDF to verify its authenticity and check if it matches the on-chain record."
      />

      {/* Idle State - Drop Zone */}
      {state.status === "idle" && (
        <>
          <DropZone onFileSelect={verifyPdf} isLoading={false} />
          <InfoCard />
        </>
      )}

      {/* Loading State */}
      {state.status === "loading" && (
        <DropZone onFileSelect={verifyPdf} isLoading={true} />
      )}

      {/* Signature Failed State */}
      {state.status === "signature_failed" && (
        <SignatureFailedDisplay reason={state.reason} onReset={handleReset} />
      )}

      {/* Verified State - Show all details */}
      {state.status === "verified" && (
        <div className="space-y-6">
          {/* Verification Status Banner (most important) */}
          <VerificationStatusBanner
            status={state.onChainStatus}
            signerAddress={state.signer}
          />

          {/* Wallet Instructions (only if contract exists and hash matches) */}
          {instructions &&
            state.onChainStatus.status === "hash_match" && (
              <WalletInstructions
                instructions={instructions}
                role={role}
                isConnected={isConnected}
              />
            )}

          {/* Escrow Details */}
          <EscrowDetails envelope={state.envelope} onReset={handleReset} />
        </div>
      )}
    </div>
  );
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

/**
 * Info card shown on idle state
 */
function InfoCard() {
  return (
    <Card variant="outlined" padding="md">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
          <Shield className="w-5 h-5 text-primary-500" />
        </div>
        <div className="space-y-2">
          <Heading level={5}>What does verification check?</Heading>
          <ul className="space-y-1 text-sm text-neutral-600 dark:text-neutral-400">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success-500" />
              Zenland digital signature authenticity
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success-500" />
              PDF content integrity (tamper detection)
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success-500" />
              On-chain termsHash match
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success-500" />
              Role-based guidance for contract participants
            </li>
          </ul>
        </div>
      </div>
    </Card>
  );
}

/**
 * Display when signature verification fails
 */
function SignatureFailedDisplay({
  reason,
  onReset,
}: {
  reason: string;
  onReset: () => void;
}) {
  return (
    <Card variant="elevated" className="overflow-hidden">
      <div className="bg-error-100 dark:bg-error-900/20 px-6 py-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-error-500 flex items-center justify-center shrink-0">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <Heading level={3} className="text-error-700 dark:text-error-400">
            Invalid PDF
          </Heading>
          <Text variant="small" className="text-error-600 dark:text-error-500">
            This PDF is not a valid Zenland escrow agreement
          </Text>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="p-4 bg-error-50 dark:bg-error-900/10 rounded-lg">
          <Text variant="small" className="text-error-600 dark:text-error-400">
            <strong>Reason:</strong> {reason}
          </Text>
        </div>

        <Button variant="outline" onClick={onReset} className="w-full">
          Try Another PDF
        </Button>
      </div>
    </Card>
  );
}
