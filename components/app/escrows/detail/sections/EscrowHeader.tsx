"use client";

/**
 * EscrowHeader
 *
 * Displays the page header with:
 * - Back navigation
 * - Escrow title (truncated address)
 * - Creation date
 * - State badge
 * - User role badge
 */

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Badge, Heading, Text } from "@/components/ui";
import { useEscrowDetail } from "../EscrowDetailContext";
import { STATE_COLORS, STATE_LABELS, ROLE_LABELS, ROLE_COLORS } from "../constants";

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Truncate an address for display.
 */
function truncateAddress(address: string, chars = 6): string {
  if (address.length <= chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Format a timestamp to a readable date.
 */
function formatDate(timestamp: bigint): string {
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// =============================================================================
// COMPONENT
// =============================================================================

export function EscrowHeader() {
  const { escrow, role } = useEscrowDetail();

  const stateColor = STATE_COLORS[escrow.state];
  const stateLabel = STATE_LABELS[escrow.state];
  const roleColor = ROLE_COLORS[role.role] as "primary" | "success" | "warning" | "neutral";
  const roleLabel = ROLE_LABELS[role.role];

  const createdDate = formatDate(escrow.createdAt);
  const truncatedId = truncateAddress(escrow.id);

  return (
    <header className="space-y-1">
      {/* Back Navigation */}
      <Link
        href="/escrows"
        className="text-sm font-medium text-[var(--text-secondary)] hover:text-primary-500 transition-colors inline-flex items-center gap-1.5 group"
      >
        <ArrowLeft
          size={14}
          className="transition-transform group-hover:-translate-x-1"
        />
        Back to Escrows
      </Link>

      {/* Title Row */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <Heading level={1} className="text-2xl font-bold">
            Escrow{" "}
            <span className="text-[var(--text-secondary)] font-mono text-xl">
              {truncatedId}
            </span>
          </Heading>
          <Text variant="muted" className="text-sm">
            Created on {createdDate}
          </Text>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Role Badge */}
          {role.role !== "viewer" && (
            <Badge variant={roleColor} size="sm">
              {roleLabel}
            </Badge>
          )}

          {/* State Badge */}
          <Badge variant={stateColor} size="md">
            {stateLabel}
          </Badge>
        </div>
      </div>
    </header>
  );
}
