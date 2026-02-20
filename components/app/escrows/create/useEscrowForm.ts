"use client";

/**
 * useEscrowForm Hook
 *
 * Master hook for escrow creation that composes context, validation,
 * contract interactions, and step management.
 *
 * This hook follows the Facade pattern - providing a simplified interface
 * to the complex subsystem of escrow creation.
 */

import { toast } from "sonner";
import { useCallback, useMemo, useEffect, useRef } from "react";
import { useConnection, useChainId } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { type Address, type Hex, isAddress, formatUnits } from "viem";

import {
  useCreateEscrow,
  useTokenApproval,
  useAgentEligibilityForEscrow,
  useTokenBalance,
  type PermitSignature,
  type CreateEscrowInput,
  toCreateEscrowParams,
} from "@/hooks";
import { getTokenConfig, getContractAddresses } from "@/lib/contracts";
import { humanizeBlockchainError } from "@/lib/blockchain/errors";
import { usePdfGeneration } from "@/hooks/services/usePdfGeneration";

import {
  useEscrowFormContext,
  useEscrowWizardStep,
} from "./EscrowFormContext";

import {
  type WizardStep,
  type EscrowFormData,
  type EscrowFormComputed,
  type FormValidationErrors,
  type AgentSelectionMode,
  type LockedEscrowConfirmations,
} from "./types";

import { formatAmount, normalizeAmountForHash } from "./schema";
import { formatDuration, DISPLAY_DECIMALS } from "./constants";

// =============================================================================
// NETWORK HELPERS
// =============================================================================

/**
 * Get human-readable network name from chain ID.
 */
function getNetworkName(chainId: number): string {
  switch (chainId) {
    case mainnet.id:
      return "Ethereum Mainnet";
    case sepolia.id:
      return "Ethereum Sepolia";
    default:
      return `Chain ${chainId}`;
  }
}

function toFactoryPermitParams(sig: PermitSignature): {
  deadline: bigint;
  v: number;
  r: `0x${string}`;
  s: `0x${string}`;
} {
  return {
    deadline: sig.deadline,
    v: sig.v,
    r: sig.r as `0x${string}`,
    s: sig.s as `0x${string}`,
  };
}

// =============================================================================
// TYPES
// =============================================================================

/**
 * Step validation result.
 */
export interface StepValidation {
  /** Whether the step is valid */
  isValid: boolean;
  /** Error message if invalid */
  error?: string;
  /** Fields with errors in this step */
  errorFields: (keyof EscrowFormData)[];
}

/**
 * Submission status.
 */
export type SubmissionStatus =
  | "idle"
  | "generating-salt"
  | "fetching-quote"
  | "generating-pdf"
  | "approving"
  | "submitting"
  | "success"
  | "error";

/**
 * Return type for useEscrowForm hook.
 */
export interface UseEscrowFormReturn {
  // State
  formData: EscrowFormData;
  computed: EscrowFormComputed;
  errors: FormValidationErrors;
  isValid: boolean;

  // Step management
  currentStep: WizardStep;
  canProceed: boolean;
  canGoBack: boolean;
  stepValidation: StepValidation;

  // Actions
  setField: <K extends keyof EscrowFormData>(
    field: K,
    value: EscrowFormData[K]
  ) => void;
  setTouched: (field: keyof EscrowFormData) => void;
  setAgent: (address: string, mode: AgentSelectionMode) => void;
  setLockedConfirmation: (
    key: keyof LockedEscrowConfirmations,
    value: boolean
  ) => void;

  // Navigation
  goToStep: (step: WizardStep) => void;
  goNext: () => void;
  goBack: () => void;

  // Salt management
  generateSalt: () => void;
  shouldRegenerateSalt: boolean;

  // Submission
  submissionStatus: SubmissionStatus;
  submitError: string | null;
  handleSubmit: () => Promise<void>;

  // PDF generation
  pdf: {
    status: "idle" | "loading" | "success" | "error";
    pdfUrl: string | null;
    termsHash: Hex | null;
    error: string | null;
    regenerate: () => Promise<void>;
  };

