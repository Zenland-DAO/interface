"use client";

/**
 * FormStep Component
 *
 * First step of the escrow creation wizard.
 * Collects all the required information from the user.
 *
 * Layout: Two-column on desktop (form left, summary right)
 */

import { useMemo } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Button,
  Heading,
  Text,
  Select,
  NumberInput,
} from "@/components/ui";
import {
  ArrowRight,
  AlertCircle,
  Info,
  Wallet,
} from "lucide-react";

import { AgentSelector } from "../AgentSelector";
import type { UseEscrowFormReturn } from "../useEscrowForm";
import { MarkdownEditor } from "@/components/shared";
import {
  BUYER_PROTECTION_PRESETS,
  SUPPORTED_ESCROW_TOKENS,
  MAX_CUSTOM_PROTECTION_DAYS,
} from "../constants";
import { type BuyerProtectionPreset } from "../types";
import { useWalletAction } from "@/hooks/wallet/useWalletAction";

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 bg-primary-500 rounded-full" />
          <Heading
            level={4}
            className="uppercase tracking-widest text-[10px] font-bold text-primary-500"
          >
            {title}
          </Heading>
        </div>
        {description && (
          <Text variant="muted" className="text-xs ml-3 pl-0.5">
            {description}
          </Text>
        )}
      </div>
      <div className="pl-0">{children}</div>
    </section>
  );
}

interface ProtectionPresetButtonProps {
  preset: (typeof BUYER_PROTECTION_PRESETS)[number];
  isSelected: boolean;
  onClick: () => void;
}

