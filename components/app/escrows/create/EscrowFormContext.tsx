"use client";

/**
 * Escrow Form Context
 *
 * React Context for managing escrow creation wizard state.
 * Uses useReducer for predictable state updates following
 * the Command pattern (actions as commands).
 */

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { useConnection, useChainId } from "wagmi";
import { isAddress, type Address } from "viem";
import { toast } from "sonner";

import { generateUserSalt } from "@/lib/utils/salt";
import { getTokenConfig, type TokenConfig } from "@/lib/contracts";
import { useMinBuyerProtectionTime, useEscrowQuote } from "@/hooks";

import {
  type EscrowFormState,
  type EscrowFormData,
  type EscrowFormAction,
  type EscrowFormContextValue,
  type EscrowFormComputed,
  type FormValidationErrors,
  type WizardStep,
  type AgentSelectionMode,
  type LockedEscrowConfirmations,
  type QuoteCriticalParams,
  type SaltState,
  DEFAULT_FORM_STATE,
  DEFAULT_FORM_DATA,
  areLockedConfirmationsComplete,
  haveCriticalParamsChanged,
} from "./types";

import {
  validateFormData,
  getVisibleErrors,
  parseAmountToBigInt,
  type ValidationContext,
} from "./schema";

import { getProtectionTimeSeconds } from "./constants";

// =============================================================================
// LOCAL STORAGE PERSISTENCE
// =============================================================================

const STORAGE_KEY_PREFIX = "escrow-form-draft";
const STORAGE_DEBOUNCE_MS = 500;

/**
 * Get the localStorage key for a specific chain + wallet.
 *
 * IMPORTANT:
 * Drafts must be scoped to the connected wallet, otherwise they can be restored
 * across different wallets on the same browser/device.
 */
function getStorageKey(chainId: number, buyerAddress: Address): string {
  return `${STORAGE_KEY_PREFIX}-${chainId}-${buyerAddress.toLowerCase()}`;
}

/**
 * Legacy (v0) key that was only scoped by chainId.
 * Kept only for one-time migration.
 */
function getLegacyStorageKey(chainId: number): string {
  return `${STORAGE_KEY_PREFIX}-${chainId}`;
}

/**
 * Serializable form data for localStorage
 * (excludes non-serializable fields like Set)
 */
interface PersistedFormData {
  formData: EscrowFormData;
  savedAt: number;
}

/**
 * Save form data to localStorage
 */
function saveFormToStorage(
  chainId: number,
  buyerAddress: Address,
  formData: EscrowFormData
): void {
  try {
    const data: PersistedFormData = {
      formData,
      savedAt: Date.now(),
    };
    localStorage.setItem(getStorageKey(chainId, buyerAddress), JSON.stringify(data));
  } catch (error) {
    // localStorage might be full or disabled
    console.warn("Failed to save form draft:", error);
  }
}

/**
 * Load form data from localStorage
 */
function loadFormFromStorage(
  chainId: number,
  buyerAddress: Address
): PersistedFormData | null {
  try {
    const stored = localStorage.getItem(getStorageKey(chainId, buyerAddress));
    if (!stored) return null;

    const data: PersistedFormData = JSON.parse(stored);

    // Check if data is too old (24 hours)
    const MAX_AGE_MS = 24 * 60 * 60 * 1000;
    if (Date.now() - data.savedAt > MAX_AGE_MS) {
      clearFormFromStorage(chainId, buyerAddress);
      return null;
    }

    return data;
  } catch (error) {
    console.warn("Failed to load form draft:", error);
    return null;
  }
}

/**
 * Clear form data from localStorage
 */
function clearFormFromStorage(chainId: number, buyerAddress: Address): void {
  try {
    localStorage.removeItem(getStorageKey(chainId, buyerAddress));
  } catch (error) {
    console.warn("Failed to clear form draft:", error);
  }
}

/**
 * One-time migration:
 * If a legacy chain-scoped draft exists, move it under the wallet-scoped key.
 */
