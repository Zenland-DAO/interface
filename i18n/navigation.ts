import { createNavigation } from 'next-intl/navigation';
import { locales, defaultLocale } from './config';

/**
 * Navigation utilities for localized routing
 * 
 * These replace Next.js built-in navigation components with
 * locale-aware versions that automatically handle URL prefixes.
 */
export const { Link, redirect, usePathname, useRouter } = createNavigation({
  locales,
  defaultLocale,
  localePrefix: 'as-needed', // Only add prefix for non-default locales
});
