/**
 * EscrowImplementation ABI
 *
 * Contains only the functions needed for the escrow detail page actions.
 * View functions for reading escrow state and write functions for actions.
 */
export const escrowImplementationAbi = [
  // ==========================================================================
  // WRITE FUNCTIONS
  // ==========================================================================

  // Seller accepts escrow
  {
    inputs: [],
    name: "accept",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },

  // Seller declines escrow
  {
    inputs: [],
    name: "decline",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },

  // Buyer cancels expired escrow
  {
    inputs: [],
    name: "cancelExpired",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },

  // Seller confirms fulfillment
  {
    inputs: [],
    name: "confirmFulfillment",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },

  // Buyer releases funds to seller
  {
    inputs: [],
    name: "release",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },

  // Buyer opens dispute
  {
    inputs: [],
    name: "openDispute",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },

  // Party invites agent
  {
    inputs: [],
    name: "inviteAgent",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },

  // Party claims agent timeout (returns to DISPUTED)
  {
    inputs: [],
    name: "claimAgentTimeout",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },

  // Agent resolves dispute
  {
    inputs: [
      { internalType: "uint256", name: "buyerBps", type: "uint256" },
      { internalType: "uint256", name: "sellerBps", type: "uint256" },
    ],
    name: "agentResolve",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },

  // Party proposes split
  {
    inputs: [
      { internalType: "uint256", name: "buyerBps", type: "uint256" },
      { internalType: "uint256", name: "sellerBps", type: "uint256" },
    ],
    name: "proposeSplit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },

  // Party approves split proposal
  {
    inputs: [
      { internalType: "uint256", name: "expectedBuyerBps", type: "uint256" },
      { internalType: "uint256", name: "expectedSellerBps", type: "uint256" },
    ],
    name: "approveSplit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },

  // Seller refunds buyer
  {
    inputs: [],
    name: "sellerRefund",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },

  // ============================================
  // VIEW FUNCTIONS
  // ============================================

  {
    inputs: [],
    name: "buyer",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "seller",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "agent",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "token",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "amount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "state",
    outputs: [{ internalType: "enum EscrowTypes.EscrowState", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "termsHash",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "buyerProtectionTime",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "fundedAt",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "fulfilledAt",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;
