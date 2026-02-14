import { getTranslations } from "next-intl/server";
import { Container, Heading, Text } from "@/components/ui";
import { Link } from "@/i18n/navigation";

/**
 * Generate localized metadata
 */
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal.terms" });

  return {
    title: t("meta.title"),
    description: t("meta.description"),
  };
}

/**
 * Terms of Service Page
 * 
 * General terms and conditions for using the Zenland DAO protocol.
 */
export default async function TermsPage() {
  const t = await getTranslations("legal.terms");

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

          {/* Acceptance */}
          <section className="mb-12">
            <Heading level={2} className="text-2xl mb-4">
              {t("sections.acceptance.title")}
            </Heading>
            <Text className="text-[var(--text-secondary)] leading-relaxed">
              {t("sections.acceptance.content")}
            </Text>
          </section>

          {/* Eligibility */}
          <section className="mb-12">
            <Heading level={2} className="text-2xl mb-4">
              {t("sections.eligibility.title")}
            </Heading>
            <Text className="text-[var(--text-secondary)] leading-relaxed">
              {t("sections.eligibility.content")}
            </Text>
          </section>

          {/* Nature of Protocol */}
          <section className="mb-12">
            <Heading level={2} className="text-2xl mb-4">
              {t("sections.nature.title")}
            </Heading>
            <Text className="text-[var(--text-secondary)] leading-relaxed mb-4">
              {t("sections.nature.p1")}
            </Text>
            <Text className="text-[var(--text-secondary)] leading-relaxed mb-4">
              {t("sections.nature.p2")}
            </Text>
            <Text className="text-[var(--text-secondary)] leading-relaxed">
              {t("sections.nature.p3")}
            </Text>
          </section>

          {/* Smart Contracts */}
          <section className="mb-12">
            <Heading level={2} className="text-2xl mb-4">
              {t("sections.smartContracts.title")}
            </Heading>
            <Text className="text-[var(--text-secondary)] leading-relaxed mb-4">
              {t("sections.smartContracts.p1")}
            </Text>
            <Text className="text-[var(--text-secondary)] leading-relaxed">
              {t("sections.smartContracts.p2")}
            </Text>
          </section>

          {/* User Responsibilities */}
          <section className="mb-12">
            <Heading level={2} className="text-2xl mb-4">
              {t("sections.userResponsibilities.title")}
            </Heading>
            <Text className="text-[var(--text-secondary)] leading-relaxed mb-4">
              {t("sections.userResponsibilities.intro")}
            </Text>
            <ul className="list-disc list-inside text-[var(--text-secondary)] space-y-2 ml-4">
              <li>{t("sections.userResponsibilities.items.wallet")}</li>
              <li>{t("sections.userResponsibilities.items.keys")}</li>
              <li>{t("sections.userResponsibilities.items.taxes")}</li>
              <li>{t("sections.userResponsibilities.items.laws")}</li>
              <li>{t("sections.userResponsibilities.items.counterparty")}</li>
            </ul>
          </section>

          {/* Prohibited Uses */}
          <section className="mb-12">
            <Heading level={2} className="text-2xl mb-4">
              {t("sections.prohibitedUses.title")}
            </Heading>
            <Text className="text-[var(--text-secondary)] leading-relaxed mb-4">
              {t("sections.prohibitedUses.intro")}
            </Text>
            <ul className="list-disc list-inside text-[var(--text-secondary)] space-y-2 ml-4">
              <li>{t("sections.prohibitedUses.items.illegal")}</li>
              <li>{t("sections.prohibitedUses.items.fraud")}</li>
              <li>{t("sections.prohibitedUses.items.launder")}</li>
              <li>{t("sections.prohibitedUses.items.terrorism")}</li>
              <li>{t("sections.prohibitedUses.items.sanctions")}</li>
              <li>{t("sections.prohibitedUses.items.minors")}</li>
              <li>{t("sections.prohibitedUses.items.exploit")}</li>
            </ul>
          </section>

          {/* Dispute Resolution */}
          <section className="mb-12">
            <Heading level={2} className="text-2xl mb-4">
              {t("sections.disputes.title")}
            </Heading>
            <Text className="text-[var(--text-secondary)] leading-relaxed mb-4">
              {t("sections.disputes.p1")}
            </Text>
            <Text className="text-[var(--text-secondary)] leading-relaxed mb-4">
              {t("sections.disputes.p2")}
            </Text>
            <Text className="text-[var(--text-secondary)] leading-relaxed">
              {t("sections.disputes.p3")}
            </Text>
          </section>

          {/* Locked Escrows */}
          <section className="mb-12">
            <Heading level={2} className="text-2xl mb-4">
              {t("sections.lockedEscrows.title")}
            </Heading>
            <Text className="text-[var(--text-secondary)] leading-relaxed mb-4">
              {t("sections.lockedEscrows.p1")}
            </Text>
            <Text className="text-[var(--text-secondary)] leading-relaxed font-semibold">
              {t("sections.lockedEscrows.warning")}
            </Text>
          </section>

          {/* Fees */}
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

          {/* Risks */}
          <section className="mb-12">
            <Heading level={2} className="text-2xl mb-4">
              {t("sections.risks.title")}
            </Heading>
            <Text className="text-[var(--text-secondary)] leading-relaxed mb-4">
              {t("sections.risks.intro")}
            </Text>
            <ul className="list-disc list-inside text-[var(--text-secondary)] space-y-2 ml-4">
              <li>{t("sections.risks.items.volatility")}</li>
              <li>{t("sections.risks.items.bugs")}</li>
              <li>{t("sections.risks.items.loss")}</li>
              <li>{t("sections.risks.items.regulatory")}</li>
              <li>{t("sections.risks.items.network")}</li>
            </ul>
          </section>

          {/* Disclaimer */}
          <section className="mb-12 p-6 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)]">
            <Heading level={2} className="text-2xl mb-4">
              {t("sections.disclaimer.title")}
            </Heading>
            <Text className="text-[var(--text-secondary)] leading-relaxed mb-4 uppercase font-semibold">
              {t("sections.disclaimer.p1")}
            </Text>
            <Text className="text-[var(--text-secondary)] leading-relaxed">
              {t("sections.disclaimer.p2")}
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

          {/* Modifications */}
          <section className="mb-12">
            <Heading level={2} className="text-2xl mb-4">
              {t("sections.modifications.title")}
            </Heading>
            <Text className="text-[var(--text-secondary)] leading-relaxed">
              {t("sections.modifications.content")}
            </Text>
          </section>

          {/* Governing Law */}
          <section className="mb-12">
            <Heading level={2} className="text-2xl mb-4">
              {t("sections.governingLaw.title")}
            </Heading>
            <Text className="text-[var(--text-secondary)] leading-relaxed">
              {t("sections.governingLaw.content")}
            </Text>
          </section>

          {/* Contact */}
          <section className="mb-12">
            <Heading level={2} className="text-2xl mb-4">
              {t("sections.contact.title")}
            </Heading>
            <Text className="text-[var(--text-secondary)] leading-relaxed">
              {t("sections.contact.content")}
            </Text>
          </section>

          {/* Related Links */}
          <section className="pt-8 border-t border-[var(--border-primary)]">
            <Text className="text-[var(--text-secondary)] mb-4">
              {t("relatedLinks.title")}
            </Text>
            <div className="flex flex-wrap gap-4">
              <Link href="/privacy" className="text-primary-500 hover:text-primary-400 underline">
                {t("relatedLinks.privacy")}
              </Link>
              <Link href="/agent-tos" className="text-primary-500 hover:text-primary-400 underline">
                {t("relatedLinks.agentTos")}
              </Link>
            </div>
          </section>
        </div>
      </Container>
    </div>
  );
}
