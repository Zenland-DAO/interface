"use client";

/**
 * ReviewStep Component
 *
 * Second step of the escrow creation wizard.
 * Displays a summary of all entered information and fees.
 * User can go back to edit or proceed to approval.
 */

import { useTranslations } from "next-intl";
import {
  Card,
  CardBody,
  CardFooter,
  Button,
  Heading,
  Text,
} from "@/components/ui";
import {
  ArrowLeft,
  ArrowRight,
  User,
  Coins,
  Clock,
  FileText,
  Shield,
  AlertTriangle,
  Copy,
  Check,
  Wallet,
  Calculator,
  Download,
  Loader2,
} from "lucide-react";
import { useState, useCallback } from "react";

import { MarkdownRenderer } from "@/components/shared";

import type { UseEscrowFormReturn } from "../useEscrowForm";

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface SummaryRowProps {
  icon?: React.ReactNode;
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
  mono?: boolean;
}

function SummaryRow({ icon, label, value, highlight, mono }: SummaryRowProps) {
  return (
    <div className="flex items-start justify-between py-3">
      <div className="flex items-center gap-2">
        {icon && (
          <span className="text-[var(--text-tertiary)]">{icon}</span>
        )}
        <Text variant="muted" className="text-sm">
          {label}
        </Text>
      </div>
      <div
        className={`
          text-right max-w-[60%]
          ${highlight ? "font-semibold text-[var(--text-primary)]" : ""}
          ${mono ? "font-mono text-sm" : ""}
        `}
      >
        {value}
      </div>
    </div>
  );
}

interface AddressDisplayProps {
  address: string;
}

function AddressDisplay({ address }: AddressDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [address]);

  const shortAddress = `${address.slice(0, 10)}...${address.slice(-8)}`;

  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-sm">{shortAddress}</span>
      <button
        type="button"
        onClick={handleCopy}
        className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        title="Copy address"
      >
        {copied ? (
          <Check size={14} className="text-success-500" />
        ) : (
          <Copy size={14} className="text-[var(--text-tertiary)]" />
        )}
      </button>
    </div>
  );
}

interface FeesBreakdownProps {
  amount: string;
  creationFee: string;
  assignmentFee: string;
  totalAmount: string;
  tokenSymbol: string;
  hasAgent: boolean;
}

