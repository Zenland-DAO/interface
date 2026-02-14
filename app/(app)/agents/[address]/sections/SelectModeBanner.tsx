"use client";

/**
 * SelectModeBanner
 *
 * Information banner shown when user is selecting an agent for escrow creation.
 */

import { Info } from "lucide-react";

import { Card, CardBody, Text, Icon } from "@/components/ui";

// =============================================================================
// COMPONENT
// =============================================================================

export function SelectModeBanner() {
  return (
    <Card variant="outlined" className="border-primary-200 dark:border-primary-800 bg-primary-50/50 dark:bg-primary-900/10">
      <CardBody className="p-4">
        <div className="flex items-start gap-3">
          <Icon icon={Info} boxed boxColor="primary" size="sm" />
          <div className="space-y-1">
            <Text className="font-semibold text-primary-800 dark:text-primary-200">
              Selecting agent for escrow creation
            </Text>
            <Text variant="muted" className="text-sm">
              Review this agent&apos;s profile and click &quot;Select Agent&quot; to assign them to your escrow
            </Text>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
