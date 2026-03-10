"use client";

import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";
import { usePathname, useRouter as useIntlRouter } from "@/i18n/navigation";
import { locales, localeNames, localeFlags, type Locale, unlocalized } from "@/i18n/config";
import { Globe, Check } from "lucide-react";
import { useRouter as useNextRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

/**
 * LanguageSwitcher Component
 * 
 * Dropdown component for switching between available locales.
 * Uses next-intl navigation for locale-aware routing.
 */
export function LanguageSwitcher() {
  const locale = useLocale();
  const tA11y = useTranslations("common.accessibility");

  const intlRouter = useIntlRouter();
  const nextRouter = useNextRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // For hybrid routing, app routes should not carry locale prefixes.
  // `usePathname()` is locale-aware and can return values like `/es/app`.
  // We detect this and treat it as an unlocalized app route.
  const isUnlocalizedRoute = unlocalized.some((route) => {
    return pathname === route || pathname.startsWith(`${route}/`) || pathname.startsWith(`/${locale}${route}`) || pathname.startsWith(`/${locale}${route}/`);
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen]);

  const handleLocaleChange = (newLocale: Locale) => {
    // Marketing routes: use next-intl navigation to rewrite the URL.
    if (!isUnlocalizedRoute) {
      intlRouter.replace(pathname, { locale: newLocale });
      setIsOpen(false);
      return;
    }

    // App routes (hybrid): keep URL unprefixed.
    // We navigate to /:locale + current path which lets next-intl middleware
    // set the locale cookie, and then our proxy middleware redirects back to
    // the unprefixed app route.
    nextRouter.replace(`/${newLocale}${pathname}`);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[var(--nav-text)] transition-colors hover:text-[var(--nav-text-hover)] hover:bg-[var(--state-hover)]"
        aria-label={tA11y("changeLanguage")}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">{localeFlags[locale as Locale]}</span>
        <span className="hidden md:inline">{localeNames[locale as Locale]}</span>
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 top-full mt-2 w-40 py-2 bg-[var(--bg-primary)] border border-[var(--border-secondary)] rounded-xl shadow-lg z-50"
          role="listbox"
          aria-label={tA11y("selectLanguage")}
        >
          {locales.map((loc) => (
            <button
              key={loc}
              type="button"
              role="option"
              aria-selected={locale === loc}
              onClick={() => handleLocaleChange(loc)}
              className={`
                w-full flex items-center justify-between px-4 py-2 text-sm transition-colors
                ${locale === loc 
                  ? "bg-primary-500/10 text-primary-500" 
                  : "text-[var(--text-primary)] hover:bg-[var(--state-hover)]"
                }
              `}
            >
              <span className="flex items-center gap-2">
                <span>{localeFlags[loc]}</span>
                <span>{localeNames[loc]}</span>
              </span>
              {locale === loc && <Check className="w-4 h-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
