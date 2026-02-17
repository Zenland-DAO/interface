import type { Metadata } from "next";
import { Inter, Figtree } from "next/font/google";
import { cookies } from "next/headers";
import { ThemeProvider, AppProviders, LenisProvider, WalletModalProvider } from "@/components/providers";
import { ConnectWalletModal } from "@/components/wallet";
import { Toaster } from "@/components/ui/Toaster";
import { cookieToInitialState } from "wagmi";
import { config } from "@/lib/wagmi/config";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const figtree = Figtree({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-figtree",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Zenland - Blockchain Escrow Platform",
  description: "Secure, decentralized escrow services powered by smart contracts",
  keywords: ["escrow", "blockchain", "smart contracts", "cryptocurrency", "secure payments"],
  authors: [{ name: "Zenland" }],
  icons: {
    icon: [
      { url: "/branding/favicon/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/branding/favicon/favicon.svg", type: "image/svg+xml" },
    ],
  },
  openGraph: {
    title: "Zenland - Blockchain Escrow Platform",
    description: "Secure, decentralized escrow services powered by smart contracts",
    type: "website",
  },
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
  
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const initialState = cookieToInitialState(config, cookieHeader);

  return (
    <html lang={locale} translate="no" className={`${inter.variable} ${figtree.variable} notranslate`} suppressHydrationWarning>
      <head>
        {/* Preconnect to critical origins for faster LCP */}
        <link rel="preconnect" href="https://api.zen.land" />
        <link rel="preconnect" href="https://api.web3modal.org" />
        <link rel="dns-prefetch" href="https://api.zen.land" />
        <link rel="dns-prefetch" href="https://api.web3modal.org" />
        
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
      </head>
      <body className="min-h-screen antialiased">
        <ThemeProvider defaultTheme="light">
          <AppProviders initialState={initialState}>
            <WalletModalProvider>
              <LenisProvider>
                {children}
              </LenisProvider>
              <ConnectWalletModal />
              <Toaster />
            </WalletModalProvider>
          </AppProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