  // Token approval
  tokenApproval: {
    isApproved: boolean;
    isApproving: boolean;
    approve: () => void;
    supportsPermit: boolean;
    permitSignature: PermitSignature | null;
    /** Balance of selected token */
    balance: bigint | undefined;
    /** Whether the user has enough balance for the current step requirements */
    hasEnoughBalance: boolean;
    /** Human-readable message describing the balance requirement */
    balanceError: string | null;
  };

  // Escrow creation
  escrowCreation: {
    status: string;
    isPending: boolean;
    txHash: Hex | undefined;
    escrowAddress: Address | undefined;
    error: string | null;
  };

  // Formatted values for display
  display: {
    amount: string;
    creationFee: string;
    assignmentFee: string;
    totalAmount: string;
    protectionTime: string;
    tokenSymbol: string;
    predictedAddress: Address | undefined;
  };

  // Reset
  reset: () => void;
}

// =============================================================================
// STEP DEFINITIONS
// =============================================================================

const STEP_ORDER: WizardStep[] = ["form", "review", "approve", "confirm", "success"];

function getStepIndex(step: WizardStep): number {
  return STEP_ORDER.indexOf(step);
}

function getNextStep(current: WizardStep): WizardStep | null {
  const index = getStepIndex(current);
  if (index < 0 || index >= STEP_ORDER.length - 1) return null;
  return STEP_ORDER[index + 1];
}

function getPreviousStep(current: WizardStep): WizardStep | null {
  const index = getStepIndex(current);
  if (index <= 0) return null;
  return STEP_ORDER[index - 1];
}

// =============================================================================
// STEP VALIDATION
// =============================================================================

/**
 * Get fields required for each step.
 */
function getStepFields(step: WizardStep): (keyof EscrowFormData)[] {
  switch (step) {
    case "form":
      return [
        "sellerAddress",
        "tokenType",
        "amount",
        "buyerProtectionPreset",
        "customProtectionDays",
        "terms",
        "agentAddress",
        "lockedEscrowConfirmations",
      ];
    case "review":
    case "approve":
    case "confirm":
    case "success":
      return [];
    default:
      return [];
  }
}

/**
 * Validate a specific step.
 */
function validateStep(
  step: WizardStep,
  errors: FormValidationErrors,
  computed: EscrowFormComputed
): StepValidation {
  const stepFields = getStepFields(step);
  const errorFields = stepFields.filter((field) => !!errors[field]);

  // Special handling for locked escrow
  if (
    step === "form" &&
    computed.isLockedEscrow &&
    !computed.lockedConfirmationsComplete
  ) {
    if (!errorFields.includes("lockedEscrowConfirmations")) {
      errorFields.push("lockedEscrowConfirmations");
    }
  }

  return {
    isValid: errorFields.length === 0,
    errorFields,
    error:
      errorFields.length > 0
        ? `Please fix ${errorFields.length} error${errorFields.length > 1 ? "s" : ""}`
        : undefined,
  };
}

// =============================================================================
// HOOK
// =============================================================================

/**
 * Master hook for escrow creation form.
 *
 * Composes all the functionality needed for the escrow creation wizard:
 * - Form state management (via context)
 * - Validation
 * - Token approval
 * - Escrow creation
 * - Step navigation
 *
 * @example
 * ```tsx
 * function CreateEscrowWizard() {
 *   const {
 *     formData,
 *     errors,
 *     currentStep,
 *     canProceed,
 *     goNext,
 *     goBack,
 *     handleSubmit,
 *     display,
 *   } = useEscrowForm();
 *
 *   return (
 *     <div>
 *       {currentStep === "form" && <FormStep />}
 *       {currentStep === "review" && <ReviewStep />}
 *       // ...
 *     </div>
 *   );
 * }
 * ```
 */
