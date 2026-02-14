"use client";

import Link from "next/link";
import { FileText } from "lucide-react";
import { Card, CardHeader, CardBody, Button, Text, Heading } from "@/components/ui";
import { EscrowListItem, type EscrowListItemData } from "@/components/app/escrows/list";
import { useDashboardStats } from "@/hooks/indexer/useDashboardStats";

/**
 * Loading skeleton for the recent escrows section.
 */
function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="h-20 bg-neutral-100 dark:bg-neutral-800 rounded-lg animate-pulse"
        />
      ))}
    </div>
  );
}

/**
 * Empty state when no escrows are available.
 */
function EmptyState({ isPersonal }: { isPersonal: boolean }) {
  return (
    <div className="py-16 text-center">
      <div className="w-14 h-14 mx-auto mb-6 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-[var(--text-tertiary)]">
        <FileText className="w-7 h-7" />
      </div>
      <Heading level={4}>
        {isPersonal ? "No recent escrows" : "No escrows yet"}
      </Heading>
      <Text variant="muted" className="mt-2 text-sm max-w-[200px] mx-auto">
        {isPersonal
          ? "Create your first escrow contract to get started."
          : "Be the first to create an escrow on Zenland!"}
      </Text>
      {isPersonal && (
        <Link href="/escrows/new" className="mt-8 inline-block">
          <Button variant="outline" size="sm">
            Create Escrow
          </Button>
        </Link>
      )}
    </div>
  );
}

/**
 * Recent escrows section for the dashboard.
 * Shows user's or global recent escrows based on view mode.
 */
export function RecentEscrows() {
  const { stats, isLoading, viewMode, isConnected } = useDashboardStats();
  
  const isPersonal = viewMode === "personal" && isConnected;
  const escrows = (stats?.recentEscrows ?? []) as EscrowListItemData[];

  return (
    <Card variant="elevated">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            {isPersonal ? "Recent Escrows" : "Latest Escrows"}
          </h2>
          <Link
            href="/escrows"
            className="text-sm text-[var(--color-primary-500)] hover:underline"
          >
            View all
          </Link>
        </div>
      </CardHeader>
      <CardBody>
        {isLoading ? (
          <LoadingSkeleton />
        ) : escrows.length === 0 ? (
          <EmptyState isPersonal={isPersonal} />
        ) : (
          <div className="space-y-2">
            {escrows.map((escrow) => (
              <EscrowListItem
                key={escrow.id}
                escrow={escrow}
                currentUserAddress={isConnected ? undefined : undefined}
                variant="card"
              />
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
