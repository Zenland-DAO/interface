"use client";

/**
 * AgentStats
 *
 * Displays key agent statistics in a grid:
 * - Cases Resolved
 * - Total Escrows
 * - Dispute Fee
 * - Assignment Fee
 */

import { CheckCircle2, Activity, CircleDollarSign, Coins } from "lucide-react";

import { Card, CardBody, Icon, Text, Heading } from "@/components/ui";
import { useAgentProfile } from "../AgentProfileContext";

// =============================================================================
// TYPES
// =============================================================================

interface StatItem {
  label: string;
  value: string | number;
  icon: typeof CheckCircle2;
  color: "success" | "primary" | "warning" | "neutral";
}

// =============================================================================
// COMPONENT
// =============================================================================

export function AgentStats() {
  const { agent } = useAgentProfile();

  const stats: StatItem[] = [
    {
      label: "Cases Resolved",
      value: agent.totalResolved,
      icon: CheckCircle2,
      color: "success",
    },
    {
      label: "Total Escrows",
      value: agent.totalEscrowsAssigned,
      icon: Activity,
      color: "primary",
    },
    {
      label: "Dispute Fee",
      value: `${(agent.disputeFeeBps / 100).toFixed(2)}%`,
      icon: CircleDollarSign,
      color: "warning",
    },
    {
      label: "Assign Fee",
      value: `${(agent.assignmentFeeBps / 100).toFixed(2)}%`,
      icon: Coins,
      color: "primary",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} variant="outlined">
          <CardBody className="p-5 flex flex-col items-center text-center gap-3">
            <Icon icon={stat.icon} boxed boxColor={stat.color} size="sm" />
            <div className="space-y-1">
              <Text variant="muted" className="text-xs uppercase tracking-wider font-medium">
                {stat.label}
              </Text>
              <Heading level={4} className="text-xl font-bold">
                {stat.value}
              </Heading>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