export function useEscrowForm(): UseEscrowFormReturn {
  const chainId = useChainId();
  const { address: buyerAddress } = useConnection();

  // Get context values
  const ctx = useEscrowFormContext();
  const { state, computed, errors, isValid, dispatch } = ctx;
  const { currentStep, goToStep } = useEscrowWizardStep();

  // ==========================================================================
  // AGENT ELIGIBILITY (Indexer-backed)
  // ==========================================================================

  const agentEligibility = useAgentEligibilityForEscrow({
    agentAddress: computed.hasAgent ? state.formData.agentAddress : "",
    escrowAmount: computed.amountBigInt,
  });

  // Token config
  const tokenConfig = useMemo(
    () => getTokenConfig(chainId, state.formData.tokenType),
    [chainId, state.formData.tokenType]
  );

  // ==========================================================================
  // TOKEN APPROVAL
  // ==========================================================================

  // Get contract addresses for factory (the spender)
  const contractAddresses = useMemo(
    () => getContractAddresses(chainId),
    [chainId]
  );

  // Token approval - approve the factory contract to spend tokens
  const shouldEnableApproval =
    currentStep === "approve" && !!computed.totalApprovalNeeded;

  const {
    isApproved,
    isApproving,
    approve: approveToken,
    supportsPermit,
    error: approvalError,
    permitSignature,
  } = useTokenApproval(
    computed.tokenAddress,
    contractAddresses?.escrowFactory as Address | undefined,
    computed.totalApprovalNeeded,
    shouldEnableApproval
  );

  // Token balance (used for validation / UX gating)
  const { balance: tokenBalance } = useTokenBalance({
    tokenAddress: computed.tokenAddress,
    ownerAddress: buyerAddress as Address | undefined,
    enabled: !!computed.tokenAddress && !!buyerAddress,
  });

  const balanceCheck = useMemo(() => {
    const decimals = tokenConfig?.decimals ?? 6;
    const symbol = tokenConfig?.symbol ?? "USDC";

    // 1) Form step: only validate the escrow amount (fees unknown).
    if (currentStep === "form") {
      if (tokenBalance === undefined || computed.amountBigInt === undefined) {
        return { hasEnough: true, error: null };
      }
      if (computed.amountBigInt > tokenBalance) {
        const need = formatUnits(computed.amountBigInt, decimals);
        const have = formatUnits(tokenBalance, decimals);
        return {
          hasEnough: false,
          error: `Insufficient balance (need ${need} ${symbol}, have ${have} ${symbol})`,
        };
      }
      return { hasEnough: true, error: null };
    }

    // 2) Approve/Confirm: validate total required (amount + fees).
    if (currentStep === "approve" || currentStep === "confirm") {
      if (tokenBalance === undefined || computed.totalApprovalNeeded === undefined) {
        return { hasEnough: true, error: null };
      }
      if (computed.totalApprovalNeeded > tokenBalance) {
        const need = formatUnits(computed.totalApprovalNeeded, decimals);
        const have = formatUnits(tokenBalance, decimals);
        return {
          hasEnough: false,
          error: `Insufficient balance (need ${need} ${symbol}, have ${have} ${symbol})`,
        };
      }
      return { hasEnough: true, error: null };
    }

    return { hasEnough: true, error: null };
  }, [currentStep, tokenBalance, computed.amountBigInt, computed.totalApprovalNeeded, tokenConfig]);

  // ==========================================================================
  // ESCROW CREATION
  // ==========================================================================

  const {
    createEscrow,
    createEscrowWithPermit,
    status: createStatus,
    isPending: isCreating,
    txHash: createTxHash,
    escrowAddress: createdEscrowAddress,
    error: createError,
  } = useCreateEscrow();

  // ==========================================================================
  // PDF GENERATION (authoritative termsHash)
  // ==========================================================================

  const {
    generatePdf,
    status: pdfStatus,
    error: pdfError,
    reset: resetPdf,
  } = usePdfGeneration();

  // Avoid race conditions: only accept the latest in-flight generation.
  const pdfRequestIdRef = useRef(0);
  // Prevent infinite loops: only auto-generate when inputs actually change.
  const lastAutoGeneratedFingerprintRef = useRef<string | null>(null);

  const pdfFingerprint = useMemo(() => {
    // Only compute fingerprint when we have the required inputs
    if (!buyerAddress) return null;
    if (!computed.tokenAddress) return null;
    if (!state.quote?.predictedEscrow) return null;
    if (!state.quote) return null;
    if (!state.formData.sellerAddress) return null;
    if (!state.formData.terms) return null;

    const normalizedAmount = normalizeAmountForHash(
      state.formData.amount,
      computed.tokenDecimals
    );
    if (!normalizedAmount) return null;

    return JSON.stringify({
      buyerAddress: buyerAddress.toLowerCase(),
      sellerAddress: state.formData.sellerAddress.toLowerCase(),
      agentAddress: computed.hasAgent
        ? (state.formData.agentAddress as string).toLowerCase()
        : null,
      tokenAddress: computed.tokenAddress.toLowerCase(),
      tokenSymbol: tokenConfig?.symbol ?? "USDC",
      amount: normalizedAmount,
      buyerProtectionTime: computed.buyerProtectionTimeSeconds,
      terms: state.formData.terms,
      escrowAddress: state.quote.predictedEscrow.toLowerCase(),
      creationFee: state.quote.creationFee.toString(),
      assignmentFee: state.quote.assignmentFee.toString(),
      isLocked: computed.isLockedEscrow,
    });
  }, [
    buyerAddress,
    computed.tokenAddress,
    computed.tokenDecimals,
    computed.buyerProtectionTimeSeconds,
    computed.hasAgent,
    computed.isLockedEscrow,
    state.formData.sellerAddress,
    state.formData.agentAddress,
    state.formData.amount,
    state.formData.terms,
    state.quote,
    tokenConfig?.symbol,
  ]);

  const regeneratePdf = useCallback(async () => {
    if (currentStep !== "review") return;
    if (!pdfFingerprint) return;
    if (!buyerAddress || !computed.tokenAddress || !state.quote) return;

    const normalizedAmount = normalizeAmountForHash(
      state.formData.amount,
      computed.tokenDecimals
    );
    if (!normalizedAmount) return;

    const requestId = ++pdfRequestIdRef.current;

    const result = await generatePdf({
      buyerAddress: buyerAddress as Address,
      sellerAddress: state.formData.sellerAddress as Address,
      agentAddress: computed.hasAgent
        ? (state.formData.agentAddress as Address)
        : null,
      tokenSymbol: tokenConfig?.symbol ?? "USDC",
      tokenAddress: computed.tokenAddress,
      amount: normalizedAmount,
      buyerProtectionTime: computed.buyerProtectionTimeSeconds,
      terms: state.formData.terms,
      escrowAddress: state.quote.predictedEscrow,
      creationFee: state.quote.creationFee.toString(),
      assignmentFee: state.quote.assignmentFee.toString(),
      isLocked: computed.isLockedEscrow,
      chainId,
      network: getNetworkName(chainId),
    });

    // Ignore stale responses
    if (requestId !== pdfRequestIdRef.current) return;

    dispatch({
      type: "SET_PDF",
      url: result.pdfUrl,
      termsHash: result.termsHash as Hex,
    });

    // Record the fingerprint that produced the current PDF so the auto-effect
    // doesn't immediately re-run due to state updates.
    lastAutoGeneratedFingerprintRef.current = pdfFingerprint;
  }, [
    currentStep,
    pdfFingerprint,
    buyerAddress,
    computed.tokenAddress,
    computed.tokenDecimals,
    computed.buyerProtectionTimeSeconds,
    computed.hasAgent,
    computed.isLockedEscrow,
    state.formData.sellerAddress,
    state.formData.agentAddress,
    state.formData.amount,
    state.formData.terms,
    state.quote,
    tokenConfig?.symbol,
    generatePdf,
    dispatch,
    chainId,
  ]);

  // Auto-generate + auto-regenerate PDF when entering review and when inputs change.
  useEffect(() => {
    if (currentStep !== "review") return;
    if (!pdfFingerprint) {
      // Inputs not ready; clear any stale PDF.
      if (state.pdfUrl || state.termsHash) {
        dispatch({ type: "SET_PDF", url: null, termsHash: null });
      }
      lastAutoGeneratedFingerprintRef.current = null;
      return;
    }

    // Only auto-generate if we haven't already generated for this fingerprint.
    if (lastAutoGeneratedFingerprintRef.current === pdfFingerprint) return;

    void regeneratePdf().catch(() => {
      // errors are surfaced via hook state
    });
  }, [currentStep, pdfFingerprint, regeneratePdf, dispatch, state.pdfUrl, state.termsHash]);

  // ==========================================================================
  // STEP VALIDATION
  // ==========================================================================

  const stepValidation = useMemo<StepValidation>(
    () => validateStep(currentStep, errors, computed),
    [currentStep, errors, computed]
  );

  // ==========================================================================
  // NAVIGATION
  // ==========================================================================

  const canGoBack = useMemo(
    () =>
      currentStep !== "form" &&
      currentStep !== "success" &&
      currentStep !== "confirm", // Can't go back during confirmation
    [currentStep]
  );

  const canProceed = useMemo(() => {
    switch (currentStep) {
      case "form":
        // If an agent is set, require it to be verified/eligible before proceeding.
        if (computed.hasAgent) {
          return (
            isValid &&
            stepValidation.isValid &&
            balanceCheck.hasEnough &&
            agentEligibility.status === "valid"
          );
        }

        return isValid && stepValidation.isValid && balanceCheck.hasEnough;
      case "review":
        // Require PDF + termsHash before proceeding.
        return (
          !!state.salt.value &&
          !!state.quote &&
          !!state.pdfUrl &&
          !!state.termsHash &&
          pdfStatus === "success"
        );
      case "approve":
        return isApproved && balanceCheck.hasEnough;
      case "confirm":
        return false; // User must click submit
      case "success":
        return false;
      default:
        return false;
    }
  }, [
    currentStep,
    isValid,
    stepValidation.isValid,
    balanceCheck.hasEnough,
    computed.hasAgent,
    agentEligibility.status,
    state.salt.value,
    state.quote,
    state.pdfUrl,
    state.termsHash,
    pdfStatus,
    isApproved,
  ]);

  const goNext = useCallback(() => {
    if (!canProceed) return;

    const nextStep = getNextStep(currentStep);
    if (!nextStep) return;

    // When moving to review, ensure salt is generated
    if (nextStep === "review" && !state.salt.value) {
      ctx.generateSalt();
    }

    // Skip approve step if already approved
    if (nextStep === "approve" && isApproved && balanceCheck.hasEnough) {
      goToStep("confirm");
      return;
    }

    goToStep(nextStep);
  }, [canProceed, currentStep, state.salt.value, isApproved, balanceCheck.hasEnough, goToStep, ctx]);

  const goBack = useCallback(() => {
    if (!canGoBack) return;

    const prevStep = getPreviousStep(currentStep);
    if (!prevStep) return;

    goToStep(prevStep);
  }, [canGoBack, currentStep, goToStep]);

  // ==========================================================================
  // AUTO-REGENERATION: Salt, Quote, PDF
  // ==========================================================================
  // When critical params change, we must regenerate everything automatically.
  // This is NOT optional - the PDF bytes (termsHash) are stored on-chain as proof.
  // The flow is: params change → clear salt → new salt generated → new quote → new PDF

  // Track if we've already triggered regeneration for the current params
  const lastCriticalParamsRef = useRef<string | null>(null);

  // Auto-clear and regenerate when critical params change
  useEffect(() => {
    // Only run when on review step - on form step, user is still editing
    if (currentStep !== "review") {
      lastCriticalParamsRef.current = null;
      return;
    }

    // Serialize current critical params for comparison
    const currentParamsKey = computed.criticalParams
      ? JSON.stringify(computed.criticalParams)
      : null;

    // If no params yet, nothing to do
    if (!currentParamsKey) return;

    // If params haven't changed since last check, nothing to do
    if (lastCriticalParamsRef.current === currentParamsKey) return;

    // If critical params changed and we had a previous salt, regenerate
    if (computed.criticalParamsChanged && state.salt.value) {
      // Clear stale data first
      ctx.dispatch({ type: "SET_PDF", url: null, termsHash: null });
      ctx.dispatch({ type: "SET_QUOTE", quote: null });

      // Generate new salt (which will trigger new quote → new PDF)
      ctx.generateSalt();
    }

    // Remember we've handled these params
    lastCriticalParamsRef.current = currentParamsKey;
  }, [
    currentStep,
    computed.criticalParams,
    computed.criticalParamsChanged,
    state.salt.value,
    ctx,
  ]);

  // ==========================================================================
  // SUBMISSION
  // ==========================================================================

  const submissionStatus = useMemo<SubmissionStatus>(() => {
    if (createStatus === "success") return "success";
    if (createStatus === "error") return "error";
    if (createStatus === "pending" || createStatus === "confirming") return "submitting";
    if (isApproving) return "approving";
    if (pdfStatus === "loading") return "generating-pdf";
    return "idle";
  }, [createStatus, isApproving, pdfStatus]);

  const submitError = useMemo<string | null>(() => {
    if (createError) return createError;
    if (approvalError) return approvalError;
    if (pdfStatus === "error" && pdfError) return pdfError;
    return null;
  }, [createError, approvalError, pdfStatus, pdfError]);

  /**
   * Handle form submission.
   * Creates the escrow contract.
   */
  const handleSubmit = useCallback(async () => {
    if (
      !state.quote ||
      !state.salt.value ||
      !buyerAddress ||
      !computed.tokenAddress ||
      !state.termsHash
    ) {
      return;
    }

    // Hard gate: prevent on-chain call if balance is insufficient.
    if (!balanceCheck.hasEnough) {
      return;
    }

    const input: CreateEscrowInput = {
      userSalt: state.salt.value,
      seller: state.formData.sellerAddress as Address,
      agent: computed.hasAgent
        ? (state.formData.agentAddress as Address)
        : null,
      token: computed.tokenAddress,
      amount: computed.amountBigInt!,
      buyerProtectionTime: BigInt(computed.buyerProtectionTimeSeconds),
      // Authoritative termsHash from PDF service
      termsHash: state.termsHash,
      version: BigInt(0), // Use default version
      expectedEscrow: state.quote.predictedEscrow,
    };

    const params = toCreateEscrowParams(input);

    try {
      dispatch({ type: "SET_SUBMITTING", isSubmitting: true });

      // If approval was done via permit signature, we must use the permit path.
      // Otherwise the factory will attempt transferFrom() with insufficient allowance.
      const escrowAddress = permitSignature
        ? await createEscrowWithPermit(params, toFactoryPermitParams(permitSignature))
        : await createEscrow(params);

      if (escrowAddress) {
        toast.success("Escrow created successfully!");
        dispatch({
          type: "SET_CREATED_ESCROW",
          address: escrowAddress,
          txHash: createTxHash!,
        });
      }
    } catch (error) {
      console.error("Escrow creation failed:", error);

      // Show toast with humanized error
      const message = humanizeBlockchainError(error);
      toast.error("Signature or Transaction Failed", {
        description: message,
      });

      dispatch({ type: "SET_SUBMITTING", isSubmitting: false });
    }
  }, [
    state.quote,
    state.salt.value,
    state.formData,
    buyerAddress,
    computed,
    createEscrow,
    createEscrowWithPermit,
    createTxHash,
    dispatch,
    state.termsHash,
    permitSignature,
    balanceCheck.hasEnough,
  ]);

  // ==========================================================================
  // DISPLAY VALUES
  // ==========================================================================

  const display = useMemo(() => {
    const decimals = tokenConfig?.decimals ?? 6;
    const symbol = tokenConfig?.symbol ?? "USDC";

    return {
      amount: computed.amountBigInt
        ? formatAmount(computed.amountBigInt, decimals, DISPLAY_DECIMALS)
        : "0",
      creationFee: state.quote?.creationFee
        ? formatAmount(state.quote.creationFee, decimals, DISPLAY_DECIMALS)
        : "0",
      assignmentFee: state.quote?.assignmentFee
        ? formatAmount(state.quote.assignmentFee, decimals, DISPLAY_DECIMALS)
        : "0",
      totalAmount: computed.totalApprovalNeeded
        ? formatAmount(computed.totalApprovalNeeded, decimals, DISPLAY_DECIMALS)
        : "0",
      protectionTime: formatDuration(computed.buyerProtectionTimeSeconds),
      tokenSymbol: symbol,
      predictedAddress: state.quote?.predictedEscrow,
    };
  }, [tokenConfig, computed, state.quote]);

  // ==========================================================================
  // EFFECT: Auto-advance from approve step
  // ==========================================================================

  useEffect(() => {
    if (currentStep === "approve" && isApproved && balanceCheck.hasEnough) {
      goToStep("confirm");
    }
  }, [currentStep, isApproved, balanceCheck.hasEnough, goToStep]);

  // ==========================================================================
  // RETURN
  // ==========================================================================

  return {
    // State
    formData: state.formData,
    computed,
    errors,
    isValid,

    // Step management
    currentStep,
    canProceed,
    canGoBack,
    stepValidation,

    // Actions
    setField: ctx.setField,
    setTouched: ctx.setTouched,
    setAgent: ctx.setAgent,
    setLockedConfirmation: ctx.setLockedConfirmation,

    // Navigation
    goToStep,
    goNext,
    goBack,

    // Salt (regeneration is now automatic, but we keep the flag for backward compatibility)
    generateSalt: ctx.generateSalt,
    shouldRegenerateSalt: false, // Always false - regeneration is now automatic

    // Submission
    submissionStatus,
    submitError,
    handleSubmit,

    // PDF
    pdf: {
      status: pdfStatus,
      pdfUrl: state.pdfUrl,
      termsHash: state.termsHash,
      error: pdfError,
      regenerate: regeneratePdf,
    },

    // Token approval
    tokenApproval: {
      isApproved,
      isApproving,
      approve: approveToken,
      supportsPermit,
      permitSignature,
      balance: tokenBalance,
      hasEnoughBalance: balanceCheck.hasEnough,
      balanceError: balanceCheck.error,
    },

    // Escrow creation
    escrowCreation: {
      status: createStatus,
      isPending: isCreating,
      txHash: createTxHash,
      escrowAddress: createdEscrowAddress || state.createdEscrowAddress || undefined,
      error: createError,
    },

    // Display
    display,

    // Reset
    reset: () => {
      resetPdf();
      ctx.reset();
    },
  };
}

