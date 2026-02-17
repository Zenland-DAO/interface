/**
 * FAQ Configuration
 * 
 * Single source of truth for FAQ data used in:
 * - JSON-LD structured data (SEO)
 * - Visible FAQ section on marketing page
 * 
 * This follows DRY principles - define once, use everywhere.
 */

export interface FAQItem {
  /** Unique key for i18n translations */
  key: string;
  /** Default question (English) - used in JSON-LD */
  question: string;
  /** Default answer (English) - used in JSON-LD */
  answer: string;
}

/**
 * FAQ items ordered by SEO importance (based on Search Console impressions)
 * 
 * Target keywords included:
 * - crypto escrow, cryptocurrency escrow
 * - smart contract, blockchain
 * - dispute resolution
 * - payment protection, security
 * - Ethereum escrow
 */
export const FAQ_ITEMS: FAQItem[] = [
  {
    key: "whatIsCryptoEscrow",
    question: "What is crypto escrow and how does Zenland work?",
    answer: "Crypto escrow is a secure method for protecting cryptocurrency transactions between parties who don't fully trust each other. Zenland uses smart contracts on Ethereum to lock funds until predefined conditions are met, eliminating the need for traditional intermediaries.",
  },
  {
    key: "howToCreate",
    question: "How do I create an escrow on Zenland?",
    answer: "Creating an escrow is simple: connect your wallet, define the terms and conditions, set the payment amount, and deposit funds into the smart contract. No coding required - our visual interface guides you through the entire process in minutes.",
  },
  {
    key: "fundsProtection",
    question: "How are funds protected in blockchain escrow?",
    answer: "All escrow logic lives on the Ethereum blockchain. Funds are locked in audited smart contracts that are transparent, immutable, and verifiable by anyone. Zenland is non-custodial - we never have access to your funds.",
  },
  {
    key: "disputeResolution",
    question: "What happens if there is a dispute?",
    answer: "Professional agents are available to resolve disputes fairly and efficiently. If needed, cases can be escalated to the Zenland DAO for decentralized community resolution. Our dispute resolution system ensures both parties are treated fairly.",
  },
  {
    key: "fees",
    question: "What are Zenland's fees for escrow services?",
    answer: "Zenland charges just 1% platform fee with a minimum of $0.50 and maximum of $50 per transaction - the lowest in the crypto escrow market. No hidden costs, no monthly subscriptions. Using NYKNYC wallet makes transactions completely gas-free.",
  },
  {
    key: "supportedCrypto",
    question: "Which cryptocurrencies and networks does Zenland support?",
    answer: "Zenland currently operates on Ethereum mainnet, supporting ETH and ERC-20 tokens including USDC, USDT, and other popular stablecoins. We focus on Ethereum for its battle-tested security and wide adoption.",
  },
];

/**
 * Generate JSON-LD FAQPage schema from FAQ items
 * Used in root layout for SEO structured data
 */
export function generateFAQSchema(siteUrl: string) {
  return {
    "@type": "FAQPage",
    "@id": `${siteUrl}/#faq`,
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
