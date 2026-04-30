"use client";

import { useMemo } from "react";

import { Select, type SelectOption, Text } from "@/components/ui";
import { MAX_CONTACT_LENGTH } from "@/lib/constants/agent";
import {
  type ContactEntryInput,
  type ContactKindOrEmpty,
  buildContactString,
  validateContactEntry,
  byteLengthUtf8,
} from "@/lib/agents/contactCodec";

export interface ContactFieldsState {
  primary: ContactEntryInput;
  secondary: ContactEntryInput;
}

export interface ContactFieldsProps {
  value: ContactFieldsState;
  onChange: (next: ContactFieldsState) => void;
  /** If false, secondary UI is hidden */
  allowSecondary?: boolean;
  /** When true, both entries are optional. (Registration: primary required; Edit: primary required too.) */
  allowEmptyPrimary?: boolean;
  className?: string;
}

/**
 * Per-kind UI metadata for the editor dropdown. Adding a new predefined kind
 * is now a single-place change here (label + placeholder), assuming the
 * kind has been added to ContactKind in `contactCodec.ts` and given branding
 * in `contactPlatforms.tsx`.
 */
const KIND_META: Record<Exclude<ContactKindOrEmpty, "">, { label: string; placeholder: string }> = {
  telegram: { label: "Telegram", placeholder: "@username" },
  discord: { label: "Discord", placeholder: "@username" },
  email: { label: "Email", placeholder: "name@example.com" },
  twitter: { label: "X (Twitter)", placeholder: "@handle" },
  reddit: { label: "Reddit", placeholder: "u/username" },
  matrix: { label: "Matrix", placeholder: "@user:server.tld" },
  signal: { label: "Signal", placeholder: "+15551234567 or @user.42" },
  custom: { label: "Custom", placeholder: "value" },
};

/**
 * Order matters: this is what users see in the dropdown. Most-used at the top.
 */
const KIND_ORDER: readonly Exclude<ContactKindOrEmpty, "">[] = [
  "telegram",
  "discord",
  "email",
  "twitter",
  "reddit",
  "matrix",
  "signal",
  "custom",
];

const CONTACT_KIND_OPTIONS: SelectOption[] = KIND_ORDER.map((kind) => ({
  label: KIND_META[kind].label,
  value: kind,
}));

const CONTACT_KIND_OPTIONS_WITH_NONE: SelectOption[] = [
  { label: "None", value: "" },
  ...CONTACT_KIND_OPTIONS,
];

function kindLabel(kind: ContactKindOrEmpty): string {
  if (kind === "") return "None";
  return KIND_META[kind].label;
}

function placeholderForKind(kind: ContactKindOrEmpty): string {
  if (kind === "") return "";
  return KIND_META[kind].placeholder;
}

function defaultState(): ContactFieldsState {
  return {
    primary: { kind: "", value: "", customName: "" },
    secondary: { kind: "", value: "", customName: "" },
  };
}

