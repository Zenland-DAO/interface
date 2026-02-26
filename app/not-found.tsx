import Link from "next/link";
import { NextIntlClientProvider } from "next-intl";
import { Home, Rocket, BookOpen, Users, ArrowLeft } from "lucide-react";
import { Header, Footer } from "@/components/marketing";
import { Container } from "@/components/ui";

// Import English messages for the fallback 404 page
import enCommon from "@/locales/en/common.json";
import enMarketing from "@/locales/en/marketing.json";

/**
 * Global 404 Not Found Page
 * 
 * This is the fallback 404 page for routes outside of the [locale] scope.
 * For localized routes, see app/[locale]/not-found.tsx
 * 
 * Features:
 * - Uses the real Header and Footer components (DRY principle)
 * - Wraps with NextIntlClientProvider using English as default
 * - Clean, enterprise-grade design matching Zenland aesthetic
 * - Large gradient "404" with elegant typography
 * - Helpful navigation suggestions
 * - Full dark mode support
 * - Subtle animations for polish
 * - Responsive layout
 */

// Combine messages for the IntlProvider
const messages = {
  ...enCommon,
  ...enMarketing,
};

// Suggestion link configuration
const suggestions = [
  {
    href: "/",
    icon: Home,
    title: "Home",
    description: "Return to the main page",
  },
  {
    href: "/app",
    icon: Rocket,
    title: "Launch App",
    description: "Access the escrow platform",
  },
  {
    href: "https://docs.zen.land",
    icon: BookOpen,
    title: "Documentation",
    description: "Learn how Zenland works",
    external: true,
  },
  {
    href: "https://t.me/zenlounge",
    icon: Users,
    title: "Community",
    description: "Join our Telegram group",
    external: true,
  },
];

export default function NotFound() {
  return (
    <NextIntlClientProvider messages={messages} locale="en" timeZone="UTC">
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
                  404
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
                Oops! This page doesn&apos;t exist
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
                The page you&apos;re looking for may have been moved, deleted, or never existed. 
                Let&apos;s get you back on track.
              </p>

              {/* Primary CTA - Back to Home */}
              <div 
                className="mb-12 animate-slide-up"
                style={{ animationDelay: '300ms', animationFillMode: 'backwards' }}
              >
                <Link
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
                  Back to Home
                </Link>
              </div>

              {/* Suggestions Section */}
              <div 
                className="animate-slide-up"
                style={{ animationDelay: '400ms', animationFillMode: 'backwards' }}
              >
                <p className="text-sm text-[var(--text-tertiary)] mb-6 font-medium uppercase tracking-wider">
                  Here are some helpful links
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  {suggestions.map((item) => {
                    const Icon = item.icon;
                    const linkProps = item.external 
                      ? { target: "_blank" as const, rel: "noopener noreferrer" }
                      : {};
                    
                    return (
                      <Link
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
                            {item.title}
                            {item.external && (
                              <span className="ml-1 text-xs text-[var(--text-tertiary)]">↗</span>
                            )}
                          </h3>
                          <p className="text-sm text-[var(--text-secondary)]">
                            {item.description}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </Container>

          {/* Bottom decorative element */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--border-primary)] to-transparent" />
        </main>
        
        <Footer />
      </div>
    </NextIntlClientProvider>
  );
}
