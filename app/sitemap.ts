import type { MetadataRoute } from "next";

/**
 * Generate sitemap.xml for search engine crawlers
 *
 * Includes:
 * - Marketing pages with localized versions (hreflang)
 * - Public app pages (agents, escrow creation, verification)
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://zen.land";
  const locales = ["en", "es", "zh"];
  const defaultLocale = "en";

  // Marketing pages (relative to locale, with localization support)
  const marketingPages = [
    { path: "", priority: 1.0, changeFrequency: "weekly" as const },
    { path: "/privacy", priority: 0.3, changeFrequency: "yearly" as const },
    { path: "/terms", priority: 0.3, changeFrequency: "yearly" as const },
    { path: "/agent-tos", priority: 0.3, changeFrequency: "yearly" as const },
  ];

  // Public app pages (no localization)
  const appPages = [
    { path: "/agents", priority: 0.8, changeFrequency: "daily" as const },
    {
      path: "/agents/register",
      priority: 0.7,
      changeFrequency: "monthly" as const,
    },
    {
      path: "/escrows/new",
      priority: 0.8,
      changeFrequency: "monthly" as const,
    },
    { path: "/verify", priority: 0.6, changeFrequency: "monthly" as const },
  ];

  const sitemap: MetadataRoute.Sitemap = [];

  // Generate entries for each marketing page in each locale
  for (const page of marketingPages) {
    // Create alternates for hreflang
    const alternates: Record<string, string> = {};
    for (const locale of locales) {
      alternates[locale] = `${baseUrl}/${locale}${page.path}`;
    }
    alternates["x-default"] = `${baseUrl}/${defaultLocale}${page.path}`;

    // Add entry for each locale
    for (const locale of locales) {
      sitemap.push({
        url: `${baseUrl}/${locale}${page.path}`,
        lastModified: new Date(),
        changeFrequency: page.changeFrequency,
        priority: page.priority,
        alternates: {
          languages: alternates,
        },
      });
    }
  }

  // Add root URL (redirects to default locale)
  sitemap.push({
    url: baseUrl,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 1.0,
  });

  // Add public app pages (no localization)
  for (const page of appPages) {
    sitemap.push({
      url: `${baseUrl}${page.path}`,
      lastModified: new Date(),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    });
  }

  return sitemap;
}
