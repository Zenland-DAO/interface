"use client";

/**
 * AgentContact
 *
 * Displays agent's professional summary (description) and contact information.
 * Uses the shared ContactDisplay component for contact channels.
 */

import { Mail } from "lucide-react";

import { Card, CardHeader, CardBody, Heading, Text, Icon } from "@/components/ui";
import { ContactDisplay } from "@/components/app/agents/shared";
import { useAgentProfile } from "../AgentProfileContext";

// =============================================================================
// COMPONENT
// =============================================================================

export function AgentContact() {
  const { agent } = useAgentProfile();

  return (
    <Card variant="outlined">
      <CardHeader className="border-b border-[var(--border-secondary)]">
        <div className="flex items-center gap-3">
          <Icon icon={Mail} boxed boxColor="neutral" size="sm" />
          <Heading level={4}>Professional Summary & Contact</Heading>
        </div>
      </CardHeader>
      <CardBody className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Bio / Description */}
        <div className="space-y-2">
          <Text variant="caption" className="text-xs font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
            Bio / Description
          </Text>
          <Text className="whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
            {agent.description || "No professional summary provided by this agent."}
          </Text>
        </div>

        {/* Contact Channels */}
        <div className="pt-3 sm:pt-4 border-t border-[var(--border-secondary)] space-y-3">
          <Text variant="caption" className="text-xs font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
            Contact Channels
          </Text>
          <ContactDisplay contact={agent.contact} variant="expanded" />
        </div>
      </CardBody>
    </Card>
  );
}
