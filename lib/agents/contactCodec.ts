/**
 * Contact codec for agent contact information.
 *
 * On-chain storage: single string with total max length enforced by contract (50 bytes).
 *
 * New format:
 *   "<name>:<value>" OR "<name>:<value>;<name>:<value>"
 * Examples:
 *   telegram:@username
 *   email:asdf@protonmail.com
 *   discord:@username
 *
 * Backwards compatibility:
 *   Existing UI stored as: "<free text> | <free text>" (legacy)
 *   parseContactString supports both `;` and `|`.
 */

export type ContactKind = "telegram" | "discord" | "email" | "custom";
export type ContactKindOrEmpty = ContactKind | "";

export interface ContactEntryInput {
  /** Empty string means “not selected yet” (UI state) */
  kind: ContactKindOrEmpty;
  /**
   * Required for kind=custom.
   * For predefined kinds, it is ignored.
   */
  customName?: string;
  /** Raw user value (no prefix, no trimming applied yet) */
  value: string;
}

export interface ParsedContactEntry {
  name: string;
  value: string;
  raw: string;
}

export interface ContactValidationError {
  field: "name" | "value" | "combined";
  message: string;
}

export const CONTACT_MAX_BYTES = 50;
export const CONTACT_ENTRY_SEPARATOR = ";";

const PREDEFINED_NAMES = ["telegram", "discord", "email"] as const;
export type PredefinedContactName = (typeof PREDEFINED_NAMES)[number];

export function byteLengthUtf8(value: string): number {
  // Browser-safe UTF-8 byte length.
  return new TextEncoder().encode(value).length;
}

function normalizeName(kind: ContactKind, customName?: string): string {
  if (kind === "custom") return (customName ?? "").trim().toLowerCase();
  return kind;
}

function normalizeNameFromInput(kind: ContactKindOrEmpty, customName?: string): string {
  if (!kind) return "";
  return normalizeName(kind, customName);
}

function normalizeValue(value: string): string {
  return value.trim();
}

function splitWithCompat(contact: string): string[] {
  const trimmed = contact.trim();
  if (!trimmed) return [];
  // Prefer new delimiter if present.
  if (trimmed.includes(CONTACT_ENTRY_SEPARATOR)) {
    return trimmed
      .split(CONTACT_ENTRY_SEPARATOR)
      .map((p) => p.trim())
      .filter(Boolean);
  }
  // Legacy delimiter.
  if (trimmed.includes("|")) {
    return trimmed
      .split("|")
      .map((p) => p.trim())
      .filter(Boolean);
  }
  return [trimmed];
}

export function parseContactString(contact: string): ParsedContactEntry[] {
  const parts = splitWithCompat(contact);

  return parts.map((raw) => {
    const idx = raw.indexOf(":");
    if (idx === -1) {
      // Legacy/free-form or invalid new entry. Treat whole string as value-only.
      return { name: "", value: raw, raw };
    }
    const name = raw.slice(0, idx).trim();
    const value = raw.slice(idx + 1).trim();
    return { name, value, raw };
  });
}

export function buildContactEntry(input: ContactEntryInput): string {
  const name = normalizeNameFromInput(input.kind, input.customName);
  const value = normalizeValue(input.value);
  if (!name || !value) return "";
  return `${name}:${value}`;
}

export function buildContactString(primary?: ContactEntryInput | null, secondary?: ContactEntryInput | null): string {
  const entries: string[] = [];
  if (primary) {
    const e = buildContactEntry(primary);
    if (e) entries.push(e);
  }
  if (secondary) {
    const e = buildContactEntry(secondary);
    if (e) entries.push(e);
  }
  return entries.join(CONTACT_ENTRY_SEPARATOR);
}

