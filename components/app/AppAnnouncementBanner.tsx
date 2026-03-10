"use client";

import { useTranslations } from "next-intl";
import { AnnouncementBanner } from "@/components/shared";

/**
 * App-specific announcement banner that reads content from i18n.
 *
 * Wraps the generic AnnouncementBanner with translated strings
 * so the server layout doesn't need to hardcode text.
 */
export function AppAnnouncementBanner() {
  const t = useTranslations("app.announcement");

  return (
    <AnnouncementBanner
      id="v2-beta-launch"
      badge="BETA"
      badgeVariant="primary"
      icon="🛠️"
      link={{
        href: "https://t.me/zenlandofficial",
        text: t("telegramLink"),
        external: true,
      }}
      reappearAfterHours={24}
    >
      {t("betaMessage")}
    </AnnouncementBanner>
  );
}
