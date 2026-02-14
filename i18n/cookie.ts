import { defaultLocale, locales, type Locale } from "./config";

// next-intl uses this cookie name by default. We keep it explicit so both the
// middleware and client-side language switcher can agree.
export const LOCALE_COOKIE_NAME = "NEXT_LOCALE";

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}

export function normalizeLocale(value: string | undefined | null): Locale {
  return isLocale(value) ? value : defaultLocale;
}