// =============================================================================
// ADDITIONAL UTILITY HOOKS
// =============================================================================

/**
 * Validate an incoming agent selection message payload.
 * Shared between BroadcastChannel and localStorage fallback listeners.
 */
function isValidAgentSelectionMessage(
  data: unknown
): data is { type: "AGENT_SELECTED"; address: string } {
  return (
    !!data &&
    typeof data === "object" &&
    (data as Record<string, unknown>).type === "AGENT_SELECTED" &&
    typeof (data as Record<string, unknown>).address === "string" &&
    isAddress((data as Record<string, unknown>).address as string)
  );
}

/**
 * Hook for listening to agent selection via cross-tab messaging.
 *
 * Listens on two channels simultaneously for maximum browser coverage:
 * - BroadcastChannel API (modern browsers, Safari 15.4+)
 * - localStorage storage event (universal fallback, covers older iOS Safari)
 *
 * Used by the escrow creation form to receive agent selection from the
 * agents page opened in a new tab.
 */
export function useAgentSelectionListener(
  onAgentSelected: (address: string) => void
) {
  useEffect(() => {
    // Avoid importing the constant to prevent circular deps — use the
    // same literal string that the sender uses.
    const CHANNEL_NAME = "agent-selection";
    const cleanups: (() => void)[] = [];

    // ── Primary: BroadcastChannel (Safari 15.4+, Chrome 54+, Firefox 38+) ──
    if (typeof BroadcastChannel !== "undefined") {
      try {
        const channel = new BroadcastChannel(CHANNEL_NAME);
        channel.onmessage = (event: MessageEvent) => {
          if (isValidAgentSelectionMessage(event.data)) {
            onAgentSelected(event.data.address);
          }
        };
        cleanups.push(() => channel.close());
      } catch {
        // BroadcastChannel constructor can throw in rare edge cases
      }
    }

    // ── Fallback: localStorage storage event (universal support) ──
    // The 'storage' event fires in *other* tabs when localStorage changes,
    // which is exactly the cross-tab pattern we need.
    const handleStorageEvent = (event: StorageEvent) => {
      if (event.key !== CHANNEL_NAME || !event.newValue) return;
      try {
        const data: unknown = JSON.parse(event.newValue);
        if (isValidAgentSelectionMessage(data)) {
          onAgentSelected(data.address);
        }
      } catch {
        // Invalid JSON — ignore
      }
    };

    window.addEventListener("storage", handleStorageEvent);
    cleanups.push(() =>
      window.removeEventListener("storage", handleStorageEvent)
    );

    return () => {
      cleanups.forEach((fn) => fn());
    };
  }, [onAgentSelected]);
}

/**
 * Hook to open agent selection in a new tab.
 */
export function useAgentSelectionOpener() {
  const openAgentSelection = useCallback(() => {
    const url = "/agents?mode=select";
    window.open(url, "_blank", "noopener,noreferrer");
  }, []);

  return { openAgentSelection };
}
