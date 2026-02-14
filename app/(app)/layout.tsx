import { ReactNode } from "react";
import { cookies } from "next/headers";

import NextIntlProvider from "./_providers/NextIntlProvider";
import { normalizeLocale, LOCALE_COOKIE_NAME } from "@/i18n/cookie";

import { AppHeader, AppMobileNav, AppSidebar } from "@/components/app";
import { AnnouncementBanner } from "@/components/shared";

interface AppLayoutProps {
  children: ReactNode;
}

export default async function AppLayout({ children }: AppLayoutProps) {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get(LOCALE_COOKIE_NAME)?.value);

  // App routes are unlocalized in the URL, so we load messages based on the
  // stored preference (cookie). For now we reuse `common.json`.
  const messages = await requireCommonMessages(locale);

  return (
    <NextIntlProvider locale={locale} messages={messages}>
      {/* Beta Announcement Banner */}
      <AnnouncementBanner
        id="v2-beta-launch"
        badge="BETA"
        badgeVariant="primary"
        icon="🛠️"
        link={{
          href: "https://t.me/zenlandofficial",
          text: "Telegram",
          external: true,
        }}
        reappearAfterHours={24}
      >
        Zenland V2 is in Beta - help us make it better! Found a bug or have
        feedback?
      </AnnouncementBanner>

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
    </NextIntlProvider>
  );
}

async function requireCommonMessages(locale: string): Promise<Record<string, unknown>> {
  // Use explicit imports so bundlers can statically include the JSON files.
  switch (locale) {
    case "zh":
      return (await import("../../locales/zh/common.json")).default;
    case "es":
      return (await import("../../locales/es/common.json")).default;
    case "en":
    default:
      return (await import("../../locales/en/common.json")).default;
  }
}

