"use client";

import { useTranslations } from "next-intl";
import { useScrollAnimation } from "@/hooks";
import { Heading, Text, Container, FeatureCard } from "@/components/ui";
import { Lock, ShieldCheck, Zap } from "lucide-react";

const featureKeys = ["onchain", "disputes", "instant"] as const;
const featureIcons = {
  onchain: Lock,
  disputes: ShieldCheck,
  instant: Zap,
};
const featureColors = {
  onchain: "primary" as const,
  disputes: "success" as const,
  instant: "warning" as const,
};

export function FeaturesSection() {
  const t = useTranslations("marketing.features");
  
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();
  const { ref: card1Ref, isVisible: card1Visible } = useScrollAnimation();
  const { ref: card2Ref, isVisible: card2Visible } = useScrollAnimation();
  const { ref: card3Ref, isVisible: card3Visible } = useScrollAnimation();

  const cardRefs = [
    { ref: card1Ref, isVisible: card1Visible },
    { ref: card2Ref, isVisible: card2Visible },
    { ref: card3Ref, isVisible: card3Visible },
  ];

  return (
    <section id="features" className="py-16 sm:py-20 lg:py-24 bg-[var(--bg-secondary)]">
      <Container>
        {/* Centered header */}
        <div
          ref={headerRef}
          className={`
            mb-16 lg:mb-24 max-w-3xl mx-auto text-center
            transition-all duration-700 ease-out
            ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
          `}
        >
          <Heading level={2} className="mb-6">
            {t("title")}
          </Heading>
          <Text variant="lead" className="text-xl sm:text-2xl">
            {t("subtitle")}
          </Text>
        </div>

        {/* Feature cards with staggered animation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {featureKeys.map((key, index) => {
            const Icon = featureIcons[key];
            return (
              <div
                key={key}
                ref={cardRefs[index].ref}
                className={`
                  transition-all duration-700 ease-out
                  ${cardRefs[index].isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
                `}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <FeatureCard
                  icon={Icon}
                  iconColor={featureColors[key]}
                  title={t(`items.${key}.title`)}
                  description={t(`items.${key}.description`)}
                />
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
