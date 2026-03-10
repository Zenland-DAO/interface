"use client";

/**
 * AgentSelector Component
 *
 * Provides three modes for agent selection in escrow creation:
 * 1. No Agent (Locked Escrow) - with risk warnings and confirmations
 * 2. Enter Address Manually - direct address input
 * 3. Browse Available Agents - opens agent list in new tab
 *
 * Follows the Compound Component pattern with radio button selection.
 */

import { useCallback, useMemo } from "react";
import { isAddress } from "viem";
import { useTranslations } from "next-intl";
import {
  Card,
  CardBody,
  Text,
  Input,
  Button,
  Checkbox,
} from "@/components/ui";
import {
  AlertTriangle,
  User,
  Search,
  CheckCircle2,
  ExternalLink,
  X,
} from "lucide-react";

import { useAgentSelectionListener, useAgentSelectionOpener } from "./useEscrowForm";
import { type AgentSelectionMode, type LockedEscrowConfirmations } from "./types";
import { LOCKED_ESCROW_WARNINGS } from "./constants";
import {
  useAgentEligibilityForEscrow,
  formatUsdLikeAmount,
  type AgentEligibilityStatus,
} from "@/hooks";

// =============================================================================
// TYPES
// =============================================================================

export interface AgentSelectorProps {
  /** Current selection mode */
  mode: AgentSelectionMode;
  /** Agent address (for manual or browsed modes) */
  agentAddress: string;
  /** Locked escrow confirmations state */
  lockedConfirmations: LockedEscrowConfirmations;
  /** Validation error for agent address */
  error?: string;
  /** Whether the field has been touched */
  isTouched?: boolean;
  /** Callback when mode changes */
  onModeChange: (mode: AgentSelectionMode) => void;
  /** Callback when agent address changes */
  onAgentChange: (address: string, mode: AgentSelectionMode) => void;
  /** Callback when locked confirmation changes */
  onLockedConfirmationChange: (
    key: keyof LockedEscrowConfirmations,
    value: boolean
  ) => void;
  /** Mark field as touched */
  onTouch?: () => void;

