"use client";

/**
 * Escrows Page - List of all user's escrows with filters.
 * 
 * Features:
 * - Role filter: All Roles, As Buyer, As Seller, As Agent
 * - State tabs: All, Needs Attention, Active, In Dispute, Completed
 * - Responsive table (desktop) / card (mobile) layout
 * - Contextual empty states
 * - "Needs Attention" count badge
 */

import { useState, useMemo } from "react";
import Link from "next/link";
import { Bell, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui";
import { PageHeader } from "@/components/shared";
import { useEscrows, type EscrowRole } from "@/hooks";
import { useConnection } from "wagmi";
import {
  EscrowList,
  STATE_TABS,
  ROLE_FILTERS,
  filterEscrowsNeedingAttention,
  type EscrowListItemData,
  type EscrowStateTab,
} from "@/components/app/escrows/list";

// =============================================================================
// FILTER BUTTON COMPONENT
// =============================================================================

interface FilterButtonProps {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  badge?: number;
}

function FilterButton({ children, active, onClick, badge }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all ${
        active
          ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 ring-1 ring-primary-500/20"
          : "text-[var(--text-secondary)] hover:bg-[var(--state-hover)]"
      }`}
    >
      {children}
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold bg-error-500 text-white rounded-full px-1">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </button>
  );
}

// =============================================================================
// STATE TAB BUTTON COMPONENT
// =============================================================================

interface StateTabButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
  isAttention?: boolean;
  badge?: number;
}

function StateTabButton({ label, active, onClick, isAttention, badge }: StateTabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
        active
          ? "bg-primary-500 text-white"
          : "text-[var(--text-secondary)] hover:bg-[var(--state-hover)]"
      }`}
    >
      {isAttention && <Bell size={14} />}
      {label}
      {badge !== undefined && badge > 0 && (
        <span className={`min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold rounded-full px-1 ${
          active 
            ? "bg-white/20 text-white" 
            : "bg-error-500 text-white"
        }`}>
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </button>
  );
}

// =============================================================================
// MAIN PAGE COMPONENT
// =============================================================================

export default function EscrowsPage() {
  const t = useTranslations("escrows.list");
  const { address, isConnecting, isReconnecting } = useConnection();
  const [role, setRole] = useState<EscrowRole>("all");
  const [stateTab, setStateTab] = useState<EscrowStateTab>("all");

  // Fetch escrows based on role and state filters
  const { data, isLoading: isQueryLoading, isFetching, error } = useEscrows({
    role,
    stateTab,
  });

  // The query is disabled until the wallet (re)connects on page load; show the
  // skeleton then too instead of flashing the empty state.
  const isLoading = isQueryLoading || isConnecting || isReconnecting;
  // Background refresh of already-shown data (RPC sync can take a few seconds).
  const isRefreshing = isFetching && !isLoading;

  // Memoize the fallback array so it doesn't change identity on every render.
  const escrows = useMemo(
    () => (data?.items ?? []) as EscrowListItemData[],
    [data?.items]
  );

  // Calculate "needs attention" count for badge
  const needsAttentionCount = useMemo(() => {
    return filterEscrowsNeedingAttention(escrows, address).length;
  }, [escrows, address]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        description={t("description")}
        actions={
          <Link href="/escrows/new">
            <Button>{t("createEscrow")}</Button>
          </Link>
        }
      />

      {/* Filters Section */}
      <div className="flex flex-col gap-4">
        {/* Role Filters */}
        <div className="flex flex-wrap gap-2">
          {ROLE_FILTERS.map((filter) => (
            <FilterButton
              key={filter.value}
              active={role === filter.value}
              onClick={() => setRole(filter.value)}
            >
              {t(`roles.${filter.value}`)}
            </FilterButton>
          ))}
        </div>

        {/* State Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-[var(--border-secondary)] pb-4">
          {STATE_TABS.map((tab) => (
            <StateTabButton
              key={tab.value}
              label={t(`tabs.${tab.value}`)}
              active={stateTab === tab.value}
              onClick={() => setStateTab(tab.value)}
              isAttention={tab.value === "needs_attention"}
              badge={tab.value === "needs_attention" ? needsAttentionCount : undefined}
            />
          ))}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg text-error-600 dark:text-error-400 text-center">
          {t("error")}
        </div>
      )}

      {/* Background refresh indicator */}
      {isRefreshing && !error && (
        <div className="flex items-center justify-center gap-2 text-xs text-[var(--text-secondary)]" role="status">
          <Loader2 size={14} className="animate-spin" />
          {t("updating")}
        </div>
      )}

      {/* Escrow List */}
      {!error && (
        <EscrowList
          escrows={escrows}
          currentUserAddress={address}
          isLoading={isLoading}
          role={role}
          stateTab={stateTab}
        />
      )}
    </div>
  );
}
