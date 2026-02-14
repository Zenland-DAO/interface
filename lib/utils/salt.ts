import { type Hex } from "viem";

/**
 * Generate a cryptographically secure random bytes32 salt.
 * Used for deterministic escrow address prediction via CREATE2.
 *
 * @returns A random bytes32 hex string
 */
export function generateUserSalt(): Hex {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return `0x${Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")}` as Hex;
}

/**
 * Validate that a string is a valid bytes32 hex.
 *
 * @param value - The value to validate
 * @returns True if the value is a valid bytes32 hex
 */
export function isValidBytes32(value: string): value is Hex {
  return /^0x[a-fA-F0-9]{64}$/.test(value);
}

/**
 * Convert a string to bytes32 by padding with zeros.
 * Useful for converting short identifiers to bytes32.
 *
 * @param value - The string to convert (must be <= 32 bytes when encoded as UTF-8)
 * @returns A bytes32 hex string
 */
export function stringToBytes32(value: string): Hex {
  const encoder = new TextEncoder();
  const encoded = encoder.encode(value);

  if (encoded.length > 32) {
    throw new Error("String is too long for bytes32 (max 32 bytes)");
  }

  // Pad to 32 bytes
  const padded = new Uint8Array(32);
  padded.set(encoded);

  return `0x${Array.from(padded)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")}` as Hex;
}

/**
 * Zero bytes32 constant - used for "no agent" in locked escrows.
 */
export const ZERO_BYTES32: Hex =
  "0x0000000000000000000000000000000000000000000000000000000000000000";