export function ContactFields({
  value,
  onChange,
  allowSecondary = true,
  allowEmptyPrimary = false,
  className = "",
}: ContactFieldsProps) {
  const state = value ?? defaultState();

  const combined = useMemo(() => buildContactString(state.primary, state.secondary), [state.primary, state.secondary]);
  const combinedLen = useMemo(() => byteLengthUtf8(combined), [combined]);

  const primaryEntryErrors = useMemo(() => validateContactEntry(state.primary), [state.primary]);
  const secondaryEntryErrors = useMemo(() => {
    // secondary optional: validate only if user typed something
    const hasAny =
      state.secondary.value.trim().length > 0 ||
      (state.secondary.kind === "custom" && (state.secondary.customName ?? "").trim().length > 0);
    if (!hasAny) return [];
    return validateContactEntry(state.secondary);
  }, [state.secondary]);

  const combinedError = useMemo(() => {
    if (combinedLen > MAX_CONTACT_LENGTH) return `Total contact info exceeds ${MAX_CONTACT_LENGTH} characters`;
    return undefined;
  }, [combinedLen]);

  const primaryErrorText = useMemo(() => {
    if (!allowEmptyPrimary) {
      const missingValue = state.primary.value.trim().length === 0;
      const missingName = state.primary.kind === "custom" && (state.primary.customName ?? "").trim().length === 0;
      if (missingValue || missingName) return "Primary contact is required";
    }
    return primaryEntryErrors[0]?.message;
  }, [allowEmptyPrimary, primaryEntryErrors, state.primary.customName, state.primary.kind, state.primary.value]);

  const secondaryErrorText = useMemo(() => secondaryEntryErrors[0]?.message, [secondaryEntryErrors]);

  const setPrimary = (patch: Partial<ContactEntryInput>) => {
    onChange({
      ...state,
      primary: {
        ...state.primary,
        ...patch,
      },
    });
  };

  const setSecondary = (patch: Partial<ContactEntryInput>) => {
    onChange({
      ...state,
      secondary: {
        ...state.secondary,
        ...patch,
      },
    });
  };

  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Primary */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] ml-1">
            Primary Contact
          </label>

          <div className="flex flex-wrap gap-2">
            <div className="w-28 sm:w-40">
              <Select
                options={CONTACT_KIND_OPTIONS_WITH_NONE}
                value={state.primary.kind}
                onChange={(v) => setPrimary({ kind: v as ContactKindOrEmpty })}
                hideLabel
                variant="compact"
              />
            </div>

            {state.primary.kind === "custom" && (
              <input
                type="text"
                value={state.primary.customName ?? ""}
                onChange={(e) => setPrimary({ customName: e.target.value })}
                placeholder="name"
                className="w-20 sm:w-28 h-[46px] px-3 rounded-xl border border-[var(--border-secondary)] bg-[var(--bg-primary)] text-sm outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            )}

            <input
              type="text"
              value={state.primary.value}
              onChange={(e) => setPrimary({ value: e.target.value })}
              placeholder={placeholderForKind(state.primary.kind)}
              disabled={!state.primary.kind}
              className="flex-1 min-w-[120px] h-[46px] px-4 rounded-xl border border-[var(--border-secondary)] bg-[var(--bg-primary)] text-sm outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>

          <div className="flex justify-between items-center px-1 min-h-[16px]">
            <Text className={`text-[10px] font-medium ${primaryErrorText ? "text-error-500" : "text-[var(--text-tertiary)]"}`}>
              {primaryErrorText ? primaryErrorText : `${kindLabel(state.primary.kind)} format will be stored on-chain as name:value`}
            </Text>
            <Text variant="muted" className="text-[10px] font-mono">
              {byteLengthUtf8(`${state.primary.kind === "custom" ? (state.primary.customName ?? "") : state.primary.kind}:${state.primary.value}`)}/{MAX_CONTACT_LENGTH}
            </Text>
          </div>
        </div>

        {/* Secondary */}
        {allowSecondary && (
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] ml-1">
              Secondary Contact
            </label>

            <div className="flex flex-wrap gap-2">
              <div className="w-28 sm:w-40">
                <Select
                  options={CONTACT_KIND_OPTIONS_WITH_NONE}
                  value={state.secondary.kind}
                  onChange={(v) => setSecondary({ kind: v as ContactKindOrEmpty })}
                  hideLabel
                  variant="compact"
                />
              </div>

              {state.secondary.kind === "custom" && (
                <input
                  type="text"
                  value={state.secondary.customName ?? ""}
                  onChange={(e) => setSecondary({ customName: e.target.value })}
                  placeholder="name"
                  className="w-20 sm:w-28 h-[46px] px-3 rounded-xl border border-[var(--border-secondary)] bg-[var(--bg-primary)] text-sm outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              )}

              <input
                type="text"
                value={state.secondary.value}
                onChange={(e) => setSecondary({ value: e.target.value })}
                placeholder={placeholderForKind(state.secondary.kind)}
                disabled={!state.secondary.kind}
                className="flex-1 min-w-[120px] h-[46px] px-4 rounded-xl border border-[var(--border-secondary)] bg-[var(--bg-primary)] text-sm outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>

            <div className="flex justify-between items-center px-1 min-h-[16px]">
              <Text className={`text-[10px] font-medium ${secondaryErrorText ? "text-error-500" : "text-[var(--text-tertiary)]"}`}>
                {secondaryErrorText ? secondaryErrorText : "Optional"}
              </Text>
              <Text variant="muted" className="text-[10px] font-mono">
                {byteLengthUtf8(`${state.secondary.kind === "custom" ? (state.secondary.customName ?? "") : state.secondary.kind}:${state.secondary.value}`)}/{MAX_CONTACT_LENGTH}
              </Text>
            </div>
          </div>
        )}
      </div>

      {/* Combined */}
      <div className="mt-3 flex items-center justify-between px-1">
        <Text className={`text-[10px] font-medium ${combinedError ? "text-error-500" : "text-[var(--text-tertiary)]"}`}>
          {combinedError ? combinedError : "Stored on-chain as: <name>:<value>[;<name>:<value>]"}
        </Text>
        <Text variant="muted" className="text-[10px] font-mono">
          {combinedLen}/{MAX_CONTACT_LENGTH}
        </Text>
      </div>
    </div>
  );
}
