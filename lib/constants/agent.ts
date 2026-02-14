/**
 * Agent Registration Constants
 *
 * These values are used for validation and UI display.
 * They match the deployed AgentRegistry contract parameters.
 */

/**
 * Minimum stablecoin stake in USD (human-readable).
 * Contract stores this in WAD (18 decimals).
 */
export const MIN_STABLECOIN_STAKE_USD = 1;

/**
 * Minimum DAO token stake (human-readable).
 * Contract stores this in token's native decimals (18).
 */
export const MIN_DAO_TOKEN_STAKE = 100;

/**
 * Minimum fee in basis points (0.1% = 10 bps).
 */
export const MIN_FEE_BPS = 10;

/**
 * Maximum fee in basis points (10% = 1000 bps).
 */
export const MAX_FEE_BPS = 1000;

/**
 * MAV multiplier - how much MAV you get per dollar staked.
 * $1 stake * 20 = $20 MAV
 */
export const MAV_MULTIPLIER = 20;

/**
 * Maximum description length in characters.
 */
export const MAX_DESCRIPTION_LENGTH = 150;

/**
 * Maximum contact length in characters.
 */
export const MAX_CONTACT_LENGTH = 50;

/**
 * Unstake cooldown period in seconds (30 days).
 */
export const UNSTAKE_COOLDOWN_SECONDS = 30 * 24 * 60 * 60;

/**
 * Default fee values for the registration form.
 */
export const DEFAULT_ASSIGNMENT_FEE_BPS = 250; // 2.5%
export const DEFAULT_DISPUTE_FEE_BPS = 300; // 3.0%

/**
 * Basis points denominator.
 */
export const BPS_DENOMINATOR = 10000;

/**
 * Convert basis points to percentage.
 */
export function bpsToPercent(bps: number): number {
  return bps / 100;
}

/**
 * Convert percentage to basis points.
 */
export function percentToBps(percent: number): number {
  return Math.round(percent * 100);
}

/**
 * Format basis points as percentage string.
 */
export function formatBpsAsPercent(bps: number): string {
  return `${bpsToPercent(bps)}%`;
}

/**
 * Calculate MAV from stablecoin stake.
 * @param stakeUsd - Stablecoin stake in USD
 * @returns Maximum Arbitratable Value in USD
 */
export function calculateMav(stakeUsd: number): number {
  return stakeUsd * MAV_MULTIPLIER;
}

// NOTE: contact parsing/building/validation moved to `interface/lib/agents/contactCodec.ts`.
