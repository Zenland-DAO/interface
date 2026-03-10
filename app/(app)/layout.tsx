import { ReactNode } from "react";
import { cookies } from "next/headers";
import { cookieToInitialState } from "wagmi";

import NextIntlProvider from "./_providers/NextIntlProvider";
import { normalizeLocale, LOCALE_COOKIE_NAME } from "@/i18n/cookie";
import { config } from "@/lib/wagmi/config";
import { AppProviders, WalletModalProvider } from "@/components/providers";
import { ConnectWalletModal } from "@/components/wallet";

import { AppHeader, AppMobileNav, AppSidebar, AppAnnouncementBanner } from "@/components/app";

interface AppLayoutProps {
  children: ReactNode;
}

export default async function AppLayout({ children }: AppLayoutProps) {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get(LOCALE_COOKIE_NAME)?.value);

  // Get cookie header for wagmi initial state hydration
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  const initialState = cookieToInitialState(config, cookieHeader);

  // App routes are unlocalized in the URL, so we load messages based on the
  // stored preference (cookie). Load common + app-specific namespaces.
  const messages = await requireAppMessages(locale);

  return (
    <AppProviders initialState={initialState}>
      <WalletModalProvider>
        <NextIntlProvider locale={locale} messages={messages}>
          {/* Beta Announcement Banner */}
          <AppAnnouncementBanner />

          <div className="min-h-screen bg-[var(--bg-primary)]">
            {/* Desktop Sidebar - Fixed position */}
            <div className="hidden lg:block fixed inset-y-0 left-0 w-64 border-r border-[var(--border-secondary)] bg-[var(--bg-secondary)] z-40">
              <AppSidebar />
            </div>

            {/* Main Content Area - Offset by sidebar width */}
            <div className="lg:ml-64 flex flex-col min-h-screen">
              <AppHeader />

              {/* Page Content */}
              <main className="flex-1 p-4 lg:p-8 pb-24 lg:pb-8">
                {children}
              </main>
            </div>

            {/* Mobile bottom tabs */}
            <AppMobileNav />
          </div>
          
          <ConnectWalletModal />
        </NextIntlProvider>
      </WalletModalProvider>
    </AppProviders>
  );
}

/**
 * Load all message namespaces needed by the app interface.
 *
 * Uses explicit static imports so the bundler can include the JSON files.
 * Each namespace is spread into a flat object that next-intl consumes.
 */
async function requireAppMessages(locale: string): Promise<Record<string, unknown>> {
  const load = async (loc: string) => {
    const [common, app, dashboard, settings, escrows, agents, verify] = await Promise.all([
      import(`../../locales/${loc}/common.json`),
      import(`../../locales/${loc}/app.json`),
      import(`../../locales/${loc}/dashboard.json`),
      import(`../../locales/${loc}/settings.json`),
      import(`../../locales/${loc}/escrows.json`),
      import(`../../locales/${loc}/agents.json`),
      import(`../../locales/${loc}/verify.json`),
    ]);
    return {
      ...common.default,
      ...app.default,
      ...dashboard.default,
      ...settings.default,
      ...escrows.default,
      ...agents.default,
      ...verify.default,
    };
  };

  switch (locale) {
    case "zh":
      return load("zh");
    case "es":
      return load("es");
    case "en":
    default:
      return load("en");
  }
}

