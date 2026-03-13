/**
 * i18n Configuration
 * 
 * Defines supported locales and default locale for the application.
 * Following the hybrid approach: marketing pages use URL-based routing,
 * app pages use stored preference.
 */

export const locales = ['en', 'zh', 'es', 'pt', 'ru', 'id', 'vi'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

/**
 * Locale display names for the language switcher
 */
export const localeNames: Record<Locale, string> = {
  en: 'English',
  zh: '中文',
  es: 'Español',
  pt: 'Português',
  ru: 'Русский',
  id: 'Indonesia',
  vi: 'Tiếng Việt',
};

/**
 * Locale flags/icons for visual identification
 */
export const localeFlags: Record<Locale, string> = {
  en: '🇺🇸',
  zh: '🇨🇳',
  es: '🇪🇸',
  pt: '🇧🇷',
  ru: '🇷🇺',
  id: '🇮🇩',
  vi: '🇻🇳',
};

/**
 * Routes that should NOT have locale prefix (app routes)
 * These routes will use stored user preference instead
 */
export const unlocalized = [
  '/app',
  '/agents',
  '/escrows',
  '/dashboard',
  '/settings',
  '/verify',
];

/**
 * Check if a pathname should be localized
 */
export function shouldLocalize(pathname: string): boolean {
  return !unlocalized.some(route => pathname.startsWith(route));
}
