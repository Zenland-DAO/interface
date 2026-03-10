"use client";

import { User, Globe } from "lucide-react";
import { useTranslations } from "next-intl";
import { StatCard } from "./StatCard";
import { useDashboardStats, type DashboardViewMode } from "@/hooks/indexer/useDashboardStats";
import { formatUsdValue } from "@/lib/utils/format";

interface ViewToggleProps {
  viewMode: DashboardViewMode;
  onViewChange: (mode: DashboardViewMode) => void;
  isConnected: boolean;
}

function ViewToggle({ viewMode, onViewChange, isConnected }: ViewToggleProps) {
  const t = useTranslations("dashboard.stats");

  if (!isConnected) {
    // Show a static badge when not connected
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-[var(--text-secondary)] rounded-lg">
        <Globe size={14} />
        <span>{t("protocolStats")}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
      <button
        onClick={() => onViewChange("personal")}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
          viewMode === "personal"
            ? "bg-white dark:bg-neutral-700 text-[var(--text-primary)] shadow-sm"
            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        }`}
      >
        <User size={14} />
        <span>{t("myStats")}</span>
      </button>
      <button
        onClick={() => onViewChange("global")}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
          viewMode === "global"
            ? "bg-white dark:bg-neutral-700 text-[var(--text-primary)] shadow-sm"
            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        }`}
      >
        <Globe size={14} />
        <span>{t("protocol")}</span>
      </button>
    </div>
  );
}

/**
 * Dashboard stats grid with view mode toggle.
 * Shows personal stats when connected, global stats otherwise.
 * Connected users can toggle between personal and global views.
 */
export function DashboardStats() {
  const t = useTranslations("dashboard.stats");
  const {
    viewMode,
    setViewMode,
    isConnected,
    stats,
    isLoading,
    error,
  } = useDashboardStats();

  // Determine labels based on view mode
  const isPersonal = viewMode === "personal" && isConnected;
  const labels = {
    active: t("active"),
    tvl: isPersonal ? t("tvlPersonal") : t("tvlGlobal"),
    completed: t("completed"),
    disputed: t("disputed"),
  };

  // Format values
  const values = {
    active: stats?.activeCount ?? 0,
    tvl: stats?.tvl ? formatUsdValue(stats.tvl) : "$0.00",
    completed: stats?.completedCount ?? 0,
    disputed: stats?.disputeCount ?? 0,
  };

  return (
    <div className="space-y-4">
      {/* Toggle Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-[var(--text-secondary)]">
          {isPersonal ? t("yourActivity") : t("protocolOverview")}
        </h2>
        <ViewToggle
          viewMode={viewMode}
          onViewChange={setViewMode}
          isConnected={isConnected}
        />
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg text-error-600 dark:text-error-400 text-center text-sm">
          {t("error")}
        </div>
      )}

      {/* Stats Grid */}
      {!error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            label={labels.active}
            value={values.active}
            isLoading={isLoading}
          />
          <StatCard
            label={labels.tvl}
            value={values.tvl}
            isLoading={isLoading}
          />
          <StatCard
            label={labels.completed}
            value={values.completed}
            variant="success"
            isLoading={isLoading}
          />
          <StatCard
            label={labels.disputed}
            value={values.disputed}
            variant="warning"
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
  );
}
