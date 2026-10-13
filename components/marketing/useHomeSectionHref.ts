"use client";

import { usePathname } from "@/i18n/navigation";

/**
 * Header/footer section links (`#features`, `#how-it-works`, ...) point at sections of
 * the landing page. On any other marketing page (e.g. /usdt-escrow) a bare `#hash`
 * would resolve against that page instead, so prefix it with the homepage path.
 * Use the result with the locale-aware `Link` from `@/i18n/navigation`, which adds the
 * locale prefix (`/ru/#features`). Non-anchor hrefs are returned unchanged.
 */
export function useHomeSectionHref() {
  // Locale-less pathname: "/" on the landing page in every locale.
  const pathname = usePathname();

  return (href: string) => (href.startsWith("#") && pathname !== "/" ? `/${href}` : href);
}
