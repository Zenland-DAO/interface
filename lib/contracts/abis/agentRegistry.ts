/**
 * AgentRegistry ABI
 *
 * Includes both read and write functions for agent registration.
 */
export const agentRegistryAbi = [
  // ═══════════════════════════════════════════════════════════════════════
  //                              EVENTS
  // ═══════════════════════════════════════════════════════════════════════
  {
    type: "event",
    name: "AgentRegistered",
    inputs: [
      { name: "agent", type: "address", indexed: true },
      { name: "stablecoinToken", type: "address", indexed: false },
      { name: "stablecoinStake", type: "uint256", indexed: false },
      { name: "daoTokenStake", type: "uint256", indexed: false },
      { name: "feeBps", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "AgentUnstaked",
    inputs: [
      { name: "agent", type: "address", indexed: true },
      { name: "stablecoinAmount", type: "uint256", indexed: false },
      { name: "daoTokenAmount", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "AgentAvailabilitySet",
    inputs: [
      { name: "agent", type: "address", indexed: true },
      { name: "available", type: "bool", indexed: false },
    ],
  },
  {
    type: "event",
    name: "AgentProfileUpdated",
    inputs: [
      { name: "agent", type: "address", indexed: true },
      { name: "description", type: "string", indexed: false },
      { name: "contact", type: "string", indexed: false },
    ],
  },
  {
    type: "event",
    name: "StablecoinStakeIncreased",
    inputs: [
      { name: "agent", type: "address", indexed: true },
      { name: "newTotal", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "DaoTokenStakeIncreased",
    inputs: [
      { name: "agent", type: "address", indexed: true },
      { name: "newTotal", type: "uint256", indexed: false },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════
  //                          READ FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════════

  // Constants
  {
    type: "function",
    name: "MAX_DESCRIPTION_LENGTH",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "MAX_CONTACT_LENGTH",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "MAX_ALLOWED_FEE_BPS",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "BPS_DENOMINATOR",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "WAD",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },

  // Storage getters
  {
    type: "function",
    name: "daoToken",
    inputs: [],
    outputs: [{ type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "feeManager",
    inputs: [],
    outputs: [{ type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "escrowFactory",
    inputs: [],
    outputs: [{ type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "minStablecoinStake",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "minDaoTokenStake",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "minFeeBps",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "maxFeeBps",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "mavMultiplier",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "unstakeCooldown",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },

  // View functions
  {
    type: "function",
    name: "isAgent",
    inputs: [{ name: "agent", type: "address" }],
    outputs: [{ name: "isRegistered", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getAgentInfo",
    inputs: [{ name: "agent", type: "address" }],
    outputs: [
      {
        name: "info",
        type: "tuple",
        components: [
          { name: "isActive", type: "bool" },
          { name: "isAvailable", type: "bool" },
          { name: "stablecoinToken", type: "address" },
          { name: "stablecoinDecimals", type: "uint8" },
          { name: "stablecoinStake", type: "uint256" },
          { name: "normalizedStakeWad", type: "uint256" },
          { name: "daoTokenStake", type: "uint256" },
          { name: "disputeFeeBps", type: "uint256" },
          { name: "assignmentFeeBps", type: "uint256" },
          { name: "description", type: "string" },
          { name: "contact", type: "string" },
          { name: "lastEngagementTimestamp", type: "uint256" },
          { name: "totalResolved", type: "uint256" },
          { name: "registrationTime", type: "uint256" },
          { name: "activeCases", type: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getAgentList",
    inputs: [],
    outputs: [{ name: "agents", type: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getMaxArbitratableValue",
    inputs: [{ name: "agent", type: "address" }],
    outputs: [{ name: "mav", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getAgentDisputeFeeBps",
    inputs: [{ name: "agent", type: "address" }],
    outputs: [{ name: "feeBps", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getAgentAssignmentFeeBps",
    inputs: [{ name: "agent", type: "address" }],
    outputs: [{ name: "feeBps", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "validateAgentForContract",
    inputs: [
      { name: "agent", type: "address" },
      { name: "contractValueWad", type: "uint256" },
    ],
    outputs: [{ name: "isValid", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getParameters",
    inputs: [],
    outputs: [
      { name: "minStablecoinStake_", type: "uint256" },
      { name: "minDaoTokenStake_", type: "uint256" },
      { name: "minFeeBps_", type: "uint256" },
      { name: "maxFeeBps_", type: "uint256" },
      { name: "mavMultiplier_", type: "uint256" },
      { name: "unstakeCooldown_", type: "uint256" },
    ],
    stateMutability: "view",
  },

  // ═══════════════════════════════════════════════════════════════════════
  //                          WRITE FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════════
  {
    type: "function",
    name: "registerAgent",
    inputs: [
      { name: "stablecoinToken", type: "address" },
      { name: "stablecoinAmount", type: "uint256" },
      { name: "daoTokenAmount", type: "uint256" },
      { name: "assignmentFeeBps", type: "uint256" },
      { name: "disputeFeeBps", type: "uint256" },
      { name: "description", type: "string" },
      { name: "contact", type: "string" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "registerAgentWithPermit",
    inputs: [
      { name: "stablecoinToken", type: "address" },
      { name: "stablecoinAmount", type: "uint256" },
      { name: "daoTokenAmount", type: "uint256" },
      { name: "assignmentFeeBps", type: "uint256" },
      { name: "disputeFeeBps", type: "uint256" },
      { name: "description", type: "string" },
      { name: "contact", type: "string" },
      {
        name: "stablecoinPermit",
        type: "tuple",
        components: [
          { name: "deadline", type: "uint256" },
          { name: "v", type: "uint8" },
          { name: "r", type: "bytes32" },
          { name: "s", type: "bytes32" },
        ],
      },
      {
        name: "daoTokenPermit",
        type: "tuple",
        components: [
          { name: "deadline", type: "uint256" },
          { name: "v", type: "uint8" },
          { name: "r", type: "bytes32" },
          { name: "s", type: "bytes32" },
        ],
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "increaseStablecoinStake",
    inputs: [{ name: "amount", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "increaseStablecoinStakeWithPermit",
    inputs: [
      { name: "amount", type: "uint256" },
      {
        name: "stablecoinPermit",
        type: "tuple",
        components: [
          { name: "deadline", type: "uint256" },
          { name: "v", type: "uint8" },
          { name: "r", type: "bytes32" },
          { name: "s", type: "bytes32" },
        ],
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "increaseDaoTokenStake",
    inputs: [{ name: "amount", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "increaseDaoTokenStakeWithPermit",
    inputs: [
      { name: "amount", type: "uint256" },
      {
        name: "daoTokenPermit",
        type: "tuple",
        components: [
          { name: "deadline", type: "uint256" },
          { name: "v", type: "uint8" },
          { name: "r", type: "bytes32" },
          { name: "s", type: "bytes32" },
        ],
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "executeUnstake",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setAvailability",
    inputs: [{ name: "available", type: "bool" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "updateAgentProfile",
    inputs: [
      { name: "description", type: "string" },
      { name: "contact", type: "string" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "updateAgentDisputeFee",
    inputs: [{ name: "feeBps", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "updateAgentAssignmentFee",
    inputs: [{ name: "feeBps", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },

  // ═══════════════════════════════════════════════════════════════════════
  //                              ERRORS
  // ═══════════════════════════════════════════════════════════════════════
  {
    type: "error",
    name: "Agent__AlreadyRegistered",
    inputs: [],
  },
  {
    type: "error",
    name: "Agent__NotRegistered",
    inputs: [],
  },
  {
    type: "error",
    name: "Agent__StablecoinNotAccepted",
    inputs: [{ name: "token", type: "address" }],
  },
  {
    type: "error",
    name: "Agent__TokenDecimalsExceedWad",
    inputs: [
      { name: "token", type: "address" },
      { name: "decimals", type: "uint8" },
    ],
  },
  {
    type: "error",
    name: "Agent__StablecoinStakeTooLow",
    inputs: [
      { name: "provided", type: "uint256" },
      { name: "required", type: "uint256" },
    ],
  },
  {
    type: "error",
    name: "Agent__DaoTokenStakeTooLow",
    inputs: [
      { name: "provided", type: "uint256" },
      { name: "required", type: "uint256" },
    ],
  },
  {
    type: "error",
    name: "Agent__FeeOutOfBounds",
    inputs: [
      { name: "provided", type: "uint256" },
      { name: "min", type: "uint256" },
      { name: "max", type: "uint256" },
    ],
  },
  {
    type: "error",
    name: "Agent__DescriptionTooLong",
    inputs: [
      { name: "provided", type: "uint256" },
      { name: "max", type: "uint256" },
    ],
  },
  {
    type: "error",
    name: "Agent__ContactTooLong",
    inputs: [
      { name: "provided", type: "uint256" },
      { name: "max", type: "uint256" },
    ],
  },
  {
    type: "error",
    name: "Agent__MustBeUnavailable",
    inputs: [],
  },
  {
    type: "error",
    name: "Agent__HasActiveCases",
    inputs: [{ name: "activeCases", type: "uint256" }],
  },
  {
    type: "error",
    name: "Agent__EngagementCooldownActive",
    inputs: [
      { name: "lastEngagement", type: "uint256" },
      { name: "cooldown", type: "uint256" },
    ],
  },
  {
    type: "error",
    name: "Agent__PermitFailed",
    inputs: [],
  },
] as const;
