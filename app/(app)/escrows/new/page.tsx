"use client";

/**
 * Create New Escrow Page
 *
 * Multi-step wizard for creating a new escrow contract.
 * Features:
 * - Connect wallet prompt when not connected
 * - Step-by-step form flow (Fill → Review → Approve → Confirm → Success)
 * - Form persistence via localStorage
 * - Error boundary with retry functionality
 * - Loading skeleton for initial render
 */

import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { ErrorBoundary, SkeletonEscrowWizard } from "@/components/ui";
import { PageHeader } from "@/components/shared";
import { CreateEscrowWizard } from "@/components/app/escrows/create";

// =============================================================================
// MAIN PAGE
// =============================================================================

export default function NewEscrowPage() {
  const t = useTranslations("escrows.create");
  return (
    <div className="max-w-6xl mx-auto py-4 space-y-8">
      <PageHeader
        backLink={{ href: "/escrows", label: t("backToEscrows") }}
        title={t("title")}
        description={t("description")}
      />

      <ErrorBoundary
        onError={(error, errorInfo) => {
          // Log error to console in development
          if (process.env.NODE_ENV === "development") {
            console.error("Escrow wizard error:", error, errorInfo);
          }
          // TODO: Log to error tracking service in production
        }}
      >
        <Suspense fallback={<SkeletonEscrowWizard />}>
          <CreateEscrowWizard />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
