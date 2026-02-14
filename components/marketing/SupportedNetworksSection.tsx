"use client";

import { useScrollAnimation } from "@/hooks";
import { useTranslations } from "next-intl";
import { Heading, Text, Container } from "@/components/ui";

/**
 * Ethereum SVG icon
 */
const EthereumIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
    <path d="M11.944 17.97L4.58 13.62L11.943 24l7.37-10.38l-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354l7.365-4.35L12.056 0z" />
  </svg>
);

export function SupportedNetworksSection() {
  const t = useTranslations("marketing.networks");

  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();
  const { ref: contentRef, isVisible: contentVisible } = useScrollAnimation();

  return (
    <section className="py-20 sm:py-24 lg:py-32 relative overflow-hidden border-y border-[var(--border-secondary)]/50">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--bg-secondary)]/10 to-transparent" />

      <Container className="relative">
        <div
          ref={headerRef}
          className={`
            text-center mb-16
            transition-all duration-1000 ease-out
            ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}
          `}
        >
          <Heading level={2} className="text-4xl sm:text-5xl lg:text-6xl mb-6">
            {t("title")}
          </Heading>
          <Text variant="lead" className="max-w-2xl mx-auto text-lg sm:text-xl text-[var(--text-secondary)]">
            {t("subtitle")}
          </Text>
        </div>

        <div
          ref={contentRef}
          className={`
            flex items-center justify-center
            transition-all duration-1000 ease-out
            ${contentVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}
          `}
        >
          {/* Ethereum Featured Card */}
          <div className="flex flex-col items-center gap-6 p-12 rounded-3xl bg-[var(--bg-secondary)]/30 border border-[var(--border-secondary)]">
            <div className="w-20 h-20 text-[var(--text-primary)] opacity-90">
              <EthereumIcon />
            </div>
            <div className="text-center">
              <span className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
                {t("ethereum")}
              </span>
              <p className="text-sm text-[var(--text-tertiary)] mt-2">
                {t("mainnet")}
              </p>
            </div>
          </div>
        </div>

        <div
          className={`
            mt-16 text-center
            transition-all duration-1000 ease-out delay-700
            ${contentVisible ? "opacity-60" : "opacity-0"}
          `}
        >
          <Text className="text-[var(--text-tertiary)] uppercase tracking-widest text-xs font-bold">
            {t("tagline")}
          </Text>
        </div>
      </Container>
    </section>
  );
}