function migrateLegacyDraft(chainId: number, buyerAddress: Address): void {
  try {
    const legacyKey = getLegacyStorageKey(chainId);
    const newKey = getStorageKey(chainId, buyerAddress);

    const legacy = localStorage.getItem(legacyKey);
    if (!legacy) return;

    // If there is already a wallet-scoped draft, prefer it.
    const current = localStorage.getItem(newKey);
    if (!current) {
      localStorage.setItem(newKey, legacy);
    }

    // Always remove the legacy key to avoid cross-wallet restores.
    localStorage.removeItem(legacyKey);
  } catch {
    // ignore (localStorage might be unavailable)
  }
}

/**
 * Check if there's meaningful data worth restoring
 */
function hasRestoredDataMeaningfulContent(formData: EscrowFormData): boolean {
  return !!(
    formData.sellerAddress.trim() ||
    formData.amount.trim() ||
    formData.terms.trim() ||
    formData.agentAddress.trim()
  );
}

// =============================================================================
// REDUCER
// =============================================================================

/**
 * Form state reducer.
 * Pure function that handles all state transitions.
 */
function escrowFormReducer(
  state: EscrowFormState,
  action: EscrowFormAction
): EscrowFormState {
  switch (action.type) {
    case "SET_FIELD": {
      const newFormData = {
        ...state.formData,
        [action.field]: action.value,
      };

      // If changing agentAddress, also clear the selection mode if address is cleared
      if (action.field === "agentAddress") {
        const newValue = action.value as string;
        if (!newValue.trim()) {
          newFormData.agentSelectionMode = "none";
        } else if (state.formData.agentSelectionMode === "none") {
          // If typing manually and mode is none, set to manual
          newFormData.agentSelectionMode = "manual";
        }
      }

      return {
        ...state,
        formData: newFormData,
      };
    }

    case "SET_TOUCHED": {
      const newTouched = new Set(state.touchedFields);
      newTouched.add(action.field);
      return {
        ...state,
        touchedFields: newTouched,
      };
    }

    case "SET_ALL_TOUCHED": {
      const allFields: (keyof EscrowFormData)[] = [
        "sellerAddress",
        "tokenType",
        "amount",
        "buyerProtectionPreset",
        "customProtectionDays",
        "terms",
        "agentAddress",
        "agentSelectionMode",
        "lockedEscrowConfirmations",
      ];
      return {
        ...state,
        touchedFields: new Set(allFields),
      };
    }

    case "SET_SALT": {
      return {
        ...state,
        salt: action.salt,
      };
    }

    case "REGENERATE_SALT": {
      // This is handled in the hook to access current critical params
      return state;
    }

    case "SET_QUOTE": {
      return {
        ...state,
        quote: action.quote,
      };
    }

    case "SET_PDF": {
      return {
        ...state,
        pdfUrl: action.url,
        termsHash: action.termsHash,
      };
    }

    case "SET_STEP": {
      return {
        ...state,
        currentStep: action.step,
      };
    }

    case "SET_SUBMITTING": {
      return {
        ...state,
        isSubmitting: action.isSubmitting,
      };
    }

    case "SET_CREATED_ESCROW": {
      return {
        ...state,
        createdEscrowAddress: action.address,
        txHash: action.txHash,
        currentStep: "success",
        isSubmitting: false,
      };
    }

    case "RESET": {
      return {
        ...DEFAULT_FORM_STATE,
        touchedFields: new Set(),
      };
    }

    case "SET_LOCKED_CONFIRMATION": {
      return {
        ...state,
        formData: {
          ...state.formData,
          lockedEscrowConfirmations: {
            ...state.formData.lockedEscrowConfirmations,
            [action.key]: action.value,
          },
        },
      };
    }

    case "SET_AGENT": {
      return {
        ...state,
        formData: {
          ...state.formData,
          agentAddress: action.address,
          agentSelectionMode: action.mode,
          // Reset locked confirmations when agent is added
          lockedEscrowConfirmations: action.address.trim()
            ? {
                understandNoDispute: false,
                understandFundsLocked: false,
                acceptRisk: false,
              }
            : state.formData.lockedEscrowConfirmations,
        },
      };
    }

    default:
      return state;
  }
}