export function validateContactEntry(input: ContactEntryInput): ContactValidationError[] {
  const errors: ContactValidationError[] = [];

  const name = normalizeNameFromInput(input.kind, input.customName);
  const value = normalizeValue(input.value);

  // Name validation
  if (!name) {
    errors.push({ field: "name", message: "Contact type/name is required" });
    return errors;
  }
  if (input.kind === "custom") {
    // Keep names short to preserve the 50-byte budget.
    if (!/^[a-z][a-z0-9_-]{0,14}$/.test(name)) {
      errors.push({
        field: "name",
        message: "Custom contact name must be lowercase and contain only letters, numbers, '_' or '-' (max 15 chars)",
      });
    }
    if (PREDEFINED_NAMES.includes(name as PredefinedContactName)) {
      errors.push({ field: "name", message: "Custom contact name cannot be telegram/discord/email" });
    }
  } else {
    if (!PREDEFINED_NAMES.includes(name as PredefinedContactName)) {
      errors.push({ field: "name", message: "Unsupported contact type" });
    }
  }

  // Value validation
  if (!value) {
    errors.push({ field: "value", message: "Contact value is required" });
    return errors;
  }

  // Prevent delimiter injection (would break parsing)
  if (value.includes(CONTACT_ENTRY_SEPARATOR)) {
    errors.push({ field: "value", message: `Value cannot include '${CONTACT_ENTRY_SEPARATOR}'` });
  }

  // Predefined semantic validation
  if (name === "telegram" || name === "discord") {
    if (!/^@[A-Za-z0-9_]{3,32}$/.test(value)) {
      errors.push({ field: "value", message: "Must be in the format @username (3-32 chars, letters/numbers/underscore)" });
    }
  }

  if (name === "email") {
    // Conservative email validation.
    if (value.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      errors.push({ field: "value", message: "Invalid email address" });
    }
  }

  return errors;
}

export function guessContactKindFromLegacyValue(value: string): ContactKind {
  const v = value.trim();
  if (!v) return "custom";
  // Prefer explicit @username pattern for telegram/discord.
  if (/^@[A-Za-z0-9_]{3,32}$/.test(v)) return "telegram";
  // Conservative email detection.
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "email";
  return "custom";
}

export function parsedEntryToInput(entry: ParsedContactEntry): ContactEntryInput {
  if (!entry.name) {
    const kind = guessContactKindFromLegacyValue(entry.value);
    if (kind === "custom") {
      return { kind: "custom", customName: "contact", value: entry.value };
    }
    return { kind, value: entry.value };
  }

  const kind = kindFromParsedName(entry.name);
  if (kind === "custom") {
    return { kind: "custom", customName: entry.name, value: entry.value };
  }
  return { kind, value: entry.value };
}

function kindFromParsedName(name: string): ContactKind {
  const normalized = name.trim().toLowerCase();
  if (normalized === "telegram") return "telegram";
  if (normalized === "discord") return "discord";
  if (normalized === "email") return "email";
  return "custom";
}

export function validateContactStringStrict(
  contact: string,
  opts: { requirePrimary: boolean }
): ContactValidationError[] {
  const errors: ContactValidationError[] = [];

  const trimmed = contact.trim();
  if (!trimmed) {
    if (opts.requirePrimary) {
      errors.push({ field: "combined", message: "Contact is required" });
    }
    return errors;
  }

  errors.push(...validateContactString(trimmed));

  const parsed = parseContactString(trimmed);
  if (opts.requirePrimary && parsed.length === 0) {
    errors.push({ field: "combined", message: "Contact is required" });
    return errors;
  }

  // Validate each entry.
  for (const entry of parsed) {
    if (!entry.name) {
      // We do not accept free-form in the new strict mode.
      errors.push({ field: "combined", message: "Contact must be in the format name:value" });
      continue;
    }
    const kind = kindFromParsedName(entry.name);
    const asInput: ContactEntryInput =
      kind === "custom"
        ? { kind: "custom", customName: entry.name, value: entry.value }
        : { kind, value: entry.value };
    errors.push(...validateContactEntry(asInput));
  }

  return errors;
}

export function validateContactString(contact: string): ContactValidationError[] {
  const errors: ContactValidationError[] = [];
  const len = byteLengthUtf8(contact.trim());
  if (len > CONTACT_MAX_BYTES) {
    errors.push({ field: "combined", message: `Total contact info exceeds ${CONTACT_MAX_BYTES} bytes (${len}/${CONTACT_MAX_BYTES})` });
  }
  return errors;
}
