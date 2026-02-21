"use client";

import { useScrollAnimation } from "@/hooks";
import { Heading, Text, Container } from "@/components/ui";
// import { Button } from "@/components/ui"; // Temporarily unused - for DAOForum
import Link from "next/link";
// import Image from "next/image"; // Temporarily unused - for DAOForum
import { useTranslations } from "next-intl";
import { 
  MessageCircle, 
  // Scale, 
  // FileText, 
  // Code, 
  // UserPlus,
  ArrowRight,
  // ExternalLink
} from "lucide-react";

// Logos
// import DAOForumLogo from "@/src/assets/daoforum.png";

/**
 * DAOForum features - detailed breakdown of what users can do
 * TEMPORARILY COMMENTED OUT FOR BHW LAUNCH - will be restored later
 */
// const daoForumFeatureKeys = ["escalate", "proposals", "developer", "onboarding"] as const;

// const daoForumFeatureIcons = {
//   escalate: Scale,
//   proposals: FileText,
//   developer: Code,
//   onboarding: UserPlus,
// } as const;

// X (Twitter) icon component
const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export function CommunitySection() {
  const t = useTranslations("marketing.community");

  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();
  const { ref: contentRef, isVisible: contentVisible } = useScrollAnimation();

  return (
    <section id="community" className="py-20 sm:py-24 lg:py-32 relative overflow-hidden bg-gradient-to-b from-transparent via-[var(--bg-secondary)]/20 to-transparent">
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

        <div
          ref={contentRef}
          className={`
            grid grid-cols-1 lg:grid-cols-2 gap-8
            transition-all duration-1000 ease-out delay-200
            ${contentVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}
          `}
        >
          {/* Telegram Card */}
          <Link
            href="https://t.me/zenlandofficial"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative bg-[var(--bg-secondary)]/30 border border-[var(--border-secondary)] rounded-[2rem] p-8 transition-all duration-300 hover:border-[#0088cc]/50 hover:bg-[#0088cc]/5 flex flex-col"
          >
            {/* Icon */}
            <div className="w-16 h-16 rounded-2xl bg-[#0088cc]/10 flex items-center justify-center mb-6 group-hover:bg-[#0088cc]/20 transition-colors">
              <MessageCircle className="w-8 h-8 text-[#0088cc]" />
            </div>

            <h3 className="text-2xl font-bold mb-3 tracking-tight group-hover:text-[#0088cc] transition-colors">
              {t("telegram.title")}
            </h3>
            <p className="text-[var(--text-secondary)] mb-6 flex-1">
              {t("telegram.description")}
            </p>

            <div className="flex items-center gap-2 text-[var(--text-tertiary)] group-hover:text-[#0088cc] transition-colors font-semibold">
              {t("telegram.cta")}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* X (Twitter) Card */}
          <Link
            href="https://x.com/zenland_app"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative bg-[var(--bg-secondary)]/30 border border-[var(--border-secondary)] rounded-[2rem] p-8 transition-all duration-300 hover:border-[var(--text-primary)]/50 hover:bg-[var(--text-primary)]/5 flex flex-col"
          >
            {/* Icon */}
            <div className="w-16 h-16 rounded-2xl bg-[var(--text-primary)]/10 flex items-center justify-center mb-6 group-hover:bg-[var(--text-primary)]/20 transition-colors">
              <XIcon className="w-8 h-8 text-[var(--text-primary)]" />
            </div>

            <h3 className="text-2xl font-bold mb-3 tracking-tight group-hover:text-[var(--text-primary)] transition-colors">
              {t("twitter.title")}
            </h3>
            <p className="text-[var(--text-secondary)] mb-6 flex-1">
              {t("twitter.description")}
            </p>

            <div className="flex items-center gap-2 text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)] transition-colors font-semibold">
              {t("twitter.cta")}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* DAOForum Card - TEMPORARILY COMMENTED OUT FOR BHW LAUNCH */}
          {/* <div className="relative bg-[var(--bg-secondary)]/30 border border-[var(--border-secondary)] rounded-[2rem] p-8 transition-all duration-300 hover:border-primary-500/50">
            <div className="flex items-start justify-between mb-6">
              <Image
                src={DAOForumLogo}
                alt="DAOForum"
                width={160}
                height={40}
                className="object-contain dark:invert-0 invert"
              />
              <span className="text-xs font-semibold uppercase tracking-wider text-primary-500 bg-primary-500/10 px-3 py-1.5 rounded-full">
                {t("daoForum.badge")}
              </span>
            </div>

            <h3 className="text-2xl font-bold mb-3 tracking-tight">
              {t("daoForum.title")}
            </h3>
            <p className="text-[var(--text-secondary)] mb-8">
              {t("daoForum.description")}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {daoForumFeatureKeys.map((featureKey) => {
                const Icon = daoForumFeatureIcons[featureKey];

                return (
                <div key={featureKey} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-[var(--text-secondary)]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">{t(`daoForum.features.${featureKey}.title`)}</h4>
                    <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">
                      {t(`daoForum.features.${featureKey}.description`)}
                    </p>
                  </div>
                </div>
              );
              })}
            </div>

            <Link href="https://daoforum.org/threads/zenland-dao-official-governance-proposals-thread.34/" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="lg" className="w-full group">
                {t("daoForum.cta")}
                <ExternalLink className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Button>
            </Link>
          </div> */}
        </div>
      </Container>
    </section>
  );
}
