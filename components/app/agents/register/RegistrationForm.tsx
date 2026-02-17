"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useConnection, useChainId, useConnect } from "wagmi";
import { formatUnits } from "viem";
import Link from "next/link";

import { Button, Card, CardBody, CardFooter, Select, NumberInput, Checkbox, Heading, Text, Icon } from "@/components/ui";
import { ContactFields, type ContactFieldsState } from "@/components/app/agents/shared/ContactFields";
import { TokenApprovalAction } from "@/components/wallet";
import { NetworkBanner } from "@/components/shared";
import { useAgentRegistration, useNetworkGuard, type RegistrationFormData } from "@/hooks";
import { getStablecoins, type StablecoinType } from "@/lib/contracts";
import { buildContactString, parseContactString, parsedEntryToInput } from "@/lib/agents/contactCodec";
import { byteLengthUtf8 } from "@/lib/agents/contactCodec";
import {
  AlertTriangle,
  AlertCircle,
  Info,
  ShieldCheck,
  Zap,
  ChevronRight,
} from "lucide-react";
import {
  MIN_STABLECOIN_STAKE_USD,
  MIN_DAO_TOKEN_STAKE,
  MIN_FEE_BPS,
  MAX_FEE_BPS,
  MAX_DESCRIPTION_LENGTH,
  DEFAULT_ASSIGNMENT_FEE_BPS,
  DEFAULT_DISPUTE_FEE_BPS,
  bpsToPercent,
} from "@/lib/constants/agent";
import { buildWeb3ErrorReport, copyWeb3ErrorReportToClipboard } from "@/lib/blockchain/errorReport";
import { trackAgentRegistered } from "@/lib/analytics/gtag";

// Approval UI is shared via TokenApprovalAction

// Defer state updates to avoid `react-hooks/set-state-in-effect`.
function defer(fn: () => void) {
  setTimeout(fn, 0);
}

/**
 * Connect wallet prompt component.
 */
