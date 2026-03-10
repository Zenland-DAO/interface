"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button, Card, CardBody } from "@/components/ui";
import { PageHeader } from "@/components/shared";
import { DashboardStats, RecentEscrows } from "@/components/app/dashboard";

/**
 * Dashboard Page
 * 
 * Shows an overview of escrow activity with:
 * - Stats grid (with toggle for personal/global view)
 * - Recent escrows
 * - Quick actions
 * 
 * Features:
 * - When wallet not connected: Shows global protocol stats
 * - When wallet connected: Shows personal stats by default, can toggle to global
 */
export default function DashboardPage() {
  const t = useTranslations("dashboard");

  return (
    <div className="space-y-8">
      <PageHeader
        title={t("title")}
        description={t("description")}
        actions={
          <Link href="/escrows/new">
            <Button>{t("createEscrow")}</Button>
          </Link>
        }
      />

      {/* Stats Grid with Toggle */}
      <DashboardStats />

      {/* Recent Escrows */}
      <RecentEscrows />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card variant="outlined">
          <CardBody className="p-6">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              {t("quickActions.becomeAgent.title")}
            </h3>
            <p className="text-[var(--text-secondary)] text-sm mb-4">
              {t("quickActions.becomeAgent.description")}
            </p>
            <Link href="/agents/register">
              <Button variant="outline" size="sm">
                {t("quickActions.becomeAgent.cta")}
              </Button>
            </Link>
          </CardBody>
        </Card>
        <Card variant="outlined">
          <CardBody className="p-6">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              {t("quickActions.needHelp.title")}
            </h3>
            <p className="text-[var(--text-secondary)] text-sm mb-4">
              {t("quickActions.needHelp.description")}
            </p>
            <Link href="https://docs.zen.land" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                {t("quickActions.needHelp.cta")}
              </Button>
            </Link>

          </CardBody>
        </Card>
      </div>
    </div>
  );
}
