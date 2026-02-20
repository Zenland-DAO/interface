import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Inter, Figtree } from "next/font/google";
import { ThemeProvider, LenisProvider } from "@/components/providers";
import { Toaster } from "@/components/ui/Toaster";
import { GA_MEASUREMENT_ID } from "@/lib/analytics/gtag";
import { generateFAQSchema } from "@/lib/constants/faq";
import "./globals.css";

/** Site configuration for SEO */
const SITE_URL = "https://zen.land";
const SITE_NAME = "Zenland";
const TWITTER_HANDLE = "@zenland_app";

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

export const metadata: Metadata = {
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
    images: [
      {
        url: "/assets/og-image.png",
        width: 1200,
        height: 630,
        alt: "Zenland - Secure Web3 Escrow Platform",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: TWITTER_HANDLE,
    creator: TWITTER_HANDLE,
    title: "Zenland - Web3 Escrow Platform",
    description: "Secure, trustless escrow for blockchain transactions. No intermediaries, just smart contracts.",
    images: ["/assets/og-image.png"],
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      "en": `${SITE_URL}/en`,
      "es": `${SITE_URL}/es`,
      "zh": `${SITE_URL}/zh`,
      "x-default": `${SITE_URL}/en`,
    },
  },
  category: "Finance",
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params?: Promise<{ locale?: string }>;
}>) {
  // Get locale from params if available (for localized routes)
  const resolvedParams = params ? await params : { locale: undefined };
  const locale = resolvedParams.locale || "en";

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
                    url: `${SITE_URL}/branding/logo.svg`,
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
                  inLanguage: ["en", "es", "zh"],
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
                // FAQ schema - uses shared data from faq.ts (DRY)
                generateFAQSchema(SITE_URL),
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
      {/* Google Analytics - @next/third-parties handles optimized loading & auto page view tracking */}
      <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />
    </html>
  );
}
