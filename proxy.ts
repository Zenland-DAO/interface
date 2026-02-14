import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale, unlocalized } from './i18n/config';

/**
 * next-intl middleware for locale routing
 */
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed', // Only add prefix for non-default locales
});

/**
 * Main proxy function
 * 
 * Handles hybrid routing:
 * - Marketing pages: use locale prefix (/, /zh/, /es/)
 * - App pages: bypass locale routing, use stored preference
 */
export default function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // If a locale prefix is present (e.g. /es/app), strip it for hybrid routing checks.
  // This allows us to:
  // - redirect /:locale/(app routes) -> /(app routes)
  // - treat /(app routes) as unlocalized, even when a locale prefix is present
  const segments = pathname.split('/').filter(Boolean);
  const hasLocalePrefix = segments.length > 0 && (locales as readonly string[]).includes(segments[0]);
  const pathnameWithoutLocale = hasLocalePrefix
    ? `/${segments.slice(1).join('/')}` || '/'
    : pathname;

  // Check if this is an unlocalized route (app routes)
  const isUnlocalizedRoute = unlocalized.some((route) =>
    pathnameWithoutLocale === route || pathnameWithoutLocale.startsWith(`${route}/`)
  );

  // If user explicitly visits a locale-prefixed URL, let next-intl middleware
  // set the locale cookie first, then we enforce hybrid routing and redirect
  // to the unprefixed app route.
  //
  // This enables a LanguageSwitcher on app pages without doing any cookie
  // manipulation in the client.
  if (hasLocalePrefix && isUnlocalizedRoute) {
    const response = intlMiddleware(request);
    const url = request.nextUrl.clone();
    url.pathname = pathnameWithoutLocale;
    const redirectResponse = NextResponse.redirect(url);

    // Preserve the locale cookie that next-intl middleware sets.
    // (This is what makes locale preference work for unlocalized app routes.)
    const setCookie = response.headers.get('set-cookie');
    if (setCookie) {
      redirectResponse.headers.set('set-cookie', setCookie);
    }

    return redirectResponse;
  }

  // Skip locale handling for app routes
  if (isUnlocalizedRoute) {
    return NextResponse.next();
  }

  // Apply locale routing for marketing pages
  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except:
  // - API routes
  // - Static files
  // - Internal Next.js paths
  matcher: [
    // Match all pathnames except for
    // - API routes (/api/...)
    // - Static files (/_next/..., /favicon.ico, etc.)
    // - Public files (/images/..., /fonts/..., etc.)
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};
