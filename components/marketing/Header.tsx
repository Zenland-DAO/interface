"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import NextLink from "next/link";
import { Logo, Button, BaseHeader } from "@/components/ui";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LanguageSwitcher } from "./LanguageSwitcher";

/**
 * Marketing Header Component
 *
 * Header for marketing pages using BaseHeader for consistent layout.
 * Includes logo, navigation links, theme toggle, language switcher, and CTA button.
 */

interface NavLink {
  labelKey: string;
  href: string;
}

const navLinks: NavLink[] = [
  { labelKey: "features", href: "#features" },
  { labelKey: "howItWorks", href: "#how-it-works" },
  { labelKey: "stats", href: "#stats" },
  { labelKey: "community", href: "#community" },
  { labelKey: "blog", href: "https://zen.land/blog" },
];

export function Header() {
  const t = useTranslations("common.nav");
  const tButtons = useTranslations("common.buttons");
  const tA11y = useTranslations("common.accessibility");
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close on Escape.
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [mobileMenuOpen]);

  // Prevent body scroll while drawer is open.
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <BaseHeader
        paddingX="px-6 sm:px-16 lg:px-24"
        leftSlot={<Logo size="sm" />}
        centerSlot={
          <nav className="flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-[var(--nav-text)] rounded-lg transition-colors hover:text-[var(--nav-text-hover)] hover:bg-[var(--state-hover)]"
              >
                {t(link.labelKey)}
              </a>
            ))}
          </nav>
        }
        rightSlot={
          <>
            <LanguageSwitcher />
            <ThemeToggle />
            {/* Hybrid routing: app routes must never get locale prefix */}
            <NextLink href="/app" className="hidden sm:block">
              <Button size="sm">{tButtons("app")}</Button>
            </NextLink>
            {/* Mobile Menu Button */}
            <button
              type="button"
              className="md:hidden p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--state-hover)] cursor-pointer transition-colors"
              aria-label={tA11y("openMenu")}
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(true)}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </>
        }
      />

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[60] md:hidden">
            {/* Backdrop */}
            <motion.button
              type="button"
              className="absolute inset-0 bg-black/50"
              aria-label={tA11y("closeMenu")}
              onClick={() => setMobileMenuOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />

            {/* Panel */}
            <motion.div
              className="absolute inset-y-0 right-0 w-[85%] max-w-xs bg-[var(--bg-primary)] border-l border-[var(--border-secondary)] shadow-2xl"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.25 }}
            >
              <div className="flex items-center justify-between px-6 h-16 border-b border-[var(--border-secondary)]">
                <Logo size="sm" />
                <button
                  type="button"
                  className="p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--state-hover)] transition-colors"
                  aria-label={tA11y("closeMenu")}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="p-4">
                <nav className="flex flex-col gap-1">
                  {navLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-4 py-3 text-base font-medium text-[var(--nav-text)] rounded-xl transition-colors hover:text-[var(--nav-text-hover)] hover:bg-[var(--state-hover)]"
                    >
                      {t(link.labelKey)}
                    </a>
                  ))}
                </nav>

                <div className="mt-6 flex flex-col gap-3">
                  {/* Hybrid routing: app routes must never get locale prefix */}
                  <NextLink href="/app" onClick={() => setMobileMenuOpen(false)}>
                    <Button size="md" className="w-full">
                      {tButtons("app")}
                    </Button>
                  </NextLink>
                </div>
                
                {/* Language Switcher in Mobile Menu */}
                <div className="mt-6 pt-6 border-t border-[var(--border-secondary)]">
                  <LanguageSwitcher variant="mobile" />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