function ProtectionPresetButton({
  preset,
  isSelected,
  onClick,
}: ProtectionPresetButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        px-4 py-2.5 rounded-xl border-2 transition-all duration-200
        text-sm font-medium
        ${isSelected
          ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
          : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 text-[var(--text-secondary)]"
        }
      `}
    >
      {preset.label}
    </button>
  );
}

interface LiveSummaryProps {
  amount: string;
  tokenSymbol: string;
  protectionTime: string;
  hasAgent: boolean;
  sellerAddress: string;
}

function LiveSummary({
  amount,
  tokenSymbol,
  protectionTime,
  hasAgent,
  sellerAddress,
}: LiveSummaryProps) {
  const shortSeller = sellerAddress
    ? `${sellerAddress.slice(0, 6)}...${sellerAddress.slice(-4)}`
    : "Not set";

  return (
    <Card className="sticky top-6">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Info size={16} className="text-primary-500" />
          <Heading level={5} className="text-sm">
            Quick Summary
          </Heading>
        </div>
      </CardHeader>
      <CardBody className="pt-0 space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Text variant="muted" className="text-sm">
              Amount
            </Text>
            <Text className="font-semibold">
              {amount || "0"} {tokenSymbol}
            </Text>
          </div>

          <div className="flex justify-between items-center">
            <Text variant="muted" className="text-sm">
              Seller
            </Text>
            <Text className="font-mono text-sm">{shortSeller}</Text>
          </div>

          <div className="flex justify-between items-center">
            <Text variant="muted" className="text-sm">
              Protection
            </Text>
            <Text className="text-sm">{protectionTime || "Not set"}</Text>
          </div>

          <div className="flex justify-between items-center">
            <Text variant="muted" className="text-sm">
              Agent
            </Text>
            <span
              className={`
                px-2 py-0.5 rounded-full text-xs font-medium
                ${hasAgent
                  ? "bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-400"
                  : "bg-warning-100 dark:bg-warning-900/30 text-warning-700 dark:text-warning-400"
                }
              `}
            >
              {hasAgent ? "Assigned" : "Locked"}
            </span>
          </div>
        </div>

        {!hasAgent && (
          <div className="p-3 rounded-lg bg-warning-50 dark:bg-warning-900/10 border border-warning-200 dark:border-warning-800">
            <Text className="text-xs text-warning-700 dark:text-warning-400">
              ⚠️ Without an agent, disputes cannot be resolved.
            </Text>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export interface FormStepProps {
  form: UseEscrowFormReturn;
}

export function FormStep({ form }: FormStepProps) {
  const {
    formData,
    computed,
    errors,
    setField,
    setTouched,
    setAgent,
    setLockedConfirmation,
    canProceed,
    goNext,
    display,
    tokenApproval,
  } = form;

  const { requireWallet, isConnected } = useWalletAction();

  const amountError = errors.amount ?? tokenApproval.balanceError;

  // Token options for select
  const tokenOptions = useMemo(
    () =>
      SUPPORTED_ESCROW_TOKENS.map((token) => ({
        label: token,
        value: token,
      })),
    []
  );

  // Handle protection preset change
  const handlePresetChange = (preset: BuyerProtectionPreset) => {
    setField("buyerProtectionPreset", preset);
    if (preset !== "custom") {
      setField("customProtectionDays", "");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Form - Left Column */}
      <div className="lg:col-span-2">
        <Card variant="elevated" className="border-none shadow-2xl shadow-primary-500/5">
          {/* Card Header Removed - moved to CreateEscrowWizard */}

          <CardBody className="p-4 sm:p-8 space-y-10">
            {/* Seller Address */}
            <FormSection
              title="Seller Address"
              description="The wallet address that will receive payment"
            >
              <div className="space-y-2">
                <input
                  type="text"
                  value={formData.sellerAddress}
                  onChange={(e) => setField("sellerAddress", e.target.value)}
                  onBlur={() => setTouched("sellerAddress")}
                  placeholder="0x..."
                  className={`
                    w-full h-12 px-4 rounded-xl border font-mono
                    bg-[var(--bg-primary)] text-sm outline-none
                    transition-all duration-200
                    ${errors.sellerAddress
                      ? "border-error-500 ring-1 ring-error-500/20"
                      : "border-[var(--border-secondary)] focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    }
                  `}
                />
                {errors.sellerAddress && (
                  <div className="flex items-center gap-1.5 animate-slide-up">
                    <AlertCircle size={12} className="text-error-500" />
                    <Text className="text-xs text-error-500">
                      {errors.sellerAddress}
                    </Text>
                  </div>
                )}
              </div>
            </FormSection>

            {/* Amount & Token */}
            <FormSection
              title="Payment Amount"
              description="The amount to be held in escrow"
            >
              <div className="flex gap-3">
                <div className="w-32">
                  <Select
                    options={tokenOptions}
                    value={formData.tokenType}
                    onChange={(val) =>
                      setField("tokenType", val as "USDC" | "USDT")
                    }
                    hideLabel
                  />
                </div>
                <div className="flex-1">
                  <NumberInput
                    value={formData.amount}
                    onChange={(val) => setField("amount", val)}
                    onBlur={() => setTouched("amount")}
                    placeholder="0.00"
                    suffix={formData.tokenType}
                    error={amountError ?? undefined}
                  />
                </div>
              </div>
            </FormSection>

            {/* Buyer Protection Time */}
            <FormSection
              title="Buyer Protection Period"
              description="Time the buyer has to request a dispute or release funds"
            >
              <div className="space-y-4">
                {/* Preset Buttons */}
                <div className="flex flex-wrap gap-2">
                  {BUYER_PROTECTION_PRESETS.map((preset) => (
                    <ProtectionPresetButton
                      key={preset.value}
                      preset={preset}
                      isSelected={formData.buyerProtectionPreset === preset.value}
                      onClick={() => handlePresetChange(preset.value)}
                    />
                  ))}
                </div>

                {/* Custom Input */}
                {formData.buyerProtectionPreset === "custom" && (
                  <div className="animate-slide-down">
                    <NumberInput
                      label="Custom Duration (days)"
                      value={formData.customProtectionDays}
                      onChange={(val) => setField("customProtectionDays", val)}
                      onBlur={() => setTouched("customProtectionDays")}
                      placeholder="Enter number of days"
                      suffix="days"
                      helperText={`Maximum: ${MAX_CUSTOM_PROTECTION_DAYS} days`}
                      error={errors.customProtectionDays}
                      allowDecimals={false}
                    />
                  </div>
                )}

                {errors.buyerProtectionPreset && (
                  <div className="flex items-center gap-1.5 animate-slide-up">
                    <AlertCircle size={12} className="text-error-500" />
                    <Text className="text-xs text-error-500">
                      {errors.buyerProtectionPreset}
                    </Text>
                  </div>
                )}
              </div>
            </FormSection>

            {/* Contract Terms */}
            <FormSection
              title="Contract Terms"
              description="Describe the deliverables and conditions for this escrow"
            >
              <div className="space-y-2">
                <MarkdownEditor
                  value={formData.terms}
                  onChange={(val) => setField("terms", val)}
                  onBlur={() => setTouched("terms")}
                  rows={4}
                  placeholder="Describe what the seller must deliver, deadlines, quality expectations, etc."
                  error={errors.terms}
                />

                <div className="flex justify-between items-center">
                  <div>
                    {errors.terms && (
                      <div className="flex items-center gap-1.5 animate-slide-up">
                        <AlertCircle size={12} className="text-error-500" />
                        <Text className="text-xs text-error-500">
                          {errors.terms}
                        </Text>
                      </div>
                    )}
                  </div>
                  <Text variant="muted" className="text-xs">
                    {formData.terms.length} characters
                  </Text>
                </div>
              </div>
            </FormSection>

            {/* Agent Selection */}
            <FormSection
              title="Dispute Resolution Agent"
              description="Choose how disputes will be handled"
            >
              <AgentSelector
                mode={formData.agentSelectionMode}
                agentAddress={formData.agentAddress}
                lockedConfirmations={formData.lockedEscrowConfirmations}
                error={errors.agentAddress || errors.lockedEscrowConfirmations}
                isTouched={true}
                escrowAmount={computed.amountBigInt}
                onModeChange={(mode) => setField("agentSelectionMode", mode)}
                onAgentChange={(address, mode) => {
                  // Mark as touched so validation errors are visible immediately.
                  // This avoids the UX where the button is disabled but no message is shown.
                  setTouched("agentAddress");
                  setAgent(address, mode);
                }}
                onLockedConfirmationChange={setLockedConfirmation}
                onTouch={() => setTouched("agentAddress")}
              />
            </FormSection>
          </CardBody>

          <CardFooter className="border-t border-[var(--border-secondary)] px-4 py-4 sm:px-8 sm:py-6 flex justify-end">
            <Button
              variant="primary"
              size="lg"
              className="w-full sm:w-auto px-12"
              onClick={() => requireWallet(goNext)}
              disabled={isConnected && !canProceed}
              rightIcon={isConnected ? <ArrowRight size={18} /> : <Wallet size={18} />}
            >
              {isConnected ? "Continue to Review" : "Connect Wallet to Continue"}
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Summary Sidebar - Right Column */}
      <div className="hidden lg:block">
        <LiveSummary
          amount={formData.amount}
          tokenSymbol={display.tokenSymbol}
          protectionTime={display.protectionTime}
          hasAgent={computed.hasAgent}
          sellerAddress={formData.sellerAddress}
        />
      </div>
    </div>
  );
}

export default FormStep;
