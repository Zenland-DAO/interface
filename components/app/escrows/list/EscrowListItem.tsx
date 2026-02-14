"use client";

/**
 * EscrowListItem - A responsive row/card component for the escrow list.
 * 
 * - Desktop: Renders as a table row
 * - Mobile: Renders as a compact card
 * 
 * Shows: ID, Amount, Counterparty, Role, State, Date, Attention indicator
 */

import Link from "next/link";
import { AlertCircle, ExternalLink, Copy, Clock } from "lucide-react";
import { Badge, Text } from "@/components/ui";
import { toast } from "sonner";

import {
  type EscrowListItem as EscrowData,
  type UserEscrowRole,
  STATE_COLORS,
  STATE_LABELS,
  getUserRole,
  getCounterparty,
  getAttentionInfo,
  formatAddress,
  formatAmount,
} from "./constants";

// =============================================================================
// TYPES
// =============================================================================

interface EscrowListItemProps {
  escrow: EscrowData;
  currentUserAddress?: string;
  /** Whether to render in table mode (desktop) or card mode (mobile) */
  variant?: "table" | "card";
}

// =============================================================================
// ROLE BADGE COMPONENT
// =============================================================================

function RoleBadge({ role }: { role: UserEscrowRole }) {
  const roleColors: Record<UserEscrowRole, "primary" | "success" | "warning" | "neutral"> = {
    buyer: "primary",
    seller: "success",
    agent: "warning",
    observer: "neutral",
  };

  const roleLabels: Record<UserEscrowRole, string> = {
    buyer: "Buyer",
    seller: "Seller",
    agent: "Agent",
    observer: "Observer",
  };

  return (
    <Badge variant={roleColors[role]} size="sm" className="text-[10px] uppercase tracking-wider font-bold">
      {roleLabels[role]}
    </Badge>
  );
}

// =============================================================================
// ATTENTION INDICATOR
// =============================================================================

