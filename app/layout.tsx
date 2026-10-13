import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Inter, Figtree } from "next/font/google";
import { getLocale } from "next-intl/server";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { LenisProvider } from "@/components/providers/LenisProvider";
import { Toaster } from "@/components/ui/Toaster";
import { GA_MEASUREMENT_ID } from "@/lib/analytics/gtag";
import { SITE_URL, SITE_NAME, OG_IMAGE } from "@/lib/seo";
import "./globals.css";

const TWITTER_HANDLE = "@zenland_app";

const inter = Inter({
  subsets: ["latin", "cyrillic", "cyrillic-ext", "vietnamese"],
  display: "optional",
  variable: "--font-inter",
});

const figtree = Figtree({
  subsets: ["latin", "latin-ext"],
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // The root layout sits above the [locale] segment, so params never carry the
  // locale. next-intl resolves it from the middleware (marketing routes) and
  // falls back to the default locale for unlocalized app routes.
  const locale = await getLocale();

  return (
    <html lang={locale} translate="no" className={`${inter.variable} ${figtree.variable} notranslate`} suppressHydrationWarning>
      <head>
        {/* Preconnect to Sentry ingestion endpoint to save ~300ms on first error report */}
        <link rel="preconnect" href="https://o4510866637258752.ingest.de.sentry.io" />
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
      {/* Google Analytics - @next/third-parties handles optimized loading & auto page view tracking */}
      <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />
    </html>
  );
}
