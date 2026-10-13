import type { Metadata } from "next";
import { Inter, Figtree } from "next/font/google";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { LenisProvider } from "@/components/providers/LenisProvider";
import { Toaster } from "@/components/ui/Toaster";
import { GoogleAnalytics } from "@/components/layout/GoogleAnalytics";
import { GA_MEASUREMENT_ID } from "@/lib/analytics/gtag";
import { SITE_URL, SITE_NAME, OG_IMAGE } from "@/lib/seo";
import "@/app/globals.css";

const TWITTER_HANDLE = "@zenland_app";

// `subsets` only controls which files are preloaded: the CSS still declares every
// subset (Cyrillic, Vietnamese, ...) via unicode-range, so those pages fetch their
// glyphs on demand instead of every page preloading ~50 KB of fonts it never uses.
const inter = Inter({
  subsets: ["latin"],
  display: "optional",
  variable: "--font-inter",
});

const figtree = Figtree({
  subsets: ["latin"],
  display: "optional",
  variable: "--font-figtree",
  weight: ["400", "500", "600", "700"],
});

export const rootMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Zenland - Web3 Escrow Platform",
    template: `%s | ${SITE_NAME}`,
  },
  description: "Secure, trustless escrow for blockchain transactions. No intermediaries, just smart contracts protecting both parties on Ethereum.",
  keywords: [
    // Primary keywords (from Search Console high impressions)
    "crypto escrow",
    "blockchain escrow",
    "smart contract escrow",
    "cryptocurrency escrow",
    // Ethereum-focused (high impressions)
    "Ethereum escrow service",
    "eth escrow",
    "ethereum escrow",
    // Long-tail keywords
    "crypto escrow platform",
    "decentralized escrow",
    "Web3 escrow",
    "trustless escrow",
    "escrow smart contract",
    // Feature keywords (from high-impression queries)
    "dispute resolution",
    "payment protection",
    "secure crypto transactions",
    "cryptocurrency payment protection",
    // Service keywords
    "escrow services for crypto",
    "crypto escrow service",
    "on-chain escrow",
    "non-custodial escrow",
    // Brand keywords
    "Zenland",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/branding/favicon/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/branding/favicon/favicon.svg", type: "image/svg+xml" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "Zenland - Web3 Escrow Platform",
    description: "Secure, trustless escrow for blockchain transactions. No intermediaries, just smart contracts protecting both parties on Ethereum.",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    site: TWITTER_HANDLE,
    creator: TWITTER_HANDLE,
    title: "Zenland - Web3 Escrow Platform",
    description: "Secure, trustless escrow for blockchain transactions. No intermediaries, just smart contracts.",
    images: [OG_IMAGE.url],
  },
  // No `alternates` here: a canonical set in the root layout is inherited by every
  // page that doesn't override it, which pointed all pages at the homepage.
  // Each page declares its own canonical (see lib/seo.ts).
  category: "Finance",
};

/**
 * Shared <html> document for Zenland's two root layouts.
 *
 * Marketing pages (`app/[locale]/layout.tsx`) and the dApp (`app/(app)/layout.tsx`)
 * are separate root layouts so the dApp's wallet stack (wagmi, WalletConnect, Reown)
 * never ships to marketing pages. With a single `app/layout.tsx`, Next merges the
 * `(app)` layout's client manifest into the root group (route groups are stripped
 * from manifest group names), which made every marketing page load and execute the
 * dApp layout chunk. Both roots render this component so the document stays identical.
 */
export function RootDocument({
  locale,
  children,
}: Readonly<{
  locale: string;
  children: React.ReactNode;
}>) {
  return (
    <html lang={locale} translate="no" className={`${inter.variable} ${figtree.variable} notranslate`} suppressHydrationWarning>
      <head>
        {/* Prevent flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('zenland-theme');
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        {/* JSON-LD Structured Data for SEO & AI indexing */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": `${SITE_URL}/#organization`,
                  name: SITE_NAME,
                  url: SITE_URL,
                  logo: {
                    "@type": "ImageObject",
                    url: `${SITE_URL}/branding/logo/svg/logo-light.svg`,
                  },
                  sameAs: [
                    "https://x.com/zenland_app",
                    "https://github.com/zenland-dao",
                    "https://t.me/zenlandofficial",
                  ],
                  contactPoint: {
                    "@type": "ContactPoint",
                    contactType: "customer support",
                    url: `${SITE_URL}/#community`,
                  },
                },
                {
                  "@type": "WebSite",
                  "@id": `${SITE_URL}/#website`,
                  url: SITE_URL,
                  name: SITE_NAME,
                  description: "Secure, trustless escrow for blockchain transactions",
                  publisher: { "@id": `${SITE_URL}/#organization` },
                  inLanguage: ["en", "es", "zh", "pt", "ru", "id", "vi"],
                },
                {
                  "@type": "SoftwareApplication",
                  "@id": `${SITE_URL}/#application`,
                  name: "Zenland Escrow Platform",
                  description: "Decentralized escrow platform powered by smart contracts on Ethereum. No intermediaries, just secure, trustless transactions.",
                  applicationCategory: "FinanceApplication",
                  operatingSystem: "Web",
                  url: SITE_URL,
                  offers: {
                    "@type": "Offer",
                    price: "0",
                    priceCurrency: "USD",
                    description: "1% platform fee (min $0.50, max $50)",
                  },
                  featureList: [
                    "On-chain escrow with smart contracts",
                    "Dispute resolution with professional agents",
                    "Instant settlement",
                    "Non-custodial",
                    "Gas-free with NYKNYC wallet",
                  ],
                  screenshot: `${SITE_URL}/assets/og-image.png`,
                },
              ],
            }),
          }}
        />
      </head>
      <body className="min-h-screen antialiased">
        <ThemeProvider defaultTheme="light">
          <LenisProvider>
            {children}
          </LenisProvider>
          <Toaster />
        </ThemeProvider>
      </body>
      {/* Google Analytics - gtag.js loads once the page is idle (see GoogleAnalytics) */}
      <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />
    </html>
  );
}