function ConnectWalletPrompt() {
  const { connectors, connect, isPending } = useConnect();

  return (
    <div className="p-10 text-center border-2 border-dashed border-[var(--border-secondary)] rounded-2xl bg-neutral-50/50 dark:bg-neutral-800/20 group hover:border-primary-500/30 transition-colors">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white dark:bg-neutral-800 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
        <Icon icon={Zap} boxed boxColor="primary" size="lg" />
      </div>
      <Heading level={3} className="mb-2">Connect Your Wallet</Heading>
      <Text variant="muted" className="mb-8 max-w-sm mx-auto">
        Join the network of professional dispute resolvers and earn fees for your expertise.
      </Text>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
        {connectors.map((connector) => (
          <Button
            key={connector.uid}
            variant="outline"
            className="h-12 justify-between px-4 group/btn"
            onClick={() => connect({ connector })}
            disabled={isPending}
          >
            <span className="font-bold">{connector.name}</span>
            <ChevronRight size={16} className="text-neutral-400 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        ))}
      </div>
    </div>
  );
}

/**
 * Main registration form component.
 */
export function RegistrationForm() {
  const chainId = useChainId();
  const { address, isConnected } = useConnection();

  // Network awareness - uses wallet's connected network
  const {
    isOnTestnet,
    isOnSupportedChain,
    isConnected: networkConnected,
    chainName,
    switchToMainnet,
    isSwitching,
  } = useNetworkGuard();

  // Form state
  const [formData, setFormData] = useState<RegistrationFormData>({
    stablecoinType: "USDC",
    stablecoinAmount: "",
    daoTokenAmount: "",
    assignmentFeeBps: "", // Use empty string to allow placeholder usage
    disputeFeeBps: "",    // Use empty string to allow placeholder usage
    description: "",
    contact: "",
  });

  const [contactState, setContactState] = useState<ContactFieldsState>({
    primary: { kind: "", value: "", customName: "" },
    secondary: { kind: "", value: "", customName: "" },
  });

  // Checkbox state
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [copiedError, setCopiedError] = useState(false);

  // ===========================================================================
  // PERSISTENCE
  // ===========================================================================
  const STORAGE_KEY_PREFIX = "agent-registration-draft";
  const STORAGE_DEBOUNCE_MS = 500;
  const lastLoadedSignature = useRef<string>("");
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Get storage key for current wallet
   */
  const getStorageKey = useCallback((chainId: number, address?: string) => {
    if (!address) return null;
    return `${STORAGE_KEY_PREFIX}-${chainId}-${address.toLowerCase()}`;
  }, []);

  /**
   * Load draft from storage
   */
  const loadDraft = useCallback((key: string) => {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return null;
      const data = JSON.parse(stored);
      // Expiry check (24h)
      if (Date.now() - data.savedAt > 24 * 60 * 60 * 1000) {
        localStorage.removeItem(key);
        return null;
      }
      return data;
    } catch (e) {
      console.warn("Failed to load draft:", e);
      return null;
    }
  }, []);

  /**
   * Clear draft
   */
  const clearDraft = useCallback(() => {
    const key = getStorageKey(chainId, address);
    if (key) {
      localStorage.removeItem(key);
      // Reset signature to allow reloading if needed (though usually we nav away)
      lastLoadedSignature.current = "";
    }
  }, [chainId, address, getStorageKey]);




  // Field interaction tracking
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const markTouched = useCallback((field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  // Get available stablecoins
  const stablecoins = useMemo(() => getStablecoins(chainId), [chainId]);
  // daoToken config is provided by the registration hook.

  const contactStateFromContactString = useCallback((contact: string): ContactFieldsState => {
    const parsed = parseContactString(contact);
    const primaryParsed = parsed[0];
    const secondaryParsed = parsed[1];
    return {
      primary: primaryParsed ? parsedEntryToInput(primaryParsed) : { kind: "", value: "", customName: "" },
      secondary: secondaryParsed ? parsedEntryToInput(secondaryParsed) : { kind: "", value: "", customName: "" },
    };
  }, []);

  const combinedContact = useMemo(
    () => buildContactString(contactState.primary, contactState.secondary),
    [contactState.primary, contactState.secondary]
  );

  const formDataForSubmit = useMemo(
    () => ({
      ...formData,
      contact: combinedContact,
    }),
    [formData, combinedContact]
  );

  // Use registration hook
  const {
    status,
    isAlreadyAgent,
    canRegister,
    errors,
    isValid,
    stablecoinApproval,
    daoTokenApproval,
    stablecoinBalance,
    daoTokenBalance,
    stablecoinConfig,
    daoTokenConfig,
    txHash,
    rawError,
    error,
    register,
  } = useAgentRegistration(formDataForSubmit);

  const descriptionBytes = useMemo(
    () => byteLengthUtf8(formData.description.trim()),
    [formData.description]
  );

  // ===========================================================================
  // PERSISTENCE EFFECTS (Must differ until status is available)
  // ===========================================================================

  // Load on mount / account change
  useEffect(() => {
    if (!address || !chainId) return;

    // Check signature to handle account switching
    const signature = `${chainId}-${address}`;
    if (lastLoadedSignature.current === signature) return;
    lastLoadedSignature.current = signature;

    const key = getStorageKey(chainId, address);
    if (!key) return;

    const draft = loadDraft(key);
    if (draft) {
      defer(() => {
        setFormData(draft.formData);
        setContactState(
          draft.contactState
            ? draft.contactState
            : contactStateFromContactString(draft.formData?.contact ?? "")
        );
        // We explicitly DO NOT restore agreedToTerms
        setAgreedToTerms(false);
        setTouched({}); // Reset touched state
      });
    } else {
      // If no draft and switching accounts, reset form to defaults
      defer(() => {
        setFormData({
          stablecoinType: "USDC",
          stablecoinAmount: "",
          daoTokenAmount: "",
          assignmentFeeBps: "",
          disputeFeeBps: "",
          description: "",
          contact: "",
        });
        setContactState({
          primary: { kind: "", value: "", customName: "" },
          secondary: { kind: "", value: "", customName: "" },
        });
        setAgreedToTerms(false);
        setTouched({});
      });
    }
  }, [address, chainId, getStorageKey, loadDraft, contactStateFromContactString]);

  // Save on change
  useEffect(() => {
    if (!address || !chainId) return;

    // Don't save if registering
    if (status === "registering" || status === "success") return;

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(() => {
      const key = getStorageKey(chainId, address);
      if (!key) return;

      const hasContent =
        formData.stablecoinAmount ||
        formData.daoTokenAmount ||
        formData.description ||
        combinedContact;

      if (hasContent) {
        localStorage.setItem(key, JSON.stringify({
          formData,
          contactState,
          savedAt: Date.now()
        }));
      }
    }, STORAGE_DEBOUNCE_MS);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [formData, contactState, address, chainId, status, getStorageKey, combinedContact]);

  // Clear draft on success and track registration
  useEffect(() => {
    if (status === "success") {
      clearDraft();
      // Track successful agent registration for analytics
      trackAgentRegistered();
    }
  }, [status, clearDraft]);

  // Update form field
  const updateField = useCallback(
    <K extends keyof RegistrationFormData>(field: K, value: RegistrationFormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  // Fee calculation helper
  const calculateExampleFee = useCallback((percentStr: string) => {
    const percent = parseFloat(percentStr);
    if (isNaN(percent)) return "0.00";
    const amount = 10000 * (percent / 100);
    return amount.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }, []);

  // Format balance for display
  const formatBalance = useCallback((balance: bigint | undefined, decimals: number) => {
    if (!balance) return "0";
    return parseFloat(formatUnits(balance, decimals)).toLocaleString(undefined, {
      maximumFractionDigits: 2,
    });
  }, []);

  // Handle registration
  const handleRegister = useCallback(async () => {
    if (!agreedToTerms) return;
    markTouched("contact");
    await register(formDataForSubmit);
    // Draft will be cleared when status becomes 'success' via effect or manually here if we await
  }, [agreedToTerms, register, formDataForSubmit, markTouched]);

  // Check if form can be submitted
  const canSubmit = useMemo(() => {
    return (
      isConnected &&
      isOnSupportedChain &&
      canRegister &&
      isValid &&
      agreedToTerms &&
      status !== "registering" &&
      status !== "approving-stablecoin" &&
      status !== "approving-dao" &&
      stablecoinApproval.isApproved &&
      daoTokenApproval.isApproved
    );
  }, [isConnected, isOnSupportedChain, canRegister, isValid, agreedToTerms, status, stablecoinApproval.isApproved, daoTokenApproval.isApproved]);

  const stablecoinApproveDisabledReason = useMemo(() => {
    if (!formData.stablecoinAmount) return "Enter an amount to enable approval";
    return errors.stablecoinAmount;
  }, [errors.stablecoinAmount, formData.stablecoinAmount]);

  const daoApproveDisabledReason = useMemo(() => {
    if (!formData.daoTokenAmount) return "Enter an amount to enable approval";
    return errors.daoTokenAmount;
  }, [errors.daoTokenAmount, formData.daoTokenAmount]);

  const stablecoinApproveDisabled =
    !isOnSupportedChain || !!stablecoinApproveDisabledReason;
  const daoApproveDisabled = !isOnSupportedChain || !!daoApproveDisabledReason;

  // Get button text based on status
  const getButtonText = useCallback(() => {
    switch (status) {
      case "approving-stablecoin":
        return `Approving ${stablecoinConfig?.symbol}...`;
      case "approving-dao":
        return `Approving ${daoTokenConfig?.symbol}...`;
      case "registering":
        return "Registering...";
      case "success":
        return "Registered!";
      default:
        if (!agreedToTerms) return "Agree to Terms";
        return "Register as Agent";
    }
  }, [status, stablecoinConfig, daoTokenConfig, agreedToTerms]);

  // Show success state
  if (status === "success") {
    return (
      <Card variant="elevated" className="border-none shadow-2xl shadow-primary-500/5">
        <CardBody className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--color-success-100)] dark:bg-[var(--color-success-900)] flex items-center justify-center">
            <svg
              className="w-8 h-8 text-[var(--color-success-500)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
            Registration Successful!
          </h2>
          <p className="text-[var(--text-secondary)] mb-4">
            You are now registered as an agent. You can start accepting disputes.
          </p>
          {txHash && (
            <p className="text-xs font-mono text-[var(--text-tertiary)] mb-4">
              Transaction: {txHash.slice(0, 10)}...{txHash.slice(-8)}
            </p>
          )}
          <Button
            variant="primary"
            onClick={() => (window.location.href = "/agents/dashboard")}
          >
            Go to Dashboard
          </Button>
        </CardBody>
      </Card>
    );
  }

  // Show already registered state
  if (isAlreadyAgent) {
    return (
      <Card variant="elevated" className="border-none shadow-2xl shadow-primary-500/5">
        <CardBody className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--color-warning-100)] dark:bg-[var(--color-warning-900)] flex items-center justify-center">
            <svg
              className="w-8 h-8 text-[var(--color-warning-500)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
            Already Registered
          </h2>
          <p className="text-[var(--text-secondary)] mb-4">
            Your wallet is already registered as an agent.
          </p>
          <Button
            variant="primary"
            onClick={() => (window.location.href = "/agents/dashboard")}
          >
            Go to Dashboard
          </Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in mb-20">
      {/* Main Header - Outside the card */}
      <div className="flex items-center gap-4 px-4 sm:px-0">
        <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-500 shrink-0">
          <ShieldCheck size={24} />
        </div>
        <div>
          <Heading level={2} className="text-xl">Agent Registration</Heading>
          <Text variant="muted" className="text-sm">Configure your professional profile and security deposit</Text>
        </div>
      </div>

      <Card variant="elevated" className="border-none shadow-2xl shadow-primary-500/5">

        <CardBody className="p-4 sm:p-8 space-y-10">
          {!isConnected ? (
            <ConnectWalletPrompt />
          ) : (
            <>
              {/* Network Banner - Shows when on testnet or unsupported chain */}
              <NetworkBanner
                isOnTestnet={isOnTestnet}
                isOnSupportedChain={isOnSupportedChain}
                isConnected={isConnected}
                chainName={chainName}
                switchToMainnet={switchToMainnet}
                isSwitching={isSwitching}
                className=""
              />

              {/* Stake Section */}
              <section className="space-y-6 pt-6 border-t border-[var(--border-secondary)]">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 bg-primary-500 rounded-full" />
                  <Heading level={4} className="uppercase tracking-widest text-[10px] font-bold text-primary-500">Collateral Configuration</Heading>
                </div>

                <div className="grid grid-cols-1 gap-8">
                  {/* Stablecoin Stake */}
                  <div className="relative z-20">
                    <div className="flex justify-between items-center mb-2 px-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] ml-1">Stablecoin Stake</label>
                      <span className="text-[10px] text-[var(--text-tertiary)]">
                        Available: <span className="font-mono text-[var(--text-primary)]">{formatBalance(stablecoinBalance, stablecoinConfig?.decimals || 18)}</span> {stablecoinConfig?.symbol}
                      </span>
                    </div>

                    <div className="flex gap-3">
                      <div className="w-32">
                        <Select
                          options={stablecoins.map(t => ({ label: t.symbol, value: t.symbol }))}
                          value={formData.stablecoinType}
                          onChange={(val) => updateField("stablecoinType", val as StablecoinType)}
                          hideLabel
                        />
                      </div>
                      <div className="flex-1">
                        <NumberInput
                          value={formData.stablecoinAmount}
                          onChange={(val) => updateField("stablecoinAmount", val)}
                          onBlur={() => markTouched("stablecoinAmount")}
                          placeholder={`${MIN_STABLECOIN_STAKE_USD}`}
                          suffix={formData.stablecoinType}
                          error={touched.stablecoinAmount ? errors.stablecoinAmount : undefined}
                          helperText={(!touched.stablecoinAmount || !errors.stablecoinAmount) ? `Min. Stake: $${MIN_STABLECOIN_STAKE_USD}` : undefined}
                        />
                      </div>
                    </div>
                  </div>

                  {/* DAO token Stake */}
                  <div className="relative z-10">
                    <div className="flex justify-between items-center mb-2 px-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] ml-1">{daoTokenConfig?.symbol || "DAO"} Governance Stake</label>
                      <span className="text-[10px] text-[var(--text-tertiary)]">
                        Available: <span className="font-mono text-[var(--text-primary)]">{formatBalance(daoTokenBalance, daoTokenConfig?.decimals || 18)}</span> {daoTokenConfig?.symbol}
                      </span>
                    </div>
                    <NumberInput
                      value={formData.daoTokenAmount}
                      onChange={(val) => updateField("daoTokenAmount", val)}
                      onBlur={() => markTouched("daoTokenAmount")}
                      placeholder={`${MIN_DAO_TOKEN_STAKE}`}
                      suffix={daoTokenConfig?.symbol}
                      error={touched.daoTokenAmount ? errors.daoTokenAmount : undefined}
                      helperText={(!touched.daoTokenAmount || !errors.daoTokenAmount) ? `Min. Stake: ${MIN_DAO_TOKEN_STAKE} ${daoTokenConfig?.symbol}` : undefined}
                    />
                  </div>
                </div>
              </section>

              {/* Service Fees */}
              <section className="space-y-6 pt-6 border-t border-[var(--border-secondary)]">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 bg-primary-500 rounded-full" />
                  <Heading level={4} className="uppercase tracking-widest text-[10px] font-bold text-primary-500">Service Fees</Heading>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-4 sm:p-6 rounded-2xl bg-primary-50/10 border border-primary-500/5">
                  <NumberInput
                    label="Assignment Fee"
                    value={formData.assignmentFeeBps}
                    onChange={(val) => updateField("assignmentFeeBps", val)}
                    onBlur={() => markTouched("assignmentFeeBps")}
                    placeholder={String(bpsToPercent(DEFAULT_ASSIGNMENT_FEE_BPS))}
                    suffix="%"
                    error={touched.assignmentFeeBps ? errors.assignmentFeeBps : undefined}
                    helperText={
                      (!touched.assignmentFeeBps || !errors.assignmentFeeBps)
                        ? (
                          <span>
                            Charged automatically upon case assignment. <span className="text-primary-500 font-medium">Earn ${calculateExampleFee(formData.assignmentFeeBps)} on a $10k escrow.</span>
                          </span>
                        )
                        : undefined
                    }
                  />

                  <NumberInput
                    label="Dispute Fee"
                    value={formData.disputeFeeBps}
                    onChange={(val) => updateField("disputeFeeBps", val)}
                    onBlur={() => markTouched("disputeFeeBps")}
                    placeholder={String(bpsToPercent(DEFAULT_DISPUTE_FEE_BPS))}
                    suffix="%"
                    error={touched.disputeFeeBps ? errors.disputeFeeBps : undefined}
                    helperText={
                      (!touched.disputeFeeBps || !errors.disputeFeeBps)
                        ? (
                          <span>
                            Earned only upon successful case resolution. <span className="text-primary-500 font-medium">Earn ${calculateExampleFee(formData.disputeFeeBps)} on a $10k escrow.</span>
                          </span>
                        )
                        : undefined
                    }
                  />
                </div>
                <div className="flex items-center gap-2 px-1">
                  <Info size={12} className="text-neutral-400" />
                  <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest leading-none">
                    Fee range: {bpsToPercent(MIN_FEE_BPS)}% - {bpsToPercent(MAX_FEE_BPS)}%
                  </span>
                </div>
              </section>

              {/* Profile Details */}
              <section className="space-y-6 pt-6 border-t border-[var(--border-secondary)]">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 bg-primary-500 rounded-full" />
                  <Heading level={4} className="uppercase tracking-widest text-[10px] font-bold text-primary-500">Public Profile</Heading>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] ml-1">
                      Professional Bio
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => {
                        // Show validation feedback immediately while typing.
                        if (!touched.description) markTouched("description");
                        updateField("description", e.target.value);
                      }}
                      onBlur={() => markTouched("description")}
                      rows={4}
                      // NOTE: contract limits UTF-8 bytes, not JS string length.
                      // We keep typing unrestricted and validate by bytes to avoid false negatives.
                      placeholder="Expert in DeFi, NFT Royalties, and Cross-chain bridges..."
                      className={`w-full p-4 rounded-xl border ${touched.description && errors.description ? "border-error-500 ring-1 ring-error-500/20" : "border-[var(--border-secondary)]"} bg-[var(--bg-primary)] text-sm outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none`}
                    />
                    <div className="flex justify-between items-center px-1">
                      <div className="min-h-[16px]">
                        {touched.description && errors.description && (
                          <div className="flex items-center gap-1.5 animate-slide-up">
                            <AlertCircle size={10} className="text-error-500" />
                            <span className="text-[10px] font-medium text-error-500">{errors.description}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-[10px] font-bold text-neutral-400">
                        {descriptionBytes}/{MAX_DESCRIPTION_LENGTH} bytes
                      </div>
                    </div>
                    {descriptionBytes > MAX_DESCRIPTION_LENGTH && (
                      <div className="mt-1 px-1">
                        <Text variant="muted" className="text-[10px]">
                          Tip: some characters (like “→”, emojis, etc.) take more than 1 byte and may exceed the on-chain limit.
                        </Text>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <ContactFields
                        value={contactState}
                        onChange={(next) => {
                          setContactState(next);
                          // Mark as interacted to show errors.
                          markTouched("contact");
                        }}
                      />
                      {touched.contact && errors.contact && (
                        <div className="flex items-center gap-1.5 px-1 mt-2 animate-slide-up">
                          <AlertCircle size={10} className="text-error-500" />
                          <span className="text-[10px] font-medium text-error-500">{errors.contact}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* Security & Approvals */}
              <section className="space-y-6 pt-6 border-t border-[var(--border-secondary)]">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-4 sm:p-6 rounded-2xl border border-[var(--border-secondary)] bg-neutral-50/50 dark:bg-neutral-800/20">
                  <div className="space-y-1 shrink-0">
                    <Heading level={4} className="text-sm">Security Approvals</Heading>
                    <Text variant="muted" className="text-xs">Grant permission to lock collateral tokens in the registry</Text>
                  </div>
                  <div className="flex flex-col divide-y divide-[var(--border-secondary)] w-full lg:max-w-xs">
                    <TokenApprovalAction
                      variant="inline"
                      label={stablecoinConfig?.symbol || "Stake"}
                      isApproved={stablecoinApproval.isApproved}
                      isApproving={stablecoinApproval.isApproving}
                      onApprove={stablecoinApproval.approve}
                      supportsPermit={stablecoinConfig?.supportsPermit ?? false}
                      disabled={stablecoinApproveDisabled}
                      disabledReason={stablecoinApproveDisabledReason}
                    />
                    <TokenApprovalAction
                      variant="inline"
                      label={daoTokenConfig?.symbol || "DAO"}
                      isApproved={daoTokenApproval.isApproved}
                      isApproving={daoTokenApproval.isApproving}
                      onApprove={daoTokenApproval.approve}
                      supportsPermit={daoTokenConfig?.supportsPermit ?? false}
                      disabled={daoApproveDisabled}
                      disabledReason={daoApproveDisabledReason}
                    />
                  </div>
                </div>

                <div className="flex items-start gap-4 p-5 rounded-2xl bg-primary-500/5 border border-primary-500/20 cursor-pointer group">
                  <div className="mt-0.5 shrink-0">
                    <Checkbox
                      checked={agreedToTerms}
                      onChange={setAgreedToTerms}
                    />
                  </div>
                  <span className="text-sm leading-relaxed text-[var(--text-secondary)]">
                    I acknowledge that my stake serves as bond and can be slashed for protocol misconduct as defined in the  <Link href="/agent-tos"  target="_blank" rel="noopener noreferrer" className="text-primary-500 font-bold hover:underline">
                      Agent Terms & Conditions
                    </Link>.
                  </span>
                </div>
              </section>
            </>
          )}
        </CardBody>

        {isConnected && (
          <CardFooter className="bg-neutral-50/50 dark:bg-neutral-800/10 border-t border-[var(--border-secondary)] px-4 py-4 sm:px-8 sm:py-6 rounded-b-2xl flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto px-8"
              onClick={() => (window.location.href = "/agents")}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="lg"
              className="w-full sm:w-auto px-8 sm:px-12 h-14 rounded-xl shadow-xl shadow-primary-500/20 font-extrabold text-lg"
              onClick={handleRegister}
              disabled={!canSubmit}
              isLoading={status === "registering" || status === "approving-stablecoin" || status === "approving-dao"}
            >
              {getButtonText()}
            </Button>
          </CardFooter>
        )}
      </Card>

      {error && (
        <div className="p-4 rounded-xl bg-error-50 dark:bg-error-900/10 border border-error-200 dark:border-error-800 animate-slide-up">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-error-500" size={20} />
            <Text className="text-sm font-medium text-error-700 dark:text-error-400">{error}</Text>
          </div>

          <div className="mt-3 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                // NOTE: the hook keeps `txHash` on both success and mined reverts.
                // We don't have direct access to the raw error object here, so we include what we have.
                const report = buildWeb3ErrorReport({
                  title: "Agent registration failed",
                  error: rawError ?? new Error(error),
                  chainId,
                });
                const ok = await copyWeb3ErrorReportToClipboard(report);
                setCopiedError(ok);
                setTimeout(() => setCopiedError(false), 2000);
              }}
            >
              {copiedError ? "Copied" : "Copy details"}
            </Button>
            {txHash && (
              <Text variant="muted" className="text-[10px] font-mono">
                tx: {txHash.slice(0, 10)}...{txHash.slice(-8)}
              </Text>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
