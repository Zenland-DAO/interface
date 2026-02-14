"use client";

import { useScrollAnimation } from "@/hooks";
import { Heading, Text, Container, Button } from "@/components/ui";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { 
  BookOpen, 
  Vote, 
  PieChart, 
  Eye,
  Zap,
  ArrowRight,
  ExternalLink
} from "lucide-react";

// Logos
import CreateDAOLogo from "@/src/assets/createdao.svg";

/**
 * OpenBook features
 */
const openBookFeatureKeys = ["vote", "monitor", "transparency"] as const;

const openBookFeatureIcons = {
  vote: Vote,
  monitor: PieChart,
  transparency: Eye,
} as const;

/**
 * CreateDAO features
 */
const createDAOFeatureKeys = ["governor", "token", "timelock"] as const;

export function OpenBookSection() {
  const t = useTranslations("marketing.openBook");

  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();
  const { ref: openBookRef, isVisible: openBookVisible } = useScrollAnimation();
  const { ref: createDAORef, isVisible: createDAOVisible } = useScrollAnimation();

  return (
    <section className="py-20 sm:py-24 lg:py-32 relative overflow-hidden">
      <Container className="relative">
        {/* Header */}
        <div
          ref={headerRef}
          className={`
            text-center mb-16 max-w-3xl mx-auto
            transition-all duration-1000 ease-out
            ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}
          `}
        >
          <Heading level={2} className="text-4xl sm:text-5xl lg:text-6xl mb-6">
            {t("title")}
          </Heading>
          <Text variant="lead" className="text-lg sm:text-xl text-[var(--text-secondary)]">
            {t("subtitle")}
          </Text>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* OpenBook Card */}
          <div
            ref={openBookRef}
            className={`
              relative bg-[var(--bg-secondary)]/30 border border-[var(--border-secondary)] rounded-[2rem] p-8 sm:p-10
              transition-all duration-1000 ease-out
              ${openBookVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}
            `}
          >
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                <BookOpen className="w-7 h-7 text-amber-500" />
              </div>
              <div>
                <h3 className="text-2xl font-bold tracking-tight">
                  {t("openBook.title")}
                </h3>
                <p className="text-sm text-[var(--text-tertiary)]">
                  {t("openBook.subtitle")}
                </p>
              </div>
            </div>

            <p className="text-[var(--text-secondary)] mb-8">
              {t("openBook.description")}
            </p>

            {/* Features */}
            <div className="space-y-4 mb-8">
              {openBookFeatureKeys.map((featureKey) => {
                const Icon = openBookFeatureIcons[featureKey];

                return (
                <div key={featureKey} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">{t(`openBook.features.${featureKey}.title`)}</h4>
                    <p className="text-sm text-[var(--text-tertiary)]">
                      {t(`openBook.features.${featureKey}.description`)}
                    </p>
                  </div>
                </div>
              );
              })}
            </div>

            {/* CTA */}
            <Link href="https://openbook.to/" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="w-full group bg-amber-500 hover:bg-amber-600 text-black">
                {t("openBook.cta")}
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>

          {/* CreateDAO Card */}
          <div
            ref={createDAORef}
            className={`
              relative bg-[var(--bg-secondary)]/30 border border-[var(--border-secondary)] rounded-[2rem] p-8 sm:p-10
              transition-all duration-1000 ease-out delay-200
              ${createDAOVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}
            `}
          >
            {/* Header with Logo */}
            <div className="flex items-center gap-4 mb-6">
              <Image
                src={CreateDAOLogo}
                alt="CreateDAO"
                width={180}
                height={40}
                className="object-contain dark:invert-0 invert"
              />
            </div>
            <p className="text-sm text-[var(--text-tertiary)] -mt-4 mb-6">
              {t("createDAO.subtitle")}
            </p>

            <p className="text-[var(--text-secondary)] mb-8">
              {t("createDAO.description")}
            </p>

            {/* One Transaction Highlight */}
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-6 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-5 h-5 text-purple-500" />
                <span className="font-semibold text-purple-400">{t("createDAO.highlight.title")}</span>
              </div>
              <ul className="space-y-2">
                {createDAOFeatureKeys.map((featureKey) => (
                  <li key={featureKey} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    {t(`createDAO.highlight.features.${featureKey}`)}
                  </li>
                ))}
              </ul>
            </div>

            {/* OpenBook Integration Note */}
            <div className="flex items-start gap-3 p-4 bg-[var(--bg-tertiary)]/50 rounded-xl mb-8">
              <BookOpen className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-[var(--text-tertiary)]">
                <span className="text-amber-500 font-medium">OpenBook</span> is built specifically for DAOs created with CreateDAO — 
                {t("createDAO.integration")}
              </p>
            </div>

            {/* CTA */}
            <Link href="https://createdao.org/" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="lg" className="w-full group border-purple-500/50 hover:bg-purple-500/10">
                {t("createDAO.cta")}
                <ExternalLink className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
