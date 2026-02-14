"use client";

/**
 * AgentHeader
 *
 * Displays agent profile header with:
 * - Avatar with initial
 * - Address (copyable)
 * - Status badges (Active/Inactive, Available/Unavailable)
 * - Registration date
 * - Action buttons
 */

import Link from "next/link";
import { useState } from "react";
import { Copy, CheckCircle2, ExternalLink, Activity, Crown } from "lucide-react";

import { Button, Badge, Card, CardBody, Heading, Text, toast } from "@/components/ui";
import { useAgentProfile } from "../AgentProfileContext";

// =============================================================================
// HELPERS
// =============================================================================

function formatJoinDate(timestamp: string | null): string {
  if (!timestamp) return "";
  const date = new Date(parseInt(timestamp) * 1000);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

// =============================================================================
// COMPONENT
// =============================================================================

export function AgentHeader() {
  const { agent, isOwnProfile, isSelectMode, onSelectAgent } = useAgentProfile();
  const [isCopying, setIsCopying] = useState(false);

  const copyAddress = () => {
    navigator.clipboard.writeText(agent.id);
    setIsCopying(true);
    toast.success("Address copied to clipboard");
    setTimeout(() => setIsCopying(false), 2000);
  };

  const shortAddress = `${agent.id.slice(0, 6)}...${agent.id.slice(-4)}`;
  const joinDate = formatJoinDate(agent.registrationTime);

  return (
    <Card variant="outlined">
      <CardBody className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-6">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-16 h-16 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-2xl">
              {agent.id.slice(2, 3).toUpperCase()}
            </div>
            {isOwnProfile && (
              <div className="absolute -top-2 -left-2 px-2 py-0.5 rounded-md bg-warning-100 dark:bg-warning-900/30 text-[10px] font-bold text-warning-700 dark:text-warning-400 border border-warning-200 dark:border-warning-800 flex items-center gap-1">
                <Crown size={10} />
                YOU
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 space-y-3">
            {/* Address & Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <Heading level={2} className="text-xl font-bold">
                {shortAddress}
              </Heading>
              <Badge variant={agent.isActive ? "success" : "neutral"} size="sm">
                {agent.isActive ? "Active" : "Inactive"}
              </Badge>
              {!agent.isAvailable && agent.isActive && (
                <Badge variant="warning" size="sm">
                  Unavailable
                </Badge>
              )}
            </div>

            {/* Full address (copyable) */}
            <button
              onClick={copyAddress}
              className="inline-flex items-center gap-2 text-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors group"
            >
              <code className="font-mono text-xs bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 transition-colors truncate max-w-[200px] sm:max-w-none">
                {agent.id}
              </code>
              {isCopying ? (
                <CheckCircle2 size={14} className="text-success-500 shrink-0" />
              ) : (
                <Copy size={14} className="shrink-0" />
              )}
            </button>

            {/* Join date */}
            {joinDate && (
              <Text variant="muted" className="text-sm">
                Joined {joinDate}
              </Text>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            {isOwnProfile ? (
              <Link href="/agents/dashboard">
                <Button variant="primary" leftIcon={<Activity size={16} />}>
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <Button
                variant="primary"
                onClick={onSelectAgent}
                leftIcon={<CheckCircle2 size={16} />}
              >
                Select Agent
              </Button>
            )}
            {!isSelectMode && (
              <Button variant="outline" leftIcon={<ExternalLink size={16} />}>
                View on Explorer
              </Button>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
