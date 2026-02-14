import { getTranslations } from "next-intl/server";
import { Container, Heading, Text } from "@/components/ui";
import { Link } from "@/i18n/navigation";
import { AlertTriangle, Shield, Scale, Coins, Clock, Ban } from "lucide-react";

/**
 * Generate localized metadata
 */
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal.agentTos" });

  return {
    title: t("meta.title"),
    description: t("meta.description"),
  };
}

/**
 * Agent Terms & Conditions Page
 * 
 * Specific terms for agents participating in the Zenland DAO dispute resolution system.
 */
export default async function AgentTosPage() {
  const t = await getTranslations("legal.agentTos");

  return (
    <div className="py-16 sm:py-20 lg:py-24">
      <Container size="md">
        {/* Header */}
        <div className="mb-12 text-center">
          <Heading level={1} className="mb-4">
            {t("title")}
          </Heading>
          <Text className="text-[var(--text-secondary)]">
            {t("lastUpdated")}: {t("date")}
          </Text>
        </div>

        {/* Important Notice Banner */}
        <div className="mb-12 p-6 bg-warning-500/10 rounded-lg border border-warning-500/30">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-warning-500 shrink-0 mt-1" />
            <div>
              <Heading level={3} className="text-lg mb-2 text-warning-500">
                {t("importantNotice.title")}
              </Heading>
              <Text className="text-[var(--text-secondary)] leading-relaxed">
                {t("importantNotice.content")}
              </Text>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-invert prose-lg max-w-none">
          {/* Introduction */}
          <section className="mb-12">
            <Heading level={2} className="text-2xl mb-4">
              {t("sections.introduction.title")}
            </Heading>
            <Text className="text-[var(--text-secondary)] leading-relaxed mb-4">
              {t("sections.introduction.p1")}
            </Text>
            <Text className="text-[var(--text-secondary)] leading-relaxed">
              {t("sections.introduction.p2")}
            </Text>
          </section>

          {/* Role of Agent */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Scale className="w-6 h-6 text-primary-500" />
              <Heading level={2} className="text-2xl">
                {t("sections.role.title")}
              </Heading>
            </div>
            <Text className="text-[var(--text-secondary)] leading-relaxed mb-4">
              {t("sections.role.p1")}
            </Text>
            <ul className="list-disc list-inside text-[var(--text-secondary)] space-y-2 ml-4">
              <li>{t("sections.role.items.neutral")}</li>
              <li>{t("sections.role.items.review")}</li>
              <li>{t("sections.role.items.decide")}</li>
              <li>{t("sections.role.items.timely")}</li>
            </ul>
          </section>

          {/* Staking Requirements */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Coins className="w-6 h-6 text-primary-500" />
              <Heading level={2} className="text-2xl">
                {t("sections.staking.title")}
              </Heading>
            </div>
            <Text className="text-[var(--text-secondary)] leading-relaxed mb-4">
              {t("sections.staking.p1")}
            </Text>
            <Text className="text-[var(--text-secondary)] leading-relaxed mb-4">
              {t("sections.staking.p2")}
            </Text>
            <ul className="list-disc list-inside text-[var(--text-secondary)] space-y-2 ml-4">
              <li>{t("sections.staking.items.stablecoin")}</li>
              <li>{t("sections.staking.items.daoToken")}</li>
              <li>{t("sections.staking.items.mav")}</li>
              <li>{t("sections.staking.items.cooldown")}</li>
            </ul>
          </section>

          {/* Response Time Requirements */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-6 h-6 text-primary-500" />
              <Heading level={2} className="text-2xl">
                {t("sections.responseTime.title")}
              </Heading>
            </div>
            <Text className="text-[var(--text-secondary)] leading-relaxed mb-4">
              {t("sections.responseTime.p1")}
            </Text>
            <Text className="text-[var(--text-secondary)] leading-relaxed">
              {t("sections.responseTime.p2")}
            </Text>
          </section>

          {/* Slashing - CRITICAL SECTION */}
          <section className="mb-12 p-6 bg-error-500/10 rounded-lg border border-error-500/30">
            <div className="flex items-center gap-3 mb-4">
              <Ban className="w-6 h-6 text-error-500" />
              <Heading level={2} className="text-2xl text-error-500">
                {t("sections.slashing.title")}
              </Heading>
            </div>
            <Text className="text-[var(--text-secondary)] leading-relaxed mb-4 font-semibold">
              {t("sections.slashing.warning")}
            </Text>
            <Text className="text-[var(--text-secondary)] leading-relaxed mb-4">
              {t("sections.slashing.p1")}
            </Text>
            <Text className="text-[var(--text-secondary)] leading-relaxed mb-4">
              {t("sections.slashing.p2")}
            </Text>
            <div className="bg-[var(--bg-primary)] p-4 rounded-lg mb-4">
              <Heading level={3} className="text-lg mb-2">
                {t("sections.slashing.process.title")}
              </Heading>
              <ol className="list-decimal list-inside text-[var(--text-secondary)] space-y-2 ml-4">
                <li>{t("sections.slashing.process.step1")}</li>
                <li>{t("sections.slashing.process.step2")}</li>
                <li>{t("sections.slashing.process.step3")}</li>
                <li>{t("sections.slashing.process.step4")}</li>
                <li>{t("sections.slashing.process.step5")}</li>
              </ol>
            </div>
            <Text className="text-[var(--text-secondary)] leading-relaxed">
              {t("sections.slashing.consequences")}
            </Text>
          </section>

          {/* Prohibited Conduct */}
          <section className="mb-12">
            <Heading level={2} className="text-2xl mb-4">
              {t("sections.prohibited.title")}
            </Heading>
            <Text className="text-[var(--text-secondary)] leading-relaxed mb-4">
              {t("sections.prohibited.intro")}
            </Text>
            <ul className="list-disc list-inside text-[var(--text-secondary)] space-y-2 ml-4">
              <li>{t("sections.prohibited.items.bribery")}</li>
              <li>{t("sections.prohibited.items.collusion")}</li>
              <li>{t("sections.prohibited.items.conflict")}</li>
              <li>{t("sections.prohibited.items.bias")}</li>
              <li>{t("sections.prohibited.items.negligence")}</li>
              <li>{t("sections.prohibited.items.manipulation")}</li>
            </ul>
          </section>

          {/* Agent Fees */}
          <section className="mb-12">
            <Heading level={2} className="text-2xl mb-4">
              {t("sections.fees.title")}
            </Heading>
            <Text className="text-[var(--text-secondary)] leading-relaxed mb-4">
              {t("sections.fees.p1")}
            </Text>
            <Text className="text-[var(--text-secondary)] leading-relaxed">
              {t("sections.fees.p2")}
            </Text>
          </section>

          {/* DAO Governance */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-primary-500" />
              <Heading level={2} className="text-2xl">
                {t("sections.daoGovernance.title")}
              </Heading>
            </div>
            <Text className="text-[var(--text-secondary)] leading-relaxed mb-4">
              {t("sections.daoGovernance.p1")}
            </Text>
            <Text className="text-[var(--text-secondary)] leading-relaxed mb-4">
              {t("sections.daoGovernance.p2")}
            </Text>
            <ul className="list-disc list-inside text-[var(--text-secondary)] space-y-2 ml-4">
              <li>{t("sections.daoGovernance.items.parameters")}</li>
              <li>{t("sections.daoGovernance.items.slash")}</li>
              <li>{t("sections.daoGovernance.items.stake")}</li>
              <li>{t("sections.daoGovernance.items.fees")}</li>
            </ul>
          </section>

          {/* Independent Contractor */}
          <section className="mb-12">
            <Heading level={2} className="text-2xl mb-4">
              {t("sections.independent.title")}
            </Heading>
            <Text className="text-[var(--text-secondary)] leading-relaxed mb-4">
              {t("sections.independent.p1")}
            </Text>
            <Text className="text-[var(--text-secondary)] leading-relaxed">
              {t("sections.independent.p2")}
            </Text>
          </section>

          {/* Disclaimer */}
          <section className="mb-12 p-6 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)]">
            <Heading level={2} className="text-2xl mb-4">
              {t("sections.disclaimer.title")}
            </Heading>
            <Text className="text-[var(--text-secondary)] leading-relaxed uppercase font-semibold">
              {t("sections.disclaimer.content")}
            </Text>
          </section>

          {/* Limitation of Liability */}
          <section className="mb-12 p-6 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)]">
            <Heading level={2} className="text-2xl mb-4">
              {t("sections.liability.title")}
            </Heading>
            <Text className="text-[var(--text-secondary)] leading-relaxed uppercase font-semibold">
              {t("sections.liability.content")}
            </Text>
          </section>

          {/* Indemnification */}
          <section className="mb-12">
            <Heading level={2} className="text-2xl mb-4">
              {t("sections.indemnification.title")}
            </Heading>
            <Text className="text-[var(--text-secondary)] leading-relaxed">
              {t("sections.indemnification.content")}
            </Text>
          </section>

          {/* Termination */}
          <section className="mb-12">
            <Heading level={2} className="text-2xl mb-4">
              {t("sections.termination.title")}
            </Heading>
            <Text className="text-[var(--text-secondary)] leading-relaxed mb-4">
              {t("sections.termination.p1")}
            </Text>
            <Text className="text-[var(--text-secondary)] leading-relaxed">
              {t("sections.termination.p2")}
            </Text>
          </section>

          {/* Modifications */}
          <section className="mb-12">
            <Heading level={2} className="text-2xl mb-4">
              {t("sections.modifications.title")}
            </Heading>
            <Text className="text-[var(--text-secondary)] leading-relaxed">
              {t("sections.modifications.content")}
            </Text>
          </section>

          {/* Agreement */}
          <section className="mb-12">
            <Heading level={2} className="text-2xl mb-4">
              {t("sections.agreement.title")}
            </Heading>
            <Text className="text-[var(--text-secondary)] leading-relaxed">
              {t("sections.agreement.content")}
            </Text>
          </section>

          {/* Related Links */}
          <section className="pt-8 border-t border-[var(--border-primary)]">
            <Text className="text-[var(--text-secondary)] mb-4">
              {t("relatedLinks.title")}
            </Text>
            <div className="flex flex-wrap gap-4">
              <Link href="/terms" className="text-primary-500 hover:text-primary-400 underline">
                {t("relatedLinks.terms")}
              </Link>
              <Link href="/privacy" className="text-primary-500 hover:text-primary-400 underline">
                {t("relatedLinks.privacy")}
              </Link>
              <a 
                href="https://daoforum.org/threads/zenland-dao-official-governance-proposals-thread.34/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary-500 hover:text-primary-400 underline"
              >
                {t("relatedLinks.daoForum")}
              </a>
            </div>
          </section>
        </div>
      </Container>
    </div>
  );
}
