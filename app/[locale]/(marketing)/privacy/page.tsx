import { getTranslations } from "next-intl/server";
import { Container, Heading, Text } from "@/components/ui";
import { Link } from "@/i18n/navigation";

/**
 * Generate localized metadata
 */
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal.privacy" });

  return {
    title: t("meta.title"),
    description: t("meta.description"),
  };
}

/**
 * Privacy Policy Page
 * 
 * Privacy policy for Zenland DAO protocol - emphasizing no data collection.
 */
export default async function PrivacyPage() {
  const t = await getTranslations("legal.privacy");

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

          {/* No Data Collection - Highlighted */}
          <section className="mb-12 p-6 bg-success-500/10 rounded-lg border border-success-500/30">
            <Heading level={2} className="text-2xl mb-4 text-success-500">
              {t("sections.noCollection.title")}
            </Heading>
            <Text className="text-[var(--text-secondary)] leading-relaxed mb-4">
              {t("sections.noCollection.p1")}
            </Text>
            <ul className="list-disc list-inside text-[var(--text-secondary)] space-y-2 ml-4">
              <li>{t("sections.noCollection.items.noBackend")}</li>
              <li>{t("sections.noCollection.items.noDatabase")}</li>
              <li>{t("sections.noCollection.items.noAnalytics")}</li>
              <li>{t("sections.noCollection.items.noCookies")}</li>
              <li>{t("sections.noCollection.items.noTracking")}</li>
              <li>{t("sections.noCollection.items.noAccounts")}</li>
            </ul>
          </section>

          {/* Blockchain Data */}
          <section className="mb-12">
            <Heading level={2} className="text-2xl mb-4">
              {t("sections.blockchainData.title")}
            </Heading>
            <Text className="text-[var(--text-secondary)] leading-relaxed mb-4">
              {t("sections.blockchainData.p1")}
            </Text>
            <Text className="text-[var(--text-secondary)] leading-relaxed mb-4">
              {t("sections.blockchainData.p2")}
            </Text>
            <ul className="list-disc list-inside text-[var(--text-secondary)] space-y-2 ml-4">
              <li>{t("sections.blockchainData.items.address")}</li>
              <li>{t("sections.blockchainData.items.transactions")}</li>
              <li>{t("sections.blockchainData.items.escrowDetails")}</li>
              <li>{t("sections.blockchainData.items.termsHash")}</li>
            </ul>
            <Text className="text-[var(--text-secondary)] leading-relaxed mt-4">
              {t("sections.blockchainData.p3")}
            </Text>
          </section>

          {/* Wallet Connection */}
          <section className="mb-12">
            <Heading level={2} className="text-2xl mb-4">
              {t("sections.wallet.title")}
            </Heading>
            <Text className="text-[var(--text-secondary)] leading-relaxed mb-4">
              {t("sections.wallet.p1")}
            </Text>
            <Text className="text-[var(--text-secondary)] leading-relaxed">
              {t("sections.wallet.p2")}
            </Text>
          </section>

          {/* Local Storage */}
          <section className="mb-12">
            <Heading level={2} className="text-2xl mb-4">
              {t("sections.localStorage.title")}
            </Heading>
            <Text className="text-[var(--text-secondary)] leading-relaxed mb-4">
              {t("sections.localStorage.p1")}
            </Text>
            <ul className="list-disc list-inside text-[var(--text-secondary)] space-y-2 ml-4">
              <li>{t("sections.localStorage.items.preferences")}</li>
              <li>{t("sections.localStorage.items.theme")}</li>
              <li>{t("sections.localStorage.items.language")}</li>
            </ul>
            <Text className="text-[var(--text-secondary)] leading-relaxed mt-4">
              {t("sections.localStorage.p2")}
            </Text>
          </section>

          {/* Third Party Services */}
          <section className="mb-12">
            <Heading level={2} className="text-2xl mb-4">
              {t("sections.thirdParty.title")}
            </Heading>
            <Text className="text-[var(--text-secondary)] leading-relaxed mb-4">
              {t("sections.thirdParty.p1")}
            </Text>
            <ul className="list-disc list-inside text-[var(--text-secondary)] space-y-2 ml-4">
              <li>{t("sections.thirdParty.items.rpc")}</li>
              <li>{t("sections.thirdParty.items.wallets")}</li>
              <li>{t("sections.thirdParty.items.indexer")}</li>
            </ul>
            <Text className="text-[var(--text-secondary)] leading-relaxed mt-4">
              {t("sections.thirdParty.p2")}
            </Text>
          </section>

          {/* PDF Documents */}
          <section className="mb-12">
            <Heading level={2} className="text-2xl mb-4">
              {t("sections.pdf.title")}
            </Heading>
            <Text className="text-[var(--text-secondary)] leading-relaxed mb-4">
              {t("sections.pdf.p1")}
            </Text>
            <Text className="text-[var(--text-secondary)] leading-relaxed">
              {t("sections.pdf.p2")}
            </Text>
          </section>

          {/* Your Rights */}
          <section className="mb-12">
            <Heading level={2} className="text-2xl mb-4">
              {t("sections.rights.title")}
            </Heading>
            <Text className="text-[var(--text-secondary)] leading-relaxed mb-4">
              {t("sections.rights.p1")}
            </Text>
            <Text className="text-[var(--text-secondary)] leading-relaxed">
              {t("sections.rights.p2")}
            </Text>
          </section>

          {/* Children's Privacy */}
          <section className="mb-12">
            <Heading level={2} className="text-2xl mb-4">
              {t("sections.children.title")}
            </Heading>
            <Text className="text-[var(--text-secondary)] leading-relaxed">
              {t("sections.children.content")}
            </Text>
          </section>

          {/* Changes */}
          <section className="mb-12">
            <Heading level={2} className="text-2xl mb-4">
              {t("sections.changes.title")}
            </Heading>
            <Text className="text-[var(--text-secondary)] leading-relaxed">
              {t("sections.changes.content")}
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
              <Link href="/terms" className="text-primary-500 hover:text-primary-400 underline">
                {t("relatedLinks.terms")}
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
