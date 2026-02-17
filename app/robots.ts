import type { MetadataRoute } from "next";

/**
 * Generate robots.txt for search engine crawlers
 *
 * Public pages allowed:
 * - Marketing pages (/, /privacy, /terms, /agent-tos) with locales
 * - Public app pages (/agents, /agents/register, /escrows/new, /verify)
 *
 * Private pages disallowed:
 * - User-specific pages (/dashboard, /escrows, /settings, /app)
 * - API routes, Next.js internals
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://zen.land";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/agents",
          "/agents/register",
          "/escrows/new",
          "/verify",
        ],
        disallow: [
          "/app/", // Exclude the app dashboard
          "/dashboard", // User dashboard (requires wallet)
          "/escrows", // User escrow list (except /escrows/new)
          "/settings", // User settings (requires wallet)
          "/agents/dashboard", // Agent dashboard (requires wallet)
          "/agents/edit", // Agent edit (requires wallet)
          "/api/", // Exclude API routes
          "/_next/", // Exclude Next.js internals
          "/private/", // Exclude any private pages
        ],
      },
      {
        // Specific rules for Googlebot
        userAgent: "Googlebot",
        allow: ["/", "/agents", "/agents/register", "/escrows/new", "/verify"],
        disallow: [
          "/app/",
          "/dashboard",
          "/escrows",
          "/settings",
          "/agents/dashboard",
          "/agents/edit",
          "/api/",
        ],
      },
      {
        // Allow AI crawlers for better AI indexing
        userAgent: ["GPTBot", "ChatGPT-User", "Google-Extended", "Anthropic"],
        allow: ["/", "/agents", "/agents/register", "/escrows/new", "/verify"],
        disallow: [
          "/app/",
          "/dashboard",
          "/escrows",
          "/settings",
          "/agents/dashboard",
          "/agents/edit",
          "/api/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
