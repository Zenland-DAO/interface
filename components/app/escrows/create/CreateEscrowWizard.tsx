"use client";

/**
 * CreateEscrowWizard Component
 *
 * Main wizard container for escrow creation.
 * Manages the multi-step flow and provides the form context.
 *
 * Features:
 * - Step progress indicator
 * - Step-based rendering
 * - URL query param support for agent pre-fill
 * - Wallet connection required to proceed past Step 1
 * - Network awareness with testnet/mainnet banners
 */

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { isAddress } from "viem";
import { Heading, Text } from "@/components/ui";
import { ShieldCheck } from "lucide-react";
import { NetworkBanner } from "@/components/shared";
import { useNetworkGuard } from "@/hooks";

import { EscrowFormProvider, useEscrowForm } from "./index";
import { WizardProgress } from "./WizardProgress";
import { FormStep } from "./steps/FormStep";
import { ReviewStep } from "./steps/ReviewStep";
import { ApproveStep } from "./steps/ApproveStep";
import { ConfirmStep } from "./steps/ConfirmStep";
import { SuccessStep } from "./steps/SuccessStep";
import { type WizardStep } from "./types";

// =============================================================================
// WIZARD CONTENT
// =============================================================================

interface WizardContentProps {
  initialAgentAddress?: string;
}

function WizardContent({ initialAgentAddress }: WizardContentProps) {
  // IMPORTANT: instantiate the whole escrow form facade exactly once.
  // Step components mount/unmount as the user navigates. If each step calls
  // `useEscrowForm()` independently, hook-local state (e.g. permit signature)
  // gets reset and the app may incorrectly fall back to `createEscrow()`.
  const form = useEscrowForm();
  const { currentStep, goToStep, setAgent } = form;

  // Network awareness
  const {
    isOnTestnet,
    isOnSupportedChain,
    isConnected,
    chainName,
    switchToMainnet,
    isSwitching,
  } = useNetworkGuard();

  // Pre-fill agent address from URL query param
  useEffect(() => {
    if (initialAgentAddress && isAddress(initialAgentAddress)) {
      setAgent(initialAgentAddress, "browsed");
    }
  }, [initialAgentAddress, setAgent]);

  // Handle step click in progress indicator
  const handleStepClick = (step: WizardStep) => {
    // Only allow navigating to completed steps
    goToStep(step);
  };

  // Render the current step
  const renderStep = () => {
    switch (currentStep) {
      case "form":
        return <FormStep form={form} />;
      case "review":
        return <ReviewStep form={form} />;
      case "approve":
        return <ApproveStep form={form} />;
      case "confirm":
        return <ConfirmStep form={form} />;
      case "success":
        return <SuccessStep form={form} />;
      default:
        return <FormStep form={form} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Indicator - Hide on success step */}
      {currentStep !== "success" && (
        <div className="max-w-3xl mx-auto space-y-6">
          <WizardProgress
            currentStep={currentStep}
            onStepClick={handleStepClick}
          />

          {/* Main Header */}
          <div className="flex items-center gap-4 px-4 sm:px-0">
            <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-500 shrink-0">
              <ShieldCheck size={24} />
            </div>
            <div>
              <Heading level={2} className="text-xl">Create Escrow</Heading>
              <Text variant="muted" className="text-sm">Configure your contract and deposit funds</Text>
            </div>
          </div>
        </div>
      )}

      {/* Network Banner - Non-dismissible inline alert */}
      {currentStep !== "success" && (
        <NetworkBanner
          isOnTestnet={isOnTestnet}
          isOnSupportedChain={isOnSupportedChain}
          isConnected={isConnected}
          chainName={chainName}
          switchToMainnet={switchToMainnet}
          isSwitching={isSwitching}
        />
      )}

      {/* Step Content */}
      <div className="animate-fade-in">{renderStep()}</div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export interface CreateEscrowWizardProps {
  /** Pre-filled agent address from URL */
  initialAgentAddress?: string;
}

export function CreateEscrowWizard({ initialAgentAddress }: CreateEscrowWizardProps) {
  // Check URL params for agent address (fallback for direct navigation)
  const searchParams = useSearchParams();
  const agentFromUrl = searchParams.get("agent") || initialAgentAddress;

  return (
    <EscrowFormProvider>
      <WizardContent initialAgentAddress={agentFromUrl || undefined} />
    </EscrowFormProvider>
  );
}

export default CreateEscrowWizard;