function AttentionIndicator({ reason, priority }: { reason: string; priority: "high" | "medium" | "low" }) {
  const priorityColors = {
    high: "text-error-500 bg-error-50 dark:bg-error-900/20",
    medium: "text-warning-500 bg-warning-50 dark:bg-warning-900/20",
    low: "text-neutral-500 bg-neutral-50 dark:bg-neutral-900/20",
  };

  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${priorityColors[priority]}`}>
      <AlertCircle size={12} />
      <span className="hidden sm:inline">{reason}</span>
    </div>
  );
}

// =============================================================================
// TABLE ROW VARIANT (DESKTOP)
// =============================================================================

function TableRow({ escrow, currentUserAddress }: Omit<EscrowListItemProps, "variant">) {
  const userRole = getUserRole(escrow, currentUserAddress);
  const counterparty = getCounterparty(escrow, userRole);
  const attentionInfo = getAttentionInfo(escrow, currentUserAddress);
  const date = new Date(Number(escrow.createdAt) * 1000).toLocaleDateString();

  const copyToClipboard = (e: React.MouseEvent, text: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    toast.success("Address copied");
  };

  return (
    <Link href={`/escrows/${escrow.id}`} className="contents group">
      <tr className="border-b border-[var(--border-secondary)] hover:bg-[var(--state-hover)] transition-colors cursor-pointer">
        {/* ID */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <code className="text-xs font-mono text-[var(--text-secondary)]">
              {formatAddress(escrow.id)}
            </code>
            <button
              onClick={(e) => copyToClipboard(e, escrow.id)}
              className="p-1 opacity-0 group-hover:opacity-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-opacity"
            >
              <Copy size={12} className="text-neutral-400" />
            </button>
          </div>
        </td>

        {/* Amount */}
        <td className="px-4 py-3">
          <Text className="font-semibold text-primary-600 dark:text-primary-400">
            {formatAmount(escrow.amount)} USDT
          </Text>
        </td>

        {/* Counterparty */}
        <td className="px-4 py-3">
          {counterparty ? (
            <div className="flex items-center gap-2">
              <code className="text-xs font-mono text-[var(--text-secondary)]">
                {formatAddress(counterparty)}
              </code>
              <button
                onClick={(e) => copyToClipboard(e, counterparty)}
                className="p-1 opacity-0 group-hover:opacity-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-opacity"
              >
                <Copy size={12} className="text-neutral-400" />
              </button>
            </div>
          ) : (
            <Text variant="muted" className="text-xs italic">
              {userRole === "agent" ? "Both parties" : "—"}
            </Text>
          )}
        </td>

        {/* Role */}
        <td className="px-4 py-3">
          <RoleBadge role={userRole} />
        </td>

        {/* State */}
        <td className="px-4 py-3">
          <Badge variant={STATE_COLORS[escrow.state] || "neutral"} size="sm">
            {STATE_LABELS[escrow.state] || escrow.state}
          </Badge>
        </td>

        {/* Date */}
        <td className="px-4 py-3">
          <Text variant="muted" className="text-xs flex items-center gap-1">
            <Clock size={12} />
            {date}
          </Text>
        </td>

        {/* Action/Attention */}
        <td className="px-4 py-3">
          <div className="flex items-center justify-end gap-2">
            {attentionInfo.needsAttention && attentionInfo.reason && (
              <AttentionIndicator reason={attentionInfo.reason} priority={attentionInfo.priority} />
            )}
            <ExternalLink size={14} className="text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </td>
      </tr>
    </Link>
  );
}

// =============================================================================
// CARD VARIANT (MOBILE)
// =============================================================================

function CardItem({ escrow, currentUserAddress }: Omit<EscrowListItemProps, "variant">) {
  const userRole = getUserRole(escrow, currentUserAddress);
  const counterparty = getCounterparty(escrow, userRole);
  const attentionInfo = getAttentionInfo(escrow, currentUserAddress);
  const date = new Date(Number(escrow.createdAt) * 1000).toLocaleDateString();

  return (
    <Link
      href={`/escrows/${escrow.id}`}
      className="block p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-secondary)] hover:border-primary-500/30 hover:shadow-md transition-all"
    >
      {/* Header: Amount + Attention */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <Text className="text-lg font-bold text-primary-600 dark:text-primary-400">
            {formatAmount(escrow.amount)} USDT
          </Text>
          <Text variant="muted" className="text-xs font-mono">
            {formatAddress(escrow.id)}
          </Text>
        </div>
        {attentionInfo.needsAttention && attentionInfo.reason && (
          <AttentionIndicator reason={attentionInfo.reason} priority={attentionInfo.priority} />
        )}
      </div>

      {/* Middle: Counterparty */}
      {counterparty && (
        <div className="mb-3 pb-3 border-b border-[var(--border-secondary)]">
          <Text variant="muted" className="text-[10px] uppercase tracking-wider font-bold mb-1">
            {userRole === "buyer" ? "Seller" : userRole === "seller" ? "Buyer" : "Counterparty"}
          </Text>
          <code className="text-xs font-mono text-[var(--text-secondary)]">
            {formatAddress(counterparty)}
          </code>
        </div>
      )}

      {/* Footer: State + Role + Date */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Badge variant={STATE_COLORS[escrow.state] || "neutral"} size="sm">
            {STATE_LABELS[escrow.state] || escrow.state}
          </Badge>
          <RoleBadge role={userRole} />
        </div>
        <Text variant="muted" className="text-xs flex items-center gap-1">
          <Clock size={12} />
          {date}
        </Text>
      </div>
    </Link>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function EscrowListItem({ escrow, currentUserAddress, variant = "table" }: EscrowListItemProps) {
  if (variant === "card") {
    return <CardItem escrow={escrow} currentUserAddress={currentUserAddress} />;
  }
  return <TableRow escrow={escrow} currentUserAddress={currentUserAddress} />;
}
