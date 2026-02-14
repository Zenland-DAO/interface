/**
 * FeeManager ABI
 *
 * Includes functions needed for:
 * - Token validation (whitelist check)
 * - Fee calculation
 * - Token configuration retrieval
 */
export const feeManagerAbi = [
  // ═══════════════════════════════════════════════════════════════════════════════════
  //                                  FEE CALCULATION
  // ═══════════════════════════════════════════════════════════════════════════════════

  {
    inputs: [
      { internalType: "address", name: "token", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "calculateFee",
    outputs: [{ internalType: "uint256", name: "fee", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },

  // ═══════════════════════════════════════════════════════════════════════════════════
  //                                 TOKEN VALIDATION
  // ═══════════════════════════════════════════════════════════════════════════════════

  {
    inputs: [{ internalType: "address", name: "token", type: "address" }],
    name: "validateToken",
    outputs: [{ internalType: "bool", name: "isValid", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },

  {
    inputs: [{ internalType: "address", name: "token", type: "address" }],
    name: "getTokenMinimum",
    outputs: [{ internalType: "uint256", name: "minimum", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },

  // ═══════════════════════════════════════════════════════════════════════════════════
  //                                  VIEW FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════════════════════

  {
    inputs: [],
    name: "treasury",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },

  {
    inputs: [{ internalType: "address", name: "token", type: "address" }],
    name: "getTokenConfig",
    outputs: [
      {
        components: [
          { internalType: "bool", name: "isWhitelisted", type: "bool" },
          { internalType: "uint256", name: "minimum", type: "uint256" },
          { internalType: "uint256", name: "feeBps", type: "uint256" },
          { internalType: "uint256", name: "minFee", type: "uint256" },
          { internalType: "uint256", name: "maxFee", type: "uint256" },
        ],
        internalType: "struct EscrowTypes.TokenConfig",
        name: "config",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },

  {
    inputs: [],
    name: "getWhitelistedTokens",
    outputs: [{ internalType: "address[]", name: "tokens", type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },

  // ═══════════════════════════════════════════════════════════════════════════════════
  //                                     EVENTS
  // ═══════════════════════════════════════════════════════════════════════════════════

  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "token", type: "address" },
      { indexed: false, internalType: "uint256", name: "minimum", type: "uint256" },
    ],
    name: "TokenWhitelisted",
    type: "event",
  },

  {
    anonymous: false,
    inputs: [{ indexed: true, internalType: "address", name: "token", type: "address" }],
    name: "TokenRemoved",
    type: "event",
  },

  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "token", type: "address" },
      { indexed: false, internalType: "uint256", name: "oldMinimum", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "newMinimum", type: "uint256" },
    ],
    name: "TokenMinimumUpdated",
    type: "event",
  },

  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "address", name: "oldTreasury", type: "address" },
      { indexed: false, internalType: "address", name: "newTreasury", type: "address" },
    ],
    name: "TreasuryUpdated",
    type: "event",
  },

  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "token", type: "address" },
      { indexed: false, internalType: "uint256", name: "feeBps", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "minFee", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "maxFee", type: "uint256" },
    ],
    name: "TokenFeeConfigUpdated",
    type: "event",
  },
] as const;

/**
 * Type definitions for token configuration
 */
export interface TokenConfig {
  isWhitelisted: boolean;
  minimum: bigint;
  feeBps: bigint;
  minFee: bigint;
  maxFee: bigint;
}
