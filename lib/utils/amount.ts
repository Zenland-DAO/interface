import { parseUnits, formatUnits } from "viem";

/**
 * Parse a user-entered decimal amount (string) into token smallest units (bigint).
 *
 * Rules:
 * - trims whitespace
 * - removes commas
 * - converts ".5" -> "0.5"
 * - converts "1." -> "1.0"
 *
 * Returns null if empty or invalid.
 */
export function parseUserAmountToUnits(value: string, decimals: number): bigint | null {
  const sanitized = sanitizeDecimalInput(value);
  if (!sanitized) return null;

  try {
    return parseUnits(sanitized, decimals);
  } catch {
    return null;
  }
}

/**
 * Normalize a user-entered amount into a canonical decimal string.
 *
 * Useful for hashing / stable comparisons.
 */
export function normalizeUserAmount(value: string, decimals: number): string | null {
  const units = parseUserAmountToUnits(value, decimals);
  if (units === null) return null;
  if (units <= BigInt(0)) return null;
  return formatUnits(units, decimals);
}

/**
 * Format a bigint amount (smallest unit) into a locale-friendly display string.
 *
 * NOTE: This intentionally uses `formatUnits` (string) then converts to `Number`
 * for locale formatting. If the value is too large for `Number`, we fall back
 * to the raw decimal string.
 */
export function formatAmount(
  amount: bigint,
  decimals: number,
  displayDecimals: number = 2
): string {
  const raw = formatUnits(amount, decimals);
  const asNumber = Number(raw);

  // If the number is too large for JS Number, fall back to the raw string.
  if (!Number.isFinite(asNumber)) return raw;

  return asNumber.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: displayDecimals,
  });
}

function sanitizeDecimalInput(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  // Remove common thousands separators ("1,000.5")
  let out = trimmed.replace(/,/g, "");

  // ".5" -> "0.5"
  if (out.startsWith(".")) out = `0${out}`;

  // "1." -> "1.0" (parseUnits rejects trailing dot)
  if (out.endsWith(".")) out = `${out}0`;

  return out;
}