function FeesBreakdown({
  amount,
  creationFee,
  assignmentFee,
  totalAmount,
  tokenSymbol,
  hasAgent,
  t,
}: FeesBreakdownProps & { t: (key: string) => string }) {
  return (
    <Card className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
      <CardBody className="p-4 space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <Calculator size={16} className="text-primary-500" />
          <Heading level={5} className="text-sm">
            {t("create.review.feesBreakdown")}
          </Heading>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <Text variant="muted">{t("create.review.escrowAmount")}</Text>
            <Text>
              {amount} {tokenSymbol}
            </Text>
          </div>

          <div className="flex justify-between">
            <Text variant="muted">{t("create.review.creationFee")}</Text>
            <Text>
              {creationFee} {tokenSymbol}
            </Text>
          </div>

          {hasAgent && (
            <div className="flex justify-between">
              <Text variant="muted">{t("create.review.agentAssignmentFee")}</Text>
              <Text>
                {assignmentFee} {tokenSymbol}
              </Text>
            </div>
          )}

          <div className="border-t border-neutral-200 dark:border-neutral-700 pt-2 mt-2">
            <div className="flex justify-between font-semibold">
              <Text>{t("create.review.totalRequired")}</Text>
              <Text className="text-primary-600 dark:text-primary-400">
                {totalAmount} {tokenSymbol}
              </Text>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

interface PredictedAddressCardProps {
  address: string | undefined;
}

function PredictedAddressCard({ address, t }: PredictedAddressCardProps & { t: (key: string) => string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [address]);

  if (!address) {
    return (
      <Card className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
        <CardBody className="p-4">
          <div className="flex items-center gap-2 text-[var(--text-tertiary)]">
            <Wallet size={16} />
            <Text variant="muted" className="text-sm">
              {t("create.review.generatingAddress")}
            </Text>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="bg-primary-50 dark:bg-primary-900/10 border-primary-200 dark:border-primary-800">
      <CardBody className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet size={16} className="text-primary-500" />
            <Text className="text-sm font-medium text-primary-700 dark:text-primary-300">
              {t("create.review.predictedAddress")}
            </Text>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-primary-600 dark:text-primary-400">
              {address.slice(0, 10)}...{address.slice(-8)}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="p-1 rounded hover:bg-primary-100 dark:hover:bg-primary-800/30 transition-colors"
              title="Copy address"
            >
              {copied ? (
                <Check size={14} className="text-success-500" />
              ) : (
                <Copy size={14} className="text-primary-500" />
              )}
            </button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export interface ReviewStepProps {
  form: UseEscrowFormReturn;
}

export function ReviewStep({ form }: ReviewStepProps) {
  const t = useTranslations("escrows");
  const {
    formData,
    computed,
    display,
    goBack,
    goNext,
    canProceed,
    pdf,
  } = form;

  // Check if we're in a regenerating state (PDF is loading or no PDF yet)
  const isRegenerating = pdf.status === "loading" || !pdf.pdfUrl;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Review - Left Column */}
      <div className="lg:col-span-2 space-y-6">
        {/* Summary Card */}
        <Card variant="elevated" className="border-none shadow-2xl shadow-primary-500/5">
          <CardBody className="p-4 sm:p-8">
            {/* Parties */}
            <div className="space-y-1 pb-4 border-b border-[var(--border-secondary)]">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-5 bg-primary-500 rounded-full" />
                <Heading level={4} className="uppercase tracking-widest text-[10px] font-bold text-primary-500">
                  {t("create.sections.parties")}
                </Heading>
              </div>
              <SummaryRow
                icon={<User size={16} />}
                label={t("create.summary.seller")}
                value={<AddressDisplay address={formData.sellerAddress} />}
              />
              {computed.hasAgent && (
                <SummaryRow
                  icon={<Shield size={16} />}
                  label={t("create.summary.agent")}
                  value={<AddressDisplay address={formData.agentAddress} />}
                />
              )}
            </div>

            {/* Financial Details */}
            <div className="space-y-1 py-4 border-b border-[var(--border-secondary)]">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-5 bg-primary-500 rounded-full" />
                <Heading level={4} className="uppercase tracking-widest text-[10px] font-bold text-primary-500">
                  {t("create.sections.financialDetails")}
                </Heading>
              </div>
              <SummaryRow
                icon={<Coins size={16} />}
                label={t("create.summary.amount")}
                value={`${display.amount} ${display.tokenSymbol}`}
                highlight
              />
              <SummaryRow
                icon={<Clock size={16} />}
                label={t("create.summary.protection")}
                value={display.protectionTime}
              />
            </div>

            {/* Contract Terms */}
            <div className="py-4 border-b border-[var(--border-secondary)]">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-5 bg-primary-500 rounded-full" />
                <Heading level={4} className="uppercase tracking-widest text-[10px] font-bold text-primary-500">
                  {t("create.sections.contractTerms")}
                </Heading>
              </div>
              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800">
                <div className="flex items-start gap-2 mb-2">
                  <FileText size={16} className="text-[var(--text-tertiary)] mt-0.5" />
                  <div className="flex-1 min-w-0">
                    {formData.terms ? (
                      <MarkdownRenderer content={formData.terms} />
                    ) : (
                      <Text className="text-sm text-[var(--text-tertiary)]">{t("create.review.noTerms")}</Text>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Agent Status */}
            <div className="pt-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-5 bg-primary-500 rounded-full" />
                <Heading level={4} className="uppercase tracking-widest text-[10px] font-bold text-primary-500">
                  {t("create.sections.disputeResolution")}
                </Heading>
              </div>
              {computed.hasAgent ? (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-success-50 dark:bg-success-900/10 border border-success-200 dark:border-success-800">
                  <Shield size={20} className="text-success-600 dark:text-success-400" />
                  <div>
                    <Text className="font-medium text-success-800 dark:text-success-200">
                      {t("create.review.agentAssigned")}
                    </Text>
                    <Text variant="muted" className="text-xs">
                      {t("create.review.agentAssignedDesc")}
                    </Text>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-warning-50 dark:bg-warning-900/10 border border-warning-200 dark:border-warning-800">
                  <AlertTriangle size={20} className="text-warning-600 dark:text-warning-400 mt-0.5" />
                  <div>
                    <Text className="font-medium text-warning-800 dark:text-warning-200">
                      {t("create.review.lockedEscrow")}
                    </Text>
                    <Text variant="muted" className="text-xs mt-1">
                      {t("create.review.lockedEscrowDesc")}
                    </Text>
                  </div>
                </div>
              )}
            </div>
          </CardBody>

          <CardFooter className="border-t border-[var(--border-secondary)] px-4 py-4 sm:px-8 sm:py-6 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
              onClick={goBack}
              leftIcon={<ArrowLeft size={18} />}
            >
              {t("create.review.backToEdit")}
            </Button>
            <Button
              variant="primary"
              size="lg"
              className="w-full sm:w-auto px-12"
              onClick={goNext}
              disabled={!canProceed || isRegenerating}
              rightIcon={isRegenerating ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
            >
              {isRegenerating ? t("create.review.generatingAgreement") : t("create.review.proceedToApproval")}
            </Button>
          </CardFooter>
        </Card>

        {/* Auto-regeneration Info - shows when regenerating */}
        {isRegenerating && (
          <Card className="border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/10">
            <CardBody className="p-4">
              <div className="flex items-start gap-3">
                <Loader2 size={20} className="text-primary-600 dark:text-primary-400 mt-0.5 animate-spin" />
                <div className="flex-1">
                  <Text className="font-medium text-primary-800 dark:text-primary-200">
                    {t("create.review.generatingAgreementInfo")}
                  </Text>
                  <Text variant="muted" className="text-xs mt-1">
                    {t("create.review.generatingAgreementDesc")}
                  </Text>
                </div>
              </div>
            </CardBody>
          </Card>
        )}
      </div>

      {/* Fees Sidebar - Right Column */}
      <div className="space-y-4">
        {/* Agreement PDF */}
        <Card className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
          <CardBody className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-primary-500" />
                <Heading level={5} className="text-sm">
                  {t("create.review.agreementPdf")}
                </Heading>
              </div>
              {pdf.status === "loading" && (
                <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
                  <Loader2 size={14} className="animate-spin" />
                  <span>{t("create.review.generating")}</span>
                </div>
              )}
            </div>

            {pdf.status === "error" && (
              <div className="p-3 rounded-lg bg-error-50 dark:bg-error-900/10 border border-error-200 dark:border-error-800">
                <Text className="text-xs text-error-700 dark:text-error-300">
                  {t("create.review.failedToGeneratePdf", { error: pdf.error ?? "Unknown error" })}
                </Text>
              </div>
            )}

            {pdf.pdfUrl ? (
              <a
                href={pdf.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  leftIcon={<Download size={16} />}
                >
                  {t("create.review.downloadPdf")}
                </Button>
              </a>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                leftIcon={<Download size={16} />}
                onClick={() => void pdf.regenerate()}
                disabled={pdf.status === "loading"}
              >
                {t("create.review.generatePdf")}
              </Button>
            )}

            {pdf.termsHash && (
              <Text variant="muted" className="text-[10px] font-mono break-all">
                termsHash: {pdf.termsHash}
              </Text>
            )}
          </CardBody>
        </Card>

        <FeesBreakdown
          amount={display.amount}
          creationFee={display.creationFee}
          assignmentFee={display.assignmentFee}
          totalAmount={display.totalAmount}
          tokenSymbol={display.tokenSymbol}
          hasAgent={computed.hasAgent}
          t={t}
        />

        <PredictedAddressCard address={display.predictedAddress} t={t} />

        {/* Info Note */}
        <Card className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
          <CardBody className="p-4">
            <Text variant="muted" className="text-xs leading-relaxed">
              💡 {t("create.review.predictedAddressNote")}
            </Text>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default ReviewStep;
