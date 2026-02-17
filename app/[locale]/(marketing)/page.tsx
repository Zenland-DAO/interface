import { getTranslations } from "next-intl/server";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button, Heading, Text, Container } from "@/components/ui";
import { Link } from "@/i18n/navigation";
import { 
  FeaturesSection, 
  SupportedNetworksSection, 
  HeroEscrowCard, 
  WalletSupportSection, 
  BentoGridSection,
  CommunitySection,
  OpenBookSection,
  FAQSection
} from "@/components/marketing";
import { ProtocolStatsSectionClient } from "@/components/marketing/ProtocolStatsSectionClient";
import { AnimateOnScroll } from "@/hooks";

/** Site URL for SEO */
const SITE_URL = "https://zen.land";

/** Locale to OpenGraph locale mapping */
const OG_LOCALES: Record<string, string> = {
  en: "en_US",
  es: "es_ES",
  zh: "zh_CN",
};

/**
 * Generate localized metadata with proper hreflang and canonical URLs
 */
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "marketing.meta" });

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
      languages: {
        "en": `${SITE_URL}/en`,
        "es": `${SITE_URL}/es`,
        "zh": `${SITE_URL}/zh`,
        "x-default": `${SITE_URL}/en`,
      },
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: `${SITE_URL}/${locale}`,
      locale: OG_LOCALES[locale] || "en_US",
      alternateLocale: Object.values(OG_LOCALES).filter((l) => l !== OG_LOCALES[locale]),
    },
  };
}

/**
 * Landing Page (Localized)
 * 
 * The main marketing page with all sections.
 * Uses server-side translations for static content.
 */
export default async function LandingPage() {
  const t = await getTranslations("marketing");
  const tCommon = await getTranslations("common");

  // Trust indicators - key stats (translated)
  const stats = [
    { value: t("hero.stats.fee.value"), label: t("hero.stats.fee.label") },
    { value: t("hero.stats.onchain.value"), label: t("hero.stats.onchain.label") },
    { value: t("hero.stats.available.value"), label: t("hero.stats.available.label") },
  ];

  // How it works steps (translated)
  const howItWorksSteps = [
    { 
      step: t("howItWorks.steps.create.step"), 
      title: t("howItWorks.steps.create.title"), 
      description: t("howItWorks.steps.create.description") 
    },
    { 
      step: t("howItWorks.steps.work.step"), 
      title: t("howItWorks.steps.work.title"), 
      description: t("howItWorks.steps.work.description") 
    },
    { 
      step: t("howItWorks.steps.release.step"), 
      title: t("howItWorks.steps.release.title"), 
      description: t("howItWorks.steps.release.description") 
    },
  ];

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      {/* Hero Section - Body stays in centered container */}
      <section className="relative py-16 sm:py-20 lg:py-28 overflow-hidden">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content - Text */}
            <AnimateOnScroll animation="fade-up" className="order-2 lg:order-1">
              {/* Eyebrow - stays within container */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 rounded-full bg-primary-500/10 border border-primary-500/20">
                <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                <span className="text-xs font-semibold uppercase tracking-wider text-primary-500">
                  {t("hero.badge")}
                </span>
              </div>

              {/* Hero Title - Aligns with header logo */}
              <h1 className="
                font-heading
                text-[clamp(2.5rem,5vw,4.5rem)]
                font-bold
                leading-[1.05]
                tracking-[-0.02em]
                mb-6
              ">
                {t("hero.title.line1")}{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600">
                  {t("hero.title.highlight")}
                </span>
                <br />
                {t("hero.title.line2")}
              </h1>

              {/* Description */}
              <p className="text-lg text-[var(--text-secondary)] mb-8 max-w-lg leading-relaxed">
                {t("hero.description")}
              </p>
              {/* CTA Buttons */}
              <div className="flex flex-row flex-wrap sm:flex-row items-start gap-3 mb-10">
                <Link href="/app" className="shrink-0">
                  <Button size="lg" className="group whitespace-nowrap">
                    {tCommon("buttons.app")}
                    <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="#features" className="shrink-0">
                  <Button variant="outline" size="lg" className="whitespace-nowrap">
                    {tCommon("buttons.learnMore")}
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 sm:gap-6">
                {stats.map((stat) => (
                  <div key={stat.label} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success-500" />
                    <span className="text-sm">
                      <span className="font-semibold">{stat.value}</span>{" "}
                      <span className="text-[var(--text-tertiary)]">{stat.label}</span>
                    </span>
                  </div>
                ))}
              </div>
            </AnimateOnScroll>

            {/* Right Content - Visual */}
            <div className="order-1 lg:order-2 relative">
              {/* Decorative gradient background */}
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary-500/20 via-transparent to-transparent rounded-3xl blur-3xl scale-125" />

              <HeroEscrowCard />
            </div>
          </div>
        </Container>
      </section>

      {/* Protocol Stats Section - Live on-chain data (client-side rendered) */}
      <ProtocolStatsSectionClient />

      {/* Features Section - Animated */}
      <FeaturesSection />

      {/* Bento Grid Value Props */}
      <BentoGridSection />

      {/* Wallet Support Section - NYKNYC Spotlight */}
      <WalletSupportSection />

      {/* Supported Networks Section - Ethereum Only */}
      <SupportedNetworksSection />

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 sm:py-24 lg:py-32">
        <Container>
          <AnimateOnScroll animation="fade-up" className="mb-16 lg:mb-24 max-w-3xl mx-auto text-center">
            <Heading level={2} className="mb-6">
              {t("howItWorks.title")}
            </Heading>
            <Text variant="lead" className="text-xl sm:text-2xl">
              {t("howItWorks.subtitle")}
            </Text>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
            {howItWorksSteps.map((item, index) => (
              <AnimateOnScroll key={item.step} animation="fade-up" delay={index * 150} className="relative text-center sm:text-left">
                <div className="text-8xl font-bold text-[var(--text-disabled)]/20 mb-6 font-heading">
                  {item.step}
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold mb-4 tracking-tight">{item.title}</h3>
                <p className="text-lg text-[var(--text-secondary)] leading-relaxed">{item.description}</p>
              </AnimateOnScroll>
            ))}
          </div>
        </Container>
      </section>

      {/* Community Section - Telegram + DAOForum */}
      <CommunitySection />

      {/* OpenBook + CreateDAO Section */}
      <OpenBookSection />

      {/* FAQ Section - SEO optimized with visible content matching JSON-LD */}
      <FAQSection />

      {/* CTA Section */}
      <section className="py-20 sm:py-24 lg:py-32 bg-gradient-to-br from-primary-500/5 via-transparent to-transparent">
        <Container size="md">
          <AnimateOnScroll animation="scale-in" className="text-center">
            <Heading level={2} className="mb-6 text-4xl sm:text-5xl lg:text-6xl">
              {t("cta.title")}
            </Heading>
            <Text variant="lead" className="mb-12 text-xl sm:text-2xl">
              {t("cta.subtitle")}
            </Text>
            <Link href="/app">
              <Button size="lg" className="px-10 py-7 text-lg rounded-2xl group">
                {tCommon("buttons.app")}
                <ArrowRight className="ml-3 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </AnimateOnScroll>
        </Container>
      </section>
    </div>
  );
}
