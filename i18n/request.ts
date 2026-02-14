import { getRequestConfig } from 'next-intl/server';
import { locales, defaultLocale, type Locale } from './config';

/**
 * Server-side request configuration for next-intl
 * 
 * This function is called for every request and returns the messages
 * for the current locale. Messages are loaded from the locales directory.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  // Get the locale from the request (set by middleware)
  let locale = await requestLocale;

  // Validate that the incoming locale is valid
  if (!locale || !locales.includes(locale as Locale)) {
    locale = defaultLocale;
  }

  return {
    locale,
    // Ensure deterministic date/time formatting across environments.
    // Without this, next-intl falls back to the server runtime time zone
    // which can cause SSR/CSR markup mismatches.
    timeZone: 'UTC',
    messages: {
      // Load common translations (nav, footer, buttons)
      ...(await import(`../locales/${locale}/common.json`)).default,
      // Load marketing translations
      ...(await import(`../locales/${locale}/marketing.json`)).default,
      // Load legal translations (terms, privacy, agent-tos)
      ...(await import(`../locales/${locale}/legal.json`)).default,
    },
  };
});
