/**
 * EscrowFactory ABI
 *
 * Includes functions needed for escrow creation workflow:
 * - Quote functions for getting predicted address and fees
 * - Create functions for deploying escrows
 * - View functions for factory state
 */
export const escrowFactoryAbi = [
  // ═══════════════════════════════════════════════════════════════════════════════════
  //                               ADDRESS PREDICTION
  // ═══════════════════════════════════════════════════════════════════════════════════

  {
    inputs: [
      { internalType: "bytes32", name: "userSalt", type: "bytes32" },
      { internalType: "address", name: "buyer", type: "address" },
      { internalType: "uint256", name: "version", type: "uint256" },
    ],
    name: "predictAddress",
    outputs: [{ internalType: "address", name: "escrow", type: "address" }],
    stateMutability: "view",
    type: "function",
  },

  {
    inputs: [
      { internalType: "bytes32", name: "userSalt", type: "bytes32" },
      { internalType: "address", name: "buyer", type: "address" },
      { internalType: "address", name: "token", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "uint256", name: "versionHint", type: "uint256" },
    ],
    name: "quoteCreateEscrow",
    outputs: [
      {
        components: [
          { internalType: "address", name: "predictedEscrow", type: "address" },
          { internalType: "bytes32", name: "finalSalt", type: "bytes32" },
          { internalType: "uint256", name: "versionUsed", type: "uint256" },
          { internalType: "uint256", name: "creationFee", type: "uint256" },
          { internalType: "uint256", name: "assignmentFee", type: "uint256" },
        ],
        internalType: "struct EscrowTypes.EscrowQuote",
        name: "quote",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },

  {
    inputs: [
      { internalType: "bytes32", name: "userSalt", type: "bytes32" },
      { internalType: "address", name: "buyer", type: "address" },
      { internalType: "address", name: "agent", type: "address" },
      { internalType: "address", name: "token", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "uint256", name: "versionHint", type: "uint256" },
    ],
    name: "quoteCreateEscrowWithAgent",
    outputs: [
      {
        components: [
          { internalType: "address", name: "predictedEscrow", type: "address" },
          { internalType: "bytes32", name: "finalSalt", type: "bytes32" },
          { internalType: "uint256", name: "versionUsed", type: "uint256" },
          { internalType: "uint256", name: "creationFee", type: "uint256" },
          { internalType: "uint256", name: "assignmentFee", type: "uint256" },
        ],
        internalType: "struct EscrowTypes.EscrowQuote",
        name: "quote",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },

  // ═══════════════════════════════════════════════════════════════════════════════════
  //                               ESCROW CREATION
  // ═══════════════════════════════════════════════════════════════════════════════════

  {
    inputs: [
      {
        components: [
          { internalType: "bytes32", name: "userSalt", type: "bytes32" },
          { internalType: "address", name: "seller", type: "address" },
          { internalType: "address", name: "agent", type: "address" },
          { internalType: "address", name: "token", type: "address" },
          { internalType: "uint256", name: "amount", type: "uint256" },
          { internalType: "uint256", name: "buyerProtectionTime", type: "uint256" },
          { internalType: "bytes32", name: "termsHash", type: "bytes32" },
          { internalType: "uint256", name: "version", type: "uint256" },
          { internalType: "address", name: "expectedEscrow", type: "address" },
        ],
        internalType: "struct EscrowTypes.CreateEscrowParams",
        name: "params",
        type: "tuple",
      },
    ],
    name: "createEscrow",
    outputs: [{ internalType: "address", name: "escrow", type: "address" }],
    stateMutability: "nonpayable",
    type: "function",
  },

  {
    inputs: [
      {
        components: [
          { internalType: "bytes32", name: "userSalt", type: "bytes32" },
          { internalType: "address", name: "seller", type: "address" },
          { internalType: "address", name: "agent", type: "address" },
          { internalType: "address", name: "token", type: "address" },
          { internalType: "uint256", name: "amount", type: "uint256" },
          { internalType: "uint256", name: "buyerProtectionTime", type: "uint256" },
          { internalType: "bytes32", name: "termsHash", type: "bytes32" },
          { internalType: "uint256", name: "version", type: "uint256" },
          { internalType: "address", name: "expectedEscrow", type: "address" },
        ],
        internalType: "struct EscrowTypes.CreateEscrowParams",
        name: "params",
        type: "tuple",
      },
      {
        components: [
          { internalType: "uint256", name: "deadline", type: "uint256" },
          { internalType: "uint8", name: "v", type: "uint8" },
          { internalType: "bytes32", name: "r", type: "bytes32" },
          { internalType: "bytes32", name: "s", type: "bytes32" },
        ],
        internalType: "struct EscrowTypes.PermitParams",
        name: "permit",
        type: "tuple",
      },
    ],
    name: "createEscrowWithPermit",
    outputs: [{ internalType: "address", name: "escrow", type: "address" }],
    stateMutability: "nonpayable",
    type: "function",
  },

  // ═══════════════════════════════════════════════════════════════════════════════════
  //                                  VIEW FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════════════════════

  {
    inputs: [{ internalType: "uint256", name: "version", type: "uint256" }],
    name: "escrowImplementations",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },

  {
    inputs: [],
    name: "latestVersion",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },

  {
    inputs: [],
    name: "defaultVersion",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },

  {
    inputs: [{ internalType: "address", name: "escrow", type: "address" }],
    name: "isEscrow",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },

  {
    inputs: [],
    name: "agentRegistry",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },

  {
    inputs: [],
    name: "feeManager",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },

  {
    inputs: [],
    name: "agentResponseTime",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },

  {
    inputs: [],
    name: "MIN_BUYER_PROTECTION_TIME",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },

  {
    inputs: [{ internalType: "uint256", name: "version", type: "uint256" }],
    name: "implementationSemver",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },

  // ═══════════════════════════════════════════════════════════════════════════════════
  //                                     EVENTS
  // ═══════════════════════════════════════════════════════════════════════════════════

  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "escrow", type: "address" },
      { indexed: true, internalType: "address", name: "buyer", type: "address" },
      { indexed: true, internalType: "address", name: "seller", type: "address" },
      { indexed: false, internalType: "address", name: "agent", type: "address" },
      { indexed: false, internalType: "address", name: "token", type: "address" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "creationFee", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "version", type: "uint256" },
    ],
    name: "EscrowCreated",
    type: "event",
  },

  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "payer", type: "address" },
      { indexed: true, internalType: "address", name: "token", type: "address" },
      { indexed: false, internalType: "uint256", name: "feeAmount", type: "uint256" },
    ],
    name: "ProtocolFeePaid",
    type: "event",
  },

  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "payer", type: "address" },
      { indexed: true, internalType: "address", name: "agent", type: "address" },
      { indexed: true, internalType: "address", name: "token", type: "address" },
      { indexed: false, internalType: "uint256", name: "feeAmount", type: "uint256" },
    ],
    name: "AgentAssignmentFeePaid",
    type: "event",
  },

  // ═══════════════════════════════════════════════════════════════════════════════════
  //                                     ERRORS
  // ═══════════════════════════════════════════════════════════════════════════════════
  // Required so viem can decode reverts (e.g. Factory__AmountBelowMinimum) instead of
  // reporting "Execution reverted for an unknown reason".
  {
    type: "error",
    name: "Factory__VersionNotRegistered",
    inputs: [
      { name: "version", type: "uint256" },
    ],
  },
  {
    type: "error",
    name: "Factory__AddressMismatch",
    inputs: [
      { name: "predicted", type: "address" },
      { name: "expected", type: "address" },
    ],
  },
  {
    type: "error",
    name: "Factory__TokenNotWhitelisted",
    inputs: [
      { name: "token", type: "address" },
    ],
  },
  {
    type: "error",
    name: "Factory__AmountBelowMinimum",
    inputs: [
      { name: "amount", type: "uint256" },
      { name: "minimum", type: "uint256" },
    ],
  },
  {
    type: "error",
    name: "Factory__ProtectionTimeTooShort",
    inputs: [
      { name: "provided", type: "uint256" },
      { name: "minimum", type: "uint256" },
    ],
  },
  {
    type: "error",
    name: "Factory__AgentInvalid",
    inputs: [
      { name: "agent", type: "address" },
    ],
  },
  { type: "error", name: "Factory__AgentIsBuyer", inputs: [] },
  { type: "error", name: "Factory__AgentIsSeller", inputs: [] },
  {
    type: "error",
    name: "Factory__TokenDecimalsExceedWad",
    inputs: [
      { name: "token", type: "address" },
      { name: "decimals", type: "uint8" },
    ],
  },
  { type: "error", name: "Factory__SellerIsZeroAddress", inputs: [] },
  { type: "error", name: "Factory__SellerIsBuyer", inputs: [] },
  { type: "error", name: "Factory__PermitFailed", inputs: [] },
  {
    type: "error",
    name: "Fee__TokenNotWhitelisted",
    inputs: [
      { name: "token", type: "address" },
    ],
  },
  {
    type: "error",
    name: "SafeERC20FailedOperation",
    inputs: [
      { name: "token", type: "address" },
    ],
  },
  { type: "error", name: "ReentrancyGuardReentrantCall", inputs: [] },
] as const;

/**
 * Type definitions for escrow creation parameters
 */
export interface CreateEscrowParams {
  userSalt: `0x${string}`;
  seller: `0x${string}`;
  agent: `0x${string}`;
  token: `0x${string}`;
  amount: bigint;
  buyerProtectionTime: bigint;
  termsHash: `0x${string}`;
  version: bigint;
  expectedEscrow: `0x${string}`;
}

export interface PermitParams {
  deadline: bigint;
  v: number;
  r: `0x${string}`;
  s: `0x${string}`;
}

export interface EscrowQuote {
  predictedEscrow: `0x${string}`;
  finalSalt: `0x${string}`;
  versionUsed: bigint;
  creationFee: bigint;
  assignmentFee: bigint;
}