// =============================================================================
// CONTEXT
// =============================================================================

const EscrowFormContext = createContext<EscrowFormContextValue | null>(null);

// =============================================================================
// PROVIDER PROPS
// =============================================================================

export interface EscrowFormProviderProps {
  children: ReactNode;
  /** Initial form data (for pre-filling from URL params) */
  initialData?: Partial<EscrowFormData>;
  /** Initial agent address (from URL query) */
  initialAgentAddress?: string;
}

// =============================================================================
// PROVIDER
// =============================================================================

/**
 * Escrow Form Context Provider.
 *
 * Manages the complete state of the escrow creation wizard including:
 * - Form data and validation
 * - Salt generation and management
 * - Quote fetching
 * - Step navigation
 *
 * @example
 * ```tsx
 * <EscrowFormProvider>
 *   <CreateEscrowWizard />
 * </EscrowFormProvider>
 * ```
 */
export function EscrowFormProvider({
  children,
  initialData,
  initialAgentAddress,
}: EscrowFormProviderProps) {
  const chainId = useChainId();
  const { address: buyerAddress } = useConnection();

  // Initialize state with any initial data
  const initialState = useMemo<EscrowFormState>(() => {
    const formData = {
      ...DEFAULT_FORM_DATA,
      ...initialData,
    };

    // If initial agent address is provided, set it
    if (initialAgentAddress && isAddress(initialAgentAddress)) {
      formData.agentAddress = initialAgentAddress;
      formData.agentSelectionMode = "browsed";
    }

    return {
      ...DEFAULT_FORM_STATE,
      formData,
      touchedFields: new Set(),
    };
  }, [initialData, initialAgentAddress]);

  // Reducer state
  const [state, dispatch] = useReducer(escrowFormReducer, initialState);

  // Track which wallet+chain draft we've loaded (so we can reload if wallet changes)
  const loadedDraftKeyRef = useRef<string | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prevBuyerAddressRef = useRef<Address | undefined>(undefined);

  // ==========================================================================
  // PERSISTENCE: Load from localStorage on mount or account change
  // ==========================================================================
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Only persist drafts when a wallet is connected.
    if (!buyerAddress) {
      prevBuyerAddressRef.current = undefined;
      return;
    }

    const currentDraftKey = getStorageKey(chainId, buyerAddress);
    if (loadedDraftKeyRef.current === currentDraftKey) return;
    loadedDraftKeyRef.current = currentDraftKey;

    // If wallet changed while staying on the page, reset the reducer state before restoring.
    if (prevBuyerAddressRef.current && prevBuyerAddressRef.current !== buyerAddress) {
      dispatch({ type: "RESET" });
    }
    prevBuyerAddressRef.current = buyerAddress;

    // Don't restore if we have initial data from URL params
    if (initialAgentAddress || (initialData && Object.keys(initialData).length > 0)) {
      return;
    }

    migrateLegacyDraft(chainId, buyerAddress);
    const savedData = loadFormFromStorage(chainId, buyerAddress);
    if (savedData && hasRestoredDataMeaningfulContent(savedData.formData)) {
      // Restore each field
      Object.entries(savedData.formData).forEach(([key, value]) => {
        if (key !== "lockedEscrowConfirmations") {
          dispatch({
            type: "SET_FIELD",
            field: key as keyof EscrowFormData,
            value: value as EscrowFormData[keyof EscrowFormData],
          });
        }
      });

      // Sanitize agent mode: if address is empty, ensure we are in 'none' (No Agent) mode
      // This prevents reopening "Enter Agent Address" with empty input, which can be confusing
      if (!savedData.formData.agentAddress?.trim()) {
        dispatch({
          type: "SET_FIELD",
          field: "agentSelectionMode",
          value: "none",
        });
      }

      // Show toast notification
      toast("Draft restored", {
        description: "Your previous form data has been restored.",
        action: {
          label: "Clear",
          onClick: () => {
            clearFormFromStorage(chainId, buyerAddress);
            clearFormFromStorage(chainId, buyerAddress);
            dispatch({ type: "RESET" });
            toast.success("Draft cleared");
          },
        },
      });
    }
  }, [chainId, buyerAddress, initialAgentAddress, initialData]);

  // ==========================================================================
  // PERSISTENCE: Save to localStorage on changes (debounced)
  // ==========================================================================
  useEffect(() => {
    if (!buyerAddress) return;

    // Don't save if on success step or submitting
    if (state.currentStep === "success" || state.isSubmitting) {
      return;
    }

    // Debounce saves
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      // Only save if there's meaningful content
      if (hasRestoredDataMeaningfulContent(state.formData)) {
        saveFormToStorage(chainId, buyerAddress, state.formData);
        saveFormToStorage(chainId, buyerAddress, state.formData);
      }
    }, STORAGE_DEBOUNCE_MS);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [state.formData, state.currentStep, state.isSubmitting, chainId, buyerAddress]);

  // ==========================================================================
  // PERSISTENCE: Clear localStorage draft on successful creation
  // ==========================================================================
  // We intentionally *only* clear localStorage here (not reducer state) so the
  // Success step can still render the created escrow address/txHash.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!buyerAddress) return;

    // Only clear once we're in success *and* we have a created escrow address.
    // This avoids clearing drafts on any accidental step changes.
    if (state.currentStep !== "success") return;
    if (!state.createdEscrowAddress) return;

    clearFormFromStorage(chainId, buyerAddress);
  }, [state.currentStep, state.createdEscrowAddress, chainId, buyerAddress]);

  // Get minimum protection time from contract
  const { minBuyerProtectionTime } = useMinBuyerProtectionTime();

  // Get token config for current selection
  const tokenConfig = useMemo<TokenConfig | undefined>(
    () => getTokenConfig(chainId, state.formData.tokenType),
    [chainId, state.formData.tokenType]
  );

  // ==========================================================================
  // COMPUTED VALUES
  // ==========================================================================

  const computed = useMemo<EscrowFormComputed>(() => {
    const { formData, salt, quote } = state;

    // Agent checks
    const hasAgent =
      !!formData.agentAddress.trim() && isAddress(formData.agentAddress);
    const isLockedEscrow = !hasAgent;

    // Buyer protection time
    const buyerProtectionTimeSeconds = getProtectionTimeSeconds(
      formData.buyerProtectionPreset,
      formData.customProtectionDays
    );

    // Amount parsing
    const amountBigInt = parseAmountToBigInt(
      formData.amount,
      tokenConfig?.decimals ?? 6
    );

    // Token info
    const tokenAddress = tokenConfig?.address;
    const tokenDecimals = tokenConfig?.decimals ?? 6;

    // Total approval needed
    const totalApprovalNeeded =
      quote && amountBigInt
        ? amountBigInt + quote.creationFee + quote.assignmentFee
        : undefined;

    // Locked escrow confirmations
    const requiresLockedConfirmations = isLockedEscrow;
    const lockedConfirmationsComplete = areLockedConfirmationsComplete(
      formData.lockedEscrowConfirmations
    );

    // Critical params for change detection
    // These params affect the predicted escrow address AND the PDF content.
    // If any of these change, we must regenerate: salt → quote → PDF
    const criticalParams: QuoteCriticalParams | null =
      formData.sellerAddress && tokenAddress && formData.amount
        ? {
            seller: formData.sellerAddress,
            token: tokenAddress,
            amount: formData.amount,
            agent: hasAgent ? formData.agentAddress : null,
            buyerProtectionTime: buyerProtectionTimeSeconds,
            terms: formData.terms,
          }
        : null;

    // Check if critical params changed since salt was generated.
    // Avoid non-null assertion: during early form fill we may not have params yet.
    const criticalParamsChanged = criticalParams
      ? haveCriticalParamsChanged(salt.generatedForParams, criticalParams)
      : false;

    return {
      hasAgent,
      isLockedEscrow,
      buyerProtectionTimeSeconds,
      amountBigInt,
      tokenAddress,
      tokenDecimals,
      totalApprovalNeeded,
      requiresLockedConfirmations,
      lockedConfirmationsComplete,
      criticalParams,
      criticalParamsChanged,
    };
  }, [state, tokenConfig]);

  // ==========================================================================
  // VALIDATION
  // ==========================================================================

  const validationContext = useMemo<ValidationContext>(
    () => ({
      buyerAddress,
      minProtectionTimeSeconds: minBuyerProtectionTime
        ? Number(minBuyerProtectionTime)
        : undefined,
      buyerBalance: undefined, // TODO: Add balance check if needed
      tokenDecimals: computed.tokenDecimals,
      validateLockedConfirmations: computed.isLockedEscrow,
    }),
    [buyerAddress, minBuyerProtectionTime, computed.tokenDecimals, computed.isLockedEscrow]
  );

  const validationResult = useMemo(
    () => validateFormData(state.formData, validationContext),
    [state.formData, validationContext]
  );

  const visibleErrors = useMemo<FormValidationErrors>(
    () => getVisibleErrors(validationResult.errors, state.touchedFields),
    [validationResult.errors, state.touchedFields]
  );

  // ==========================================================================
  // QUOTE FETCHING
  // ==========================================================================

  // Fetch quote when salt exists and form is valid
  const {
    quote: fetchedQuote
  } = useEscrowQuote({
    userSalt: state.salt.value ?? undefined,
    token: computed.tokenAddress,
    amount: computed.amountBigInt,
    agent: computed.hasAgent ? (state.formData.agentAddress as Address) : null,
    enabled:
      !!state.salt.value &&
      !!computed.tokenAddress &&
      computed.amountBigInt !== undefined &&
      validationResult.isValid,
  });

  // ==========================================================================
  // QUOTE SYNC
  // ==========================================================================
  // IMPORTANT:
  // `computed` depends on `state.quote`, but `useEscrowQuote` returns `fetchedQuote`.
  // If we don't persist `fetchedQuote` into reducer state, the UI will show
  // 0 for fees/total required (because totalApprovalNeeded stays undefined).
  //
  // We also clear the quote when inputs are no longer valid to avoid stale values.
  useEffect(() => {
    const hasQuoteInputs =
      !!state.salt.value &&
      !!computed.tokenAddress &&
      computed.amountBigInt !== undefined &&
      validationResult.isValid;

    if (!hasQuoteInputs) {
      if (state.quote !== null) {
        dispatch({ type: "SET_QUOTE", quote: null });
      }
      return;
    }

    if (!fetchedQuote) return;

    const shouldUpdate =
      state.quote === null ||
      state.quote.predictedEscrow !== fetchedQuote.predictedEscrow ||
      state.quote.finalSalt !== fetchedQuote.finalSalt ||
      state.quote.versionUsed !== fetchedQuote.versionUsed ||
      state.quote.creationFee !== fetchedQuote.creationFee ||
      state.quote.assignmentFee !== fetchedQuote.assignmentFee;

    if (shouldUpdate) {
      dispatch({ type: "SET_QUOTE", quote: fetchedQuote });
    }
  }, [
    fetchedQuote,
    state.quote,
    state.salt.value,
    computed.tokenAddress,
    computed.amountBigInt,
    validationResult.isValid,
  ]);

  // ==========================================================================
  // ACTIONS
  // ==========================================================================

  /**
   * Update a single field.
   */
  const setField = useCallback(
    <K extends keyof EscrowFormData>(field: K, value: EscrowFormData[K]) => {
      dispatch({ type: "SET_FIELD", field, value });
    },
    []
  );

  /**
   * Mark a field as touched.
   */
  const setTouched = useCallback((field: keyof EscrowFormData) => {
    dispatch({ type: "SET_TOUCHED", field });
  }, []);

  /**
   * Set agent address with mode.
   */
  const setAgent = useCallback(
    (address: string, mode: AgentSelectionMode) => {
      dispatch({ type: "SET_AGENT", address, mode });
    },
    []
  );

  /**
   * Set locked escrow confirmation.
   */
  const setLockedConfirmation = useCallback(
    (key: keyof LockedEscrowConfirmations, value: boolean) => {
      dispatch({ type: "SET_LOCKED_CONFIRMATION", key, value });
    },
    []
  );

  /**
   * Generate or regenerate salt.
   */
  const generateSalt = useCallback(() => {
    const newSalt = generateUserSalt();
    const saltState: SaltState = {
      value: newSalt,
      generatedAt: Date.now(),
      generatedForParams: computed.criticalParams,
    };
    dispatch({ type: "SET_SALT", salt: saltState });
  }, [computed.criticalParams]);

  /**
   * Navigate to a step.
   */
  const goToStep = useCallback((step: WizardStep) => {
    // When entering review step, generate salt if not already generated
    if (step === "review") {
      // This will be handled by the component using the context
      dispatch({ type: "SET_ALL_TOUCHED" });
    }
    dispatch({ type: "SET_STEP", step });
  }, []);

  /**
   * Reset the form and clear draft.
   */
  const reset = useCallback(() => {
    if (!buyerAddress) {
      dispatch({ type: "RESET" });
      return;
    }

    clearFormFromStorage(chainId, buyerAddress);
    dispatch({ type: "RESET" });
  }, [chainId, buyerAddress]);

  // ==========================================================================
  // CONTEXT VALUE
  // ==========================================================================

  const contextValue = useMemo<EscrowFormContextValue>(
    () => ({
      state: {
        ...state,
        // The reducer state is the source of truth; fetchedQuote is synced into it.
        // Keeping this as a fallback avoids UI flicker during the short sync window.
        quote: fetchedQuote ?? state.quote,
      },
      computed,
      errors: visibleErrors,
      isValid: validationResult.isValid,
      dispatch,
      setField,
      setTouched,
      setAgent,
      setLockedConfirmation,
      generateSalt,
      goToStep,
      reset,
    }),
    [
      state,
      fetchedQuote,
      computed,
      visibleErrors,
      validationResult.isValid,
      setField,
      setTouched,
      setAgent,
      setLockedConfirmation,
      generateSalt,
      goToStep,
      reset,
    ]
  );

  return (
    <EscrowFormContext.Provider value={contextValue}>
      {children}
    </EscrowFormContext.Provider>
  );
}

