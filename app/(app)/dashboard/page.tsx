"use client";

import Link from "next/link";
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
  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's an overview of escrow activity."
        actions={
          <Link href="/escrows/new">
            <Button>Create Escrow</Button>
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
              Become an Agent
            </h3>
            <p className="text-[var(--text-secondary)] text-sm mb-4">
              Help resolve disputes and earn fees by becoming a registered agent.
            </p>
            <Link href="/agents/register">
              <Button variant="outline" size="sm">
                Learn More
              </Button>
            </Link>
          </CardBody>
        </Card>
        <Card variant="outlined">
          <CardBody className="p-6">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              Need Help?
            </h3>
            <p className="text-[var(--text-secondary)] text-sm mb-4">
              Check out our documentation to learn how Zenland escrow works.
            </p>
            <Link href="https://docs.zen.land" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                View Docs
              </Button>
            </Link>

          </CardBody>
        </Card>
      </div>
    </div>
  );
}
