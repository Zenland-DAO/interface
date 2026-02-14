"use client";

/**
 * EscrowList - Responsive container for displaying escrow items.
 * 
 * - Desktop (lg+): Table layout with sortable columns
 * - Mobile: Card layout with vertical stacking
 * 
 * Handles loading states, empty states, and responsive breakpoints.
 */

import Link from "next/link";
import { FileText, CheckCircle, AlertTriangle, Search } from "lucide-react";
import { Card, CardBody, Button, Text, Heading } from "@/components/ui";

import { EscrowListItem } from "./EscrowListItem";
import {
  type EscrowListItem as EscrowData,
  type EscrowStateTab,
  getEmptyStateConfig,
  filterEscrowsNeedingAttention,
} from "./constants";
import type { EscrowRole } from "@/hooks/indexer/useEscrows";

// =============================================================================
// TYPES
// =============================================================================

interface EscrowListProps {
  escrows: EscrowData[];
  currentUserAddress?: string;
  isLoading?: boolean;
  role: EscrowRole;
  stateTab: EscrowStateTab;
}

// =============================================================================
// LOADING SKELETON
// =============================================================================

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {/* Desktop skeleton */}
      <div className="hidden lg:block">
        <div className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-secondary)] overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-[var(--border-secondary)] bg-neutral-50 dark:bg-neutral-900/50">
            <div className="flex gap-4">
              {[80, 100, 120, 60, 100, 80, 60].map((width, i) => (
                <div
                  key={i}
                  className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse"
                  style={{ width: `${width}px` }}
                />
              ))}
            </div>
          </div>
          {/* Rows */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-4 py-4 border-b border-[var(--border-secondary)] last:border-b-0">
              <div className="flex gap-4">
                {[80, 100, 120, 60, 100, 80, 60].map((width, j) => (
                  <div
                    key={j}
                    className="h-4 bg-neutral-100 dark:bg-neutral-800 rounded animate-pulse"
                    style={{ width: `${width}px` }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile skeleton */}
      <div className="lg:hidden space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-36 bg-neutral-100 dark:bg-neutral-800 rounded-lg animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// EMPTY STATE
// =============================================================================

interface EmptyStateProps {
  role: EscrowRole;
  stateTab: EscrowStateTab;
}

function EmptyState({ role, stateTab }: EmptyStateProps) {
  const config = getEmptyStateConfig(role, stateTab);

  // Choose icon based on context
  const IconComponent = stateTab === "needs_attention" ? CheckCircle : 
                        stateTab === "IN_DISPUTE" ? AlertTriangle :
                        role !== "all" ? Search : FileText;

  const iconColorClass = stateTab === "needs_attention" ? "text-success-500 bg-success-50 dark:bg-success-900/20" :
                         stateTab === "IN_DISPUTE" ? "text-warning-500 bg-warning-50 dark:bg-warning-900/20" :
                         "text-[var(--text-tertiary)] bg-neutral-100 dark:bg-neutral-800";

  return (
    <Card variant="elevated">
      <CardBody className="py-16 text-center">
        <div className={`w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center ${iconColorClass}`}>
          <IconComponent size={32} />
        </div>
        <Heading level={3}>{config.title}</Heading>
        <Text variant="muted" className="mt-2 max-w-sm mx-auto">
          {config.description}
        </Text>

        {config.showCreateButton && (
          <Link href="/escrows/new" className="mt-8 inline-block">
            <Button variant="outline">Create Your First Escrow</Button>
          </Link>
        )}
      </CardBody>
    </Card>
  );
}

// =============================================================================
// TABLE HEADER
// =============================================================================

function TableHeader() {
  return (
    <thead>
      <tr className="border-b border-[var(--border-secondary)] bg-neutral-50 dark:bg-neutral-900/50">
        <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider font-bold text-[var(--text-tertiary)]">
          ID
        </th>
        <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider font-bold text-[var(--text-tertiary)]">
          Amount
        </th>
        <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider font-bold text-[var(--text-tertiary)]">
          Counterparty
        </th>
        <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider font-bold text-[var(--text-tertiary)]">
          Role
        </th>
        <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider font-bold text-[var(--text-tertiary)]">
          Status
        </th>
        <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider font-bold text-[var(--text-tertiary)]">
          Date
        </th>
        <th className="px-4 py-3 text-right text-[10px] uppercase tracking-wider font-bold text-[var(--text-tertiary)]">
          Action
        </th>
      </tr>
    </thead>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function EscrowList({
  escrows,
  currentUserAddress,
  isLoading,
  role,
  stateTab,
}: EscrowListProps) {
  // Loading state
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  // Filter for "needs_attention" tab (client-side filtering)
  const displayedEscrows = stateTab === "needs_attention"
    ? filterEscrowsNeedingAttention(escrows, currentUserAddress)
    : escrows;

  // Empty state
  if (displayedEscrows.length === 0) {
    return <EmptyState role={role} stateTab={stateTab} />;
  }

  return (
    <div>
      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <div className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-secondary)] overflow-hidden">
          <table className="w-full">
            <TableHeader />
            <tbody>
              {displayedEscrows.map((escrow) => (
                <EscrowListItem
                  key={escrow.id}
                  escrow={escrow}
                  currentUserAddress={currentUserAddress}
                  variant="table"
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3">
        {displayedEscrows.map((escrow) => (
          <EscrowListItem
            key={escrow.id}
            escrow={escrow}
            currentUserAddress={currentUserAddress}
            variant="card"
          />
        ))}
      </div>

      {/* Results count */}
      <div className="mt-4 text-center">
        <Text variant="muted" className="text-xs">
          Showing {displayedEscrows.length} escrow{displayedEscrows.length !== 1 ? "s" : ""}
        </Text>
      </div>
    </div>
  );
}
