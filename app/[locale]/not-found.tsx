"use client";

import { useTranslations } from "next-intl";
import NextLink from "next/link";
import { Home, Rocket, BookOpen, Users, ArrowLeft } from "lucide-react";
import { Header, Footer } from "@/components/marketing";
import { Container } from "@/components/ui";

/**
 * Localized 404 Not Found Page
 * 
 * A beautiful, professional 404 page with header, footer, and suggested navigation links.
 * Features:
 * - Clean, enterprise-grade design matching Zenland aesthetic
 * - Large gradient "404" with elegant typography
 * - Helpful navigation suggestions
 * - Full dark mode support
 * - Subtle animations for polish
 * - Responsive layout
 * - Full i18n support
 */

export default function NotFound() {
  const t = useTranslations("common.notFound");

  // Suggestion link configuration with translations
  const suggestions = [
    {
      href: "/",
      icon: Home,
      titleKey: "suggestions.home.title",
      descriptionKey: "suggestions.home.description",
    },
    {
      href: "/app",
      icon: Rocket,
      titleKey: "suggestions.app.title",
      descriptionKey: "suggestions.app.description",
    },
    {
      href: "https://docs.zen.land",
      icon: BookOpen,
      titleKey: "suggestions.docs.title",
      descriptionKey: "suggestions.docs.description",
      external: true,
    },
    {
      href: "https://t.me/zenlounge",
      icon: Users,
      titleKey: "suggestions.community.title",
      descriptionKey: "suggestions.community.description",
      external: true,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 -z-10">
          {/* Gradient orbs */}
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl" />
          {/* Grid pattern */}
          <div 
            className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(var(--color-neutral-500) 1px, transparent 1px),
                                linear-gradient(90deg, var(--color-neutral-500) 1px, transparent 1px)`,
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        <Container size="md" className="py-16 sm:py-20 lg:py-24">
          <div className="text-center">
            {/* 404 Code with gradient */}
            <div className="relative mb-8 animate-fade-in">
              <span 
                className="
                  text-[8rem] sm:text-[10rem] lg:text-[12rem] 
                  font-heading font-bold 
                  leading-none tracking-tighter
                  text-transparent bg-clip-text 
                  bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600
                  dark:from-primary-300 dark:via-primary-400 dark:to-primary-500
                  select-none
                "
                style={{
                  textShadow: '0 20px 60px oklch(0.60 0.18 235 / 0.15)',
                }}
              >
                {t("code")}
              </span>
              {/* Decorative line */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-primary-500/50 to-transparent rounded-full" />
            </div>

            {/* Heading */}
            <h1 
              className="
                text-2xl sm:text-3xl lg:text-4xl 
                font-heading font-bold 
                text-[var(--text-primary)] 
                mb-4
                animate-slide-up
              "
              style={{ animationDelay: '100ms', animationFillMode: 'backwards' }}
            >
              {t("heading")}
            </h1>

            {/* Description */}
            <p 
              className="
                text-base sm:text-lg 
                text-[var(--text-secondary)] 
                max-w-md mx-auto mb-12
                animate-slide-up
              "
              style={{ animationDelay: '200ms', animationFillMode: 'backwards' }}
            >
              {t("description")}
            </p>

            {/* Primary CTA - Back to Home */}
            <div 
              className="mb-12 animate-slide-up"
              style={{ animationDelay: '300ms', animationFillMode: 'backwards' }}
            >
              <NextLink
                href="/"
                className="
                  inline-flex items-center gap-2
                  px-6 py-3 
                  bg-primary-500 text-white
                  hover:bg-white hover:text-primary-600
                  dark:bg-primary-500 dark:hover:bg-white dark:hover:text-primary-600
                  rounded-xl
                  font-medium text-base
                  shadow-sm hover:shadow-lg
                  transition-all duration-300 ease-out
                  hover:scale-[1.02] active:scale-[0.98]
                  group
                "
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                {t("backHome")}
              </NextLink>
            </div>

            {/* Suggestions Section */}
            <div 
              className="animate-slide-up"
              style={{ animationDelay: '400ms', animationFillMode: 'backwards' }}
            >
              <p className="text-sm text-[var(--text-tertiary)] mb-6 font-medium uppercase tracking-wider">
                {t("suggestions.title")}
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {suggestions.map((item) => {
                  const Icon = item.icon;
                  const linkProps = item.external 
                    ? { target: "_blank" as const, rel: "noopener noreferrer" }
                    : {};
                  
                  return (
                    <NextLink
                      key={item.href}
                      href={item.href}
                      {...linkProps}
                      className="
                        group
                        flex items-start gap-4 p-4
                        bg-white/50 dark:bg-white/5
                        hover:bg-white dark:hover:bg-white/10
                        border border-[var(--border-primary)]
                        hover:border-primary-500/30
                        rounded-xl
                        transition-all duration-300 ease-out
                        hover:shadow-md hover:scale-[1.02]
                        text-left
                      "
                    >
                      <div 
                        className="
                          flex-shrink-0 
                          w-10 h-10 
                          flex items-center justify-center
                          bg-primary-500/10 dark:bg-primary-500/20
                          group-hover:bg-primary-500 
                          rounded-lg
                          transition-colors duration-300
                        "
                      >
                        <Icon 
                          className="
                            w-5 h-5 
                            text-primary-500 
                            group-hover:text-white
                            transition-colors duration-300
                          " 
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[var(--text-primary)] group-hover:text-primary-500 transition-colors">
                          {t(item.titleKey)}
                          {item.external && (
                            <span className="ml-1 text-xs text-[var(--text-tertiary)]">↗</span>
                          )}
                        </h3>
                        <p className="text-sm text-[var(--text-secondary)]">
                          {t(item.descriptionKey)}
                        </p>
                      </div>
                    </NextLink>
                  );
                })}
              </div>
            </div>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
