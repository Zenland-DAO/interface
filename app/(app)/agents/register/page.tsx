"use client";

import Link from "next/link";
import { Card, CardBody } from "@/components/ui";
import { useTranslations } from "next-intl";
import { RegistrationForm } from "@/components/app/agents/register";

export default function AgentRegisterPage() {
  const t = useTranslations("agents.register");

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <Link
          href="/agents"
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] inline-flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t("backToAgents")}
        </Link>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mt-2">
          {t("title")}
        </h1>
        <p className="text-[var(--text-secondary)] mt-1">
          {t("description")}
        </p>
      </div>

      {/* Requirements Info */}
      <Card variant="outlined">
        <CardBody className="p-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-primary-100)] dark:bg-[var(--color-primary-900)] flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-[var(--color-primary-500)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-[var(--text-primary)]">
                {t("requirements.title")}
              </h3>
              <ul className="mt-2 space-y-1 text-sm text-[var(--text-secondary)]">
                <li className="flex items-start gap-2">
                  <span className="text-[var(--color-primary-500)]">•</span>
                  <span>{t("requirements.stablecoinStake")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--color-primary-500)]">•</span>
                  <span>{t("requirements.daoTokenStake")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--color-primary-500)]">•</span>
                  <span>{t("requirements.responseDeadline")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--color-primary-500)]">•</span>
                  <span>{t("requirements.fairResolution")}</span>
                </li>
              </ul>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Registration Form */}
      <RegistrationForm />

      {/* FAQ */}
      <Card variant="outlined">
        <CardBody className="p-5">
          <h3 className="font-semibold text-[var(--text-primary)] mb-4">
            {t("faq.title")}
          </h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-[var(--text-primary)]">
                {t("faq.mavQuestion")}
              </h4>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                {t("faq.mavAnswer")}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-[var(--text-primary)]">
                {t("faq.feesQuestion")}
              </h4>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                {t.rich("faq.feesAnswer", {
                  bold: (chunks) => <strong>{chunks}</strong>,
                })}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-[var(--text-primary)]">
                {t("faq.slashQuestion")}
              </h4>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                {t("faq.slashAnswer")}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-[var(--text-primary)]">
                {t("faq.withdrawQuestion")}
              </h4>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                {t("faq.withdrawAnswer")}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-[var(--text-primary)]">
                {t("faq.gaslessQuestion")}
              </h4>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                {t("faq.gaslessAnswer")}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