// =============================================================================
// HOOK
// =============================================================================

/**
 * Hook to access the escrow form context.
 *
 * @throws Error if used outside of EscrowFormProvider
 * @returns EscrowFormContextValue
 *
 * @example
 * ```tsx
 * function FormStep() {
 *   const { state, setField, errors, isValid } = useEscrowFormContext();
 *
 *   return (
 *     <input
 *       value={state.formData.sellerAddress}
 *       onChange={(e) => setField('sellerAddress', e.target.value)}
 *       onBlur={() => setTouched('sellerAddress')}
 *     />
 *   );
 * }
 * ```
 */
export function useEscrowFormContext(): EscrowFormContextValue {
  const context = useContext(EscrowFormContext);

  if (!context) {
    throw new Error(
      "useEscrowFormContext must be used within an EscrowFormProvider"
    );
  }

  return context;
}

// =============================================================================
// SELECTOR HOOKS (Optimized for specific use cases)
// =============================================================================

/**
 * Select only form data from context.
 * Useful for form fields that only need read access.
 */
export function useEscrowFormData(): EscrowFormData {
  const { state } = useEscrowFormContext();
  return state.formData;
}

/**
 * Select only computed values from context.
 */
export function useEscrowFormComputed(): EscrowFormComputed {
  const { computed } = useEscrowFormContext();
  return computed;
}

/**
 * Select only validation state from context.
 */
export function useEscrowFormValidation(): {
  errors: FormValidationErrors;
  isValid: boolean;
} {
  const { errors, isValid } = useEscrowFormContext();
  return { errors, isValid };
}

/**
 * Select current wizard step.
 */
export function useEscrowWizardStep(): {
  currentStep: WizardStep;
  goToStep: (step: WizardStep) => void;
} {
  const { state, goToStep } = useEscrowFormContext();
  return { currentStep: state.currentStep, goToStep };
}
