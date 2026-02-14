"use client";

/**
 * EscrowTimeline
 *
 * Displays the activity timeline using transaction logs from the indexer.
 * Shows events like funding, fulfillment, disputes, etc.
 */

import {
  Clock,
  Check,
  AlertCircle,
  User,
  Percent,
  RefreshCw,
  X,
  ExternalLink,
} from "lucide-react";

import { Card, CardHeader, CardBody, Heading, Text, Skeleton } from "@/components/ui";
import { useEscrowDetail } from "../EscrowDetailContext";
import {
  EVENT_LABELS,
  EVENT_ICONS,
  EVENT_COLORS,
  getTxExplorerUrl,
} from "../constants";
import { useChainId } from "wagmi";

// =============================================================================
// ICON MAPPING
// =============================================================================

const ICON_MAP = {
  check: Check,
  clock: Clock,
  alert: AlertCircle,
  user: User,
  split: Percent,
  refresh: RefreshCw,
  x: X,
} as const;

type IconKey = keyof typeof ICON_MAP;

// =============================================================================
// COLOR CLASSES
// =============================================================================

const COLOR_CLASSES = {
  success: "bg-success-500 shadow-[0_0_0_4px_rgba(34,197,94,0.1)]",
  warning: "bg-warning-500 shadow-[0_0_0_4px_rgba(234,179,8,0.1)]",
  danger: "bg-error-500 shadow-[0_0_0_4px_rgba(239,68,68,0.1)]",
  neutral: "bg-neutral-400 shadow-[0_0_0_4px_rgba(163,163,163,0.1)]",
  primary: "bg-primary-500 shadow-[0_0_0_4px_rgba(99,102,241,0.1)]",
} as const;

type ColorKey = keyof typeof COLOR_CLASSES;

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Format timestamp to readable date.
 */
function formatTimestamp(timestamp: bigint): string {
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Parse event data JSON safely.
 */
function parseEventData(eventData: string): Record<string, unknown> {
  try {
    return JSON.parse(eventData);
  } catch {
    return {};
  }
}

/**
 * Get additional details from event data.
 */
function getEventDetails(eventName: string, eventData: string): string | null {
  const data = parseEventData(eventData);

  switch (eventName) {
    case "SplitProposed":
      if (data.buyerBps && data.sellerBps) {
        const buyerPct = Number(data.buyerBps) / 100;
        const sellerPct = Number(data.sellerBps) / 100;
        return `Proposed ${buyerPct}% buyer / ${sellerPct}% seller`;
      }
      break;
    case "AgentResolved":
      if (data.buyerAmount !== undefined && data.sellerAmount !== undefined) {
        return `Buyer: ${data.buyerAmount}, Seller: ${data.sellerAmount}`;
      }
      break;
    default:
      return null;
  }

  return null;
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface TimelineItemProps {
  eventName: string;
  timestamp: bigint;
  txHash: string;
  eventData: string;
  isLast: boolean;
  chainId: number;
}

function TimelineItem({
  eventName,
  timestamp,
  txHash,
  eventData,
  isLast,
  chainId,
}: TimelineItemProps) {
  const label = EVENT_LABELS[eventName] || eventName;
  const iconKey = (EVENT_ICONS[eventName] || "check") as IconKey;
  const colorKey = (EVENT_COLORS[eventName] || "neutral") as ColorKey;

  const Icon = ICON_MAP[iconKey];
  const colorClass = COLOR_CLASSES[colorKey];
  const details = getEventDetails(eventName, eventData);
  const explorerUrl = getTxExplorerUrl(chainId, txHash);

  return (
    <div className="flex gap-4">
      {/* Timeline Indicator */}
      <div className="flex flex-col items-center">
        <div className={`w-3 h-3 rounded-full ${colorClass}`}>
          <span className="sr-only">{label}</span>
        </div>
        {!isLast && (
          <div className="w-px flex-1 bg-neutral-200 dark:bg-neutral-800 my-1 min-h-[24px]" />
        )}
      </div>

      {/* Content */}
      <div className="pb-4 flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Icon size={14} className="text-[var(--text-tertiary)] flex-shrink-0" />
            <Text className="text-sm font-semibold">{label}</Text>
          </div>
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--text-tertiary)] hover:text-primary-500 transition-colors flex-shrink-0"
            title="View on Explorer"
          >
            <ExternalLink size={12} />
          </a>
        </div>

        {details && (
          <Text variant="muted" className="text-xs mt-0.5">
            {details}
          </Text>
        )}

        <Text variant="muted" className="text-xs flex items-center gap-1 mt-1">
          <Clock size={10} />
          {formatTimestamp(timestamp)}
        </Text>
      </div>
    </div>
  );
}

function TimelineSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-4">
          <div className="flex flex-col items-center">
            <Skeleton className="w-3 h-3 rounded-full" />
            {i < 3 && <Skeleton className="w-px h-8 my-1" />}
          </div>
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// COMPONENT
// =============================================================================

export function EscrowTimeline() {
  const { transactions } = useEscrowDetail();
  const chainId = useChainId();

  // `useEscrowTransactions` returns `{ transactions: TypedLogEntry[] }`.
  // Keep the local name `logs` since this component renders a log timeline.
  const { transactions: logs, isLoading, error } = transactions;

  return (
    <Card variant="elevated">
      <CardHeader>
        <Heading level={3} className="text-lg">
          Activity Timeline
        </Heading>
      </CardHeader>

      <CardBody>
        {isLoading ? (
          <TimelineSkeleton />
        ) : error ? (
          <div className="text-center py-6">
            <AlertCircle
              size={24}
              className="mx-auto text-error-500 mb-2"
            />
            <Text variant="muted" className="text-sm">
              Failed to load activity
            </Text>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-6">
            <Clock
              size={24}
              className="mx-auto text-[var(--text-tertiary)] mb-2"
            />
            <Text variant="muted" className="text-sm">
              No activity yet
            </Text>
          </div>
        ) : (
          <div className="space-y-0">
            {logs.map((log, index) => (
              <TimelineItem
                key={log.id}
                eventName={log.eventName}
                timestamp={log.timestamp}
                txHash={log.txHash}
                eventData={log.eventData}
                isLast={index === logs.length - 1}
                chainId={chainId}
              />
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
