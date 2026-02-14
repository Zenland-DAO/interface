import { formatUnits } from "viem";

// Assuming stablecoins have 6 decimals (USDC/USDT standard)
const STABLECOIN_DECIMALS = 6;

/**
 * Format a bigint value as USD currency string.
 * Assumes the value is in stablecoin units (6 decimals for USDC/USDT).
 * 
 * @param value - The bigint value in stablecoin units
 * @param options - Formatting options
 * @returns Formatted USD string (e.g., "$1,234.56")
 */
export function formatUsdValue(
  value: bigint,
  options?: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    compact?: boolean;
  }
): string {
  const formatted = formatUnits(value, STABLECOIN_DECIMALS);
  const num = parseFloat(formatted);

  if (options?.compact && num >= 1000) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }).format(num);
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: options?.minimumFractionDigits ?? 2,
    maximumFractionDigits: options?.maximumFractionDigits ?? 2,
  }).format(num);
}

/**
 * Format a number with compact notation for large values.
 * 
 * @param value - The number to format
 * @returns Formatted string (e.g., "1.2K", "3.4M")
 */
export function formatCompactNumber(value: number): string {
  if (value >= 1000) {
    return new Intl.NumberFormat("en-US", {
      notation: "compact",
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }).format(value);
  }
  
  return new Intl.NumberFormat("en-US").format(value);
}
