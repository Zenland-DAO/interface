import { locales, defaultLocale } from "@/i18n/config";

/**
 * Shared SEO configuration.
 *
 * Next.js metadata is shallow-merged per key: a page that sets `openGraph` or
 * `alternates` replaces the parent's object entirely. Pages therefore build
 * these from the helpers below instead of relying on the root layout.
 */

export const SITE_URL = "https://zen.land";
export const SITE_NAME = "Zenland";

export const OG_IMAGE = {
  url: "/assets/og-image.png",
  width: 1200,
  height: 630,
  alt: "Zenland - Secure Web3 Escrow Platform",
  type: "image/png",
};

/** Locale to OpenGraph locale mapping */
export const OG_LOCALES: Record<string, string> = {
  en: "en_US",
  es: "es_ES",
  zh: "zh_CN",
  pt: "pt_BR",
  ru: "ru_RU",
  id: "id_ID",
  vi: "vi_VN",
};

/**
 * Absolute URL of a localized marketing page.
 * English uses the unprefixed URL (localePrefix: 'as-needed').
 */
export function localizedUrl(locale: string, path = ""): string {
  return locale === defaultLocale ? `${SITE_URL}${path}` : `${SITE_URL}/${locale}${path}`;
}

/** Canonical + hreflang alternates for a page that exists in every locale. */
export function localizedAlternates(locale: string, path = "") {
  const languages: Record<string, string> = {};
  for (const l of locales) {
    languages[l] = localizedUrl(l, path);
  }
  languages["x-default"] = localizedUrl(defaultLocale, path);

  return { canonical: localizedUrl(locale, path), languages };
}

/**
 * Metadata for an unlocalized page (app routes and English-only pages):
 * self-referencing canonical plus OpenGraph/Twitter cards with the shared image.
 */
export function pageMetadata({
  path,
  title,
  description,
}: {
  path: string;
  title: string;
  description: string;
}) {
  const url = `${SITE_URL}${path}`;
  // The root title template only applies to <title>, so social titles get the brand here.
  const socialTitle = `${title} | ${SITE_NAME}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website" as const,
      url,
      siteName: SITE_NAME,
      title: socialTitle,
      description,
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image" as const,
      title: socialTitle,
      description,
      images: [OG_IMAGE.url],
    },
  };
}
