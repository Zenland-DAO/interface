/**
 * FAQ Configuration
 * 
 * Single source of truth for FAQ data used in:
 * - JSON-LD structured data (SEO), rendered on the localized landing page
 * - Visible FAQ section on marketing page
 * 
 * Question/answer text lives in the locale files (marketing.faq.items.<key>),
 * so the JSON-LD always matches the visible content in every language.
 */

export interface FAQItem {
  /** Unique key for i18n translations */
  key: string;
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
  { key: "whatIsCryptoEscrow" },
  { key: "howToCreate" },
  { key: "fundsProtection" },
  { key: "disputeResolution" },
  { key: "fees" },
  { key: "supportedCrypto" },
];

/**
 * Generate JSON-LD FAQPage schema from FAQ items
 * @param pageUrl - Absolute URL of the page that renders the FAQ
 * @param t - Translator scoped to `marketing.faq.items`
 */
export function generateFAQSchema(pageUrl: string, t: (key: string) => string) {
  return {
    "@type": "FAQPage",
    "@id": `${pageUrl}#faq`,
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: t(`${item.key}.question`),
      acceptedAnswer: {
        "@type": "Answer",
        text: t(`${item.key}.answer`),
      },
    })),
  };
}