  /** Escrow amount as bigint (principal only) - used for agent MAV validation */
  escrowAmount?: bigint;
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface RadioOptionProps {
  value: AgentSelectionMode;
  selected: boolean;
  icon: React.ReactNode;
  title: string;
  description: string;
  isCompleted?: boolean;
  onChange: (value: AgentSelectionMode) => void;
  children?: React.ReactNode;
}

function RadioOption({
  value,
  selected,
  icon,
  title,
  description,
  isCompleted,
  onChange,
  children,
}: RadioOptionProps) {
  return (
    <div
      className={`
        relative rounded-xl border-2 transition-all duration-200 cursor-pointer
        ${selected
          ? "border-primary-500 bg-primary-50/50 dark:bg-primary-900/10"
          : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
        }
      `}
      onClick={() => onChange(value)}
    >
      <div className="p-3 md:p-4">
        <div className="flex items-start gap-3">
          {/* Radio Circle */}
          <div
            className={`
              mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200
              ${selected
                ? "border-primary-500 bg-primary-500"
                : isCompleted
                  ? "border-success-500 bg-success-500"
                  : "border-neutral-300 dark:border-neutral-600"
              }
            `}
          >
            {selected ? (
              <div className="w-2 h-2 rounded-full bg-white" />
            ) : isCompleted ? (
              <CheckCircle2 size={12} className="text-white" />
            ) : null}
          </div>

          {/* Icon */}
          <div
            className={`
              w-10 h-10 rounded-lg flex items-center justify-center transition-colors
              ${selected
                ? "bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400"
                : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
              }
            `}
          >
            {icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <Text className="font-semibold">{title}</Text>
            <Text variant="muted" className="text-sm">
              {description}
            </Text>
          </div>
        </div>

        {/* Expanded Content */}
        {selected && children && (
          <div className="mt-4 pl-3 border-l-2 md:ml-8 md:pl-5 border-primary-200 dark:border-primary-800">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// LOCKED ESCROW WARNING CARD
// =============================================================================

interface LockedEscrowWarningProps {
  confirmations: LockedEscrowConfirmations;
  onConfirmationChange: (
    key: keyof LockedEscrowConfirmations,
    value: boolean
  ) => void;
}

function LockedEscrowWarning({
  confirmations,
  onConfirmationChange,
  t,
}: LockedEscrowWarningProps & { t: (key: string) => string }) {
  return (
    <div className="space-y-4 pt-2">
      <div className="p-4 rounded-xl bg-warning-50 dark:bg-warning-900/10 border border-warning-200 dark:border-warning-800">
        {/* Header removed - integrated into parent RadioOption */}

        {/* Confirmation Checkboxes */}
        <div className="space-y-3">
          {LOCKED_ESCROW_WARNINGS.confirmations.map((confirmation) => (
            <div
              key={confirmation.key}
              className="flex items-start gap-3 cursor-pointer group"
              onClick={(e) => {
                e.stopPropagation();
                onConfirmationChange(confirmation.key, !confirmations[confirmation.key]);
              }}
            >
              <Checkbox
                checked={confirmations[confirmation.key]}
                onChange={(checked) =>
                  onConfirmationChange(confirmation.key, checked)
                }
                className="mt-0.5 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <Text className="text-sm font-medium group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {t(`create.locked.${confirmation.key}`)}
                </Text>
                <Text variant="muted" className="text-xs break-words">
                  {t(`create.locked.${confirmation.key}Desc`)}
                </Text>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendation */}
      <div className="flex items-center gap-2 pl-2">
        <Text variant="muted" className="text-xs italic">
          💡 {t("create.agentSelector.recommendation")}
        </Text>
      </div>
    </div>
  );
}

// =============================================================================
// SELECTED AGENT DISPLAY
// =============================================================================

interface SelectedAgentDisplayProps {
  address: string;
  mode: "manual" | "browsed";
  onClear: () => void;
  onBrowse: () => void;
}

function SelectedAgentDisplay({
  address,
  mode,
  onClear,
  onBrowse,
  t,
}: SelectedAgentDisplayProps & { t: (key: string) => string }) {
  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-success-50 dark:bg-success-900/10 border border-success-200 dark:border-success-800">
      <div className="w-8 h-8 rounded-full bg-success-100 dark:bg-success-900/30 flex items-center justify-center text-success-600 dark:text-success-400">
        <CheckCircle2 size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <Text className="text-sm font-medium text-success-800 dark:text-success-200">
          {t("create.agentSelector.agentSelected")}
        </Text>
        <Text variant="muted" className="text-xs font-mono truncate">
          {shortAddress}
        </Text>
      </div>
      <div className="flex items-center gap-2">
        {mode === "browsed" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onBrowse();
            }}
            className="text-xs"
          >
            {t("create.agentSelector.change")}
          </Button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClear();
          }}
          className="p-1 rounded hover:bg-success-200 dark:hover:bg-success-800 transition-colors"
        >
          <X size={14} className="text-success-600 dark:text-success-400" />
        </button>
      </div>
    </div>
  );
}

function AgentFieldError({ error }: { error?: string }) {
  if (!error) return null;
  return <Text className="text-sm text-error-500">{error}</Text>;
}

// =============================================================================
// AGENT VALIDATION / INFO CARD
// =============================================================================

function getEligibilityMessage(status: AgentEligibilityStatus, t: (key: string) => string): {
  title: string;
  description?: string;
  tone: "success" | "warning" | "error" | "muted";
} {
  if (status.status === "loading") {
    return {
      title: t("create.agentSelector.checkingAgent"),
      description: t("create.agentSelector.checkingAgentDesc"),
      tone: "muted",
    };
  }

  if (status.status === "invalid") {
    switch (status.reason) {
      case "NOT_REGISTERED":
        return {
          title: t("create.agentSelector.agentNotRegistered"),
          description: t("create.agentSelector.agentNotRegisteredDesc"),
          tone: "error",
        };
      case "NOT_ACTIVE":
        return {
          title: t("create.agentSelector.agentInactive"),
          description: t("create.agentSelector.agentInactiveDesc"),
          tone: "error",
        };
      case "NOT_AVAILABLE":
        return {
          title: t("create.agentSelector.agentUnavailable"),
          description: t("create.agentSelector.agentUnavailableDesc"),
          tone: "warning",
        };
      case "INSUFFICIENT_MAV":
        return {
          title: t("create.agentSelector.insufficientMav"),
          description: t("create.agentSelector.insufficientMavDesc"),
          tone: "error",
        };
      default:
        return {
          title: t("create.agentSelector.agentNotEligible"),
          tone: "error",
        };
    }
  }

  if (status.status === "valid") {
    return {
      title: t("create.agentSelector.agentVerified"),
      description: t("create.agentSelector.agentVerifiedDesc"),
      tone: "success",
    };
  }

  return { title: "", tone: "muted" };
}

function AgentInfoCard({ status, t }: { status: AgentEligibilityStatus; t: (key: string) => string }) {
  const message = getEligibilityMessage(status, t);

  const toneClasses =
    message.tone === "success"
      ? "border-success-200 dark:border-success-800 bg-success-50 dark:bg-success-900/10"
      : message.tone === "warning"
        ? "border-warning-200 dark:border-warning-800 bg-warning-50 dark:bg-warning-900/10"
        : message.tone === "error"
          ? "border-error-200 dark:border-error-800 bg-error-50 dark:bg-error-900/10"
          : "border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50";

  const agent = status.status === "valid" || status.status === "invalid" ? status.agent : undefined;
  const decimals = agent?.stablecoinDecimals ?? 6;

  const mav =
    status.status === "valid"
      ? status.agentMavUsd
      : status.status === "invalid"
        ? status.agentMavUsd
        : undefined;

  const required =
    status.status === "valid"
      ? status.requiredUsd
      : status.status === "invalid"
        ? status.requiredUsd
        : undefined;

  const registeredAtLabel = useMemo(() => {
    if (!agent?.registrationTime) return null;
    // registrationTime is seconds
    const ms = Number(agent.registrationTime) * 1000;
    if (!Number.isFinite(ms)) return null;
    return new Date(ms).toLocaleDateString();
  }, [agent?.registrationTime]);

  // Only show card when we are actually checking a specific agent.
  if (status.status === "idle") return null;

  return (
    <Card className={toneClasses}>
      <CardBody className="p-4 space-y-3">
        <div>
          <Text className="text-sm font-semibold">{message.title}</Text>
          {message.description && (
            <Text variant="muted" className="text-xs mt-0.5">
              {message.description}
            </Text>
          )}
        </div>

        {agent && (
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-0.5">
              <Text variant="muted" className="text-[10px] uppercase tracking-wider">
                {t("create.agentSelector.mav")}
              </Text>
              <Text className="font-semibold">
                {mav ? `$${formatUsdLikeAmount(mav, decimals)}` : "—"}
              </Text>
            </div>

            <div className="space-y-0.5">
              <Text variant="muted" className="text-[10px] uppercase tracking-wider">
                {t("create.agentSelector.thisEscrow")}
              </Text>
              <Text className="font-semibold">
                {required ? `$${formatUsdLikeAmount(required, decimals)}` : "—"}
              </Text>
            </div>

            <div className="space-y-0.5">
              <Text variant="muted" className="text-[10px] uppercase tracking-wider">
                {t("create.agentSelector.activeCases")}
              </Text>
              <Text className="font-semibold">{agent.activeCases ?? 0}</Text>
            </div>

            <div className="space-y-0.5">
              <Text variant="muted" className="text-[10px] uppercase tracking-wider">
                {t("create.agentSelector.registered")}
              </Text>
              <Text className="font-semibold">{registeredAtLabel ?? "—"}</Text>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function AgentSelector({
  mode,
  agentAddress,
  lockedConfirmations,
  error,
  isTouched,
  onModeChange,
  onAgentChange,
  onLockedConfirmationChange,
  onTouch,
  escrowAmount,
}: AgentSelectorProps) {
  const t = useTranslations("escrows");
  const { openAgentSelection } = useAgentSelectionOpener();

  // Pure action (no event) for opening the browse tab. Keep this separate from
  // click handlers so it can be reused from places where we do/don't have an event.
  const browseAgents = useCallback(() => {
    openAgentSelection();
  }, [openAgentSelection]);

  // Listen for agent selection from browse tab
  const handleAgentSelected = useCallback(
    (address: string) => {
      onAgentChange(address, "browsed");
    },
    [onAgentChange]
  );

  useAgentSelectionListener(handleAgentSelected);

  // Handle mode change
  const handleModeChange = useCallback(
    (newMode: AgentSelectionMode) => {
      onModeChange(newMode);
      // Clear agent address when switching to "none" mode
      if (newMode === "none") {
        onAgentChange("", "none");
      }
    },
    [onModeChange, onAgentChange]
  );

  // Handle manual address input
  const handleManualAddressChange = useCallback(
    (value: string) => {
      onAgentChange(value, "manual");
    },
    [onAgentChange]
  );

  // Handle browse button click
  const handleBrowseClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      browseAgents();
    },
    [browseAgents]
  );

  // Handle clear selection
  const handleClear = useCallback(() => {
    onAgentChange("", mode === "browsed" ? "browsed" : "manual");
  }, [onAgentChange, mode]);

  // Check if we have a valid selected agent
  const hasValidAgent = agentAddress && isAddress(agentAddress);

  const eligibility = useAgentEligibilityForEscrow({
    agentAddress: hasValidAgent ? agentAddress : "",
    escrowAmount,
  });

  return (
    <div className="space-y-3">
      {/* Option 1: No Agent (Locked Escrow) */}
      <RadioOption
        value="none"
        selected={mode === "none"}
        isCompleted={Object.values(lockedConfirmations).every(v => v)}
        icon={<AlertTriangle size={20} />}
        title={t("create.agentSelector.noAgent")}
        description={t("create.agentSelector.noAgentDesc")}
        onChange={handleModeChange}
      >
        <LockedEscrowWarning
          confirmations={lockedConfirmations}
          onConfirmationChange={onLockedConfirmationChange}
          t={t}
        />
      </RadioOption>

      {/* Option 2: Enter Address Manually */}
      <RadioOption
        value="manual"
        selected={mode === "manual"}
        icon={<User size={20} />}
        title={t("create.agentSelector.enterAddress")}
        description={t("create.agentSelector.enterAddressDesc")}
        onChange={handleModeChange}
      >
        <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
          <Input
            placeholder="0x..."
            value={agentAddress}
            onChange={(e) => handleManualAddressChange(e.target.value)}
            onBlur={onTouch}
            error={isTouched ? error : undefined}
            className="font-mono"
          />
          {hasValidAgent && (
            <div className="space-y-3">
              <SelectedAgentDisplay
                address={agentAddress}
                mode="manual"
                onClear={handleClear}
                onBrowse={browseAgents}
                t={t}
              />
              <AgentInfoCard status={eligibility} t={t} />
            </div>
          )}
        </div>
      </RadioOption>

      {/* Option 3: Browse Available Agents */}
      <RadioOption
        value="browsed"
        selected={mode === "browsed"}
        icon={<Search size={20} />}
        title={t("create.agentSelector.browseAgents")}
        description={t("create.agentSelector.browseAgentsDesc")}
        onChange={handleModeChange}
      >
        <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
          {hasValidAgent ? (
            <div className="space-y-3">
              <SelectedAgentDisplay
                address={agentAddress}
                mode="browsed"
                onClear={handleClear}
                onBrowse={browseAgents}
                t={t}
              />
              {/* In browsed mode there is no input field to render inline errors.
                  Still show agent validation errors (e.g. agent == seller). */}
              {isTouched && <AgentFieldError error={error} />}
              <AgentInfoCard status={eligibility} t={t} />
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full justify-center gap-2"
              onClick={handleBrowseClick}
            >
              <Search size={16} />
              {t("create.agentSelector.browseAgentsBtn")}
              <ExternalLink size={14} className="ml-1 opacity-50" />
            </Button>
          )}
        </div>
      </RadioOption>

      {/* Error Display (for locked escrow confirmations) */}
      {mode === "none" && isTouched && error && (
        <Text className="text-sm text-error-500">{error}</Text>
      )}
    </div>
  );
}

export default AgentSelector;
