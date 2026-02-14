"use client";

import Link from "next/link";
import { Button, Card, CardHeader, CardBody, Badge, Text, Heading, SkeletonCard } from "@/components/ui";
import { useEscrow } from "@/hooks";
import { formatAmount } from "@/components/app/escrows/create/schema";
import { Clock, ArrowLeft, Copy, ExternalLink, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface EscrowDetailClientProps {
  id: string;
}

const STATE_COLORS: Record<string, "primary" | "success" | "warning" | "danger" | "neutral"> = {
  INITIALIZED: "neutral",
  FUNDED: "primary",
  FULFILLED: "success",
  COMPLETED: "success",
  DISPUTED: "danger",
  REFUNDED: "neutral",
  RELEASED: "success",
};



export function EscrowDetailClient({ id }: EscrowDetailClientProps) {
  const { data: escrow, isLoading, error } = useEscrow(id);



  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Address copied to clipboard");
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <SkeletonCard className="h-64" />
            <SkeletonCard className="h-48" />
          </div>
          <div className="space-y-6">
            <SkeletonCard className="h-48" />
            <SkeletonCard className="h-32" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !escrow) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-error-50 dark:bg-error-900/10 rounded-full flex items-center justify-center mx-auto text-error-500">
          <AlertCircle size={32} />
        </div>
        <Heading level={2}>Escrow Not Found</Heading>
        <Text variant="muted">
          We couldn&apos;t find the escrow contract you&apos;re looking for. It might not be indexed yet.
        </Text>
        <Link href="/escrows" className="inline-block pt-4">
          <Button variant="outline">Back to Escrows</Button>
        </Link>
      </div>
    );
  }

  const date = new Date(Number(escrow.createdAt) * 1000).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const formattedAmount = formatAmount(BigInt(escrow.amount), 6);

  const formatDuration = (seconds: number) => {
    if (seconds === 0) return "No protection";
    const days = Math.floor(seconds / 86400);
    if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
    const hours = Math.floor(seconds / 3600);
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    return `${Math.floor(seconds / 60)} minutes`;
  };

  const startTime = Number(escrow.fundedAt || escrow.createdAt);
  // Use indexer data if available (non-zero), otherwise fall back to contract read
  const protectionSeconds = Number(escrow.buyerProtectionTime);

  const expiryTimestamp = startTime + protectionSeconds;
  const now = Math.floor(Date.now() / 1000);
  const remainingSeconds = expiryTimestamp - now;
  const isExpired = remainingSeconds <= 0;
  const hasProtection = protectionSeconds > 0;

  const expiryDateFormatted = new Date(expiryTimestamp * 1000).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const getRemainingText = () => {
    if (!hasProtection) return "No protection period";
    if (isExpired) return "Protection period expired";

    const days = Math.floor(remainingSeconds / 86400);
    if (days > 0) return `Approx. ${days} day${days > 1 ? 's' : ''} remaining`;

    const hours = Math.floor(remainingSeconds / 3600);
    if (hours > 0) return `Approx. ${hours} hour${hours > 1 ? 's' : ''} remaining`;

    return "Less than an hour remaining";
  };

  const progress = !hasProtection || isExpired
    ? 100
    : Math.max(0, Math.min(100, ((protectionSeconds - remainingSeconds) / protectionSeconds) * 100));

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <Link
            href="/escrows"
            className="text-sm font-medium text-[var(--text-secondary)] hover:text-primary-500 transition-colors inline-flex items-center gap-1.5 group"
          >
            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
            Back to Escrows
          </Link>
          <Heading level={1} className="text-2xl font-bold truncate max-w-[500px]">
            Escrow #{escrow.id}
          </Heading>
          <Text variant="muted" className="text-sm">
            Created on {date}
          </Text>
        </div>
        <Badge variant={STATE_COLORS[escrow.state] || "neutral"} size="md">
          {escrow.state}
        </Badge>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Escrow Details */}
          <Card variant="elevated">
            <CardHeader>
              <Heading level={3} className="text-lg">Escrow Details</Heading>
            </CardHeader>
            <CardBody className="space-y-6">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <Text variant="muted" className="text-xs uppercase font-bold tracking-wider mb-1">Amount</Text>
                  <Text className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    {formattedAmount} USDT
                  </Text>
                </div>
                <div>
                  <Text variant="muted" className="text-xs uppercase font-bold tracking-wider mb-1">Status</Text>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${escrow.state === "FUNDED" ? "bg-primary-500" : "bg-neutral-400"}`} />
                    <Text className="font-semibold capitalize">{escrow.state.toLowerCase()}</Text>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-[var(--border-secondary)]">
                <Text variant="muted" className="text-xs uppercase font-bold tracking-wider mb-3">Escrow terms hash</Text>
                <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-[var(--border-secondary)] font-mono text-xs break-all">
                  {escrow.termsHash}
                </div>
              </div>

              <div className="pt-6 border-t border-[var(--border-secondary)] space-y-4">
                <div className="flex justify-between items-center">
                  <Text variant="muted" className="text-sm font-medium">Buyer</Text>
                  <div className="flex items-center gap-2">
                    <Text className="font-mono text-xs">{escrow.buyer}</Text>
                    <button onClick={() => copyToClipboard(escrow.buyer)} className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded">
                      <Copy size={12} className="text-neutral-400" />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <Text variant="muted" className="text-sm font-medium">Seller</Text>
                  <div className="flex items-center gap-2">
                    <Text className="font-mono text-xs">{escrow.seller}</Text>
                    <button onClick={() => copyToClipboard(escrow.seller)} className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded">
                      <Copy size={12} className="text-neutral-400" />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <Text variant="muted" className="text-sm font-medium">Agent</Text>
                  {escrow.agent ? (
                    <div className="flex items-center gap-2">
                      <Text className="font-mono text-xs">{escrow.agent}</Text>
                      <button onClick={() => copyToClipboard(escrow.agent!)} className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded">
                        <Copy size={12} className="text-neutral-400" />
                      </button>
                    </div>
                  ) : (
                    <Text variant="muted" className="text-sm italic">Not assigned</Text>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Activity Timeline */}
          <Card variant="elevated">
            <CardHeader>
              <Heading level={3} className="text-lg">Activity Timeline</Heading>
            </CardHeader>
            <CardBody>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-success-500 shadow-[0_0_0_4px_rgba(34,197,94,0.1)]" />
                    <div className="w-px flex-1 bg-neutral-200 dark:bg-neutral-800 my-1" />
                  </div>
                  <div className="pb-2">
                    <Text className="text-sm font-semibold">
                      {escrow.fundedAt ? "Escrow Created & Funded" : "Escrow Created"}
                    </Text>
                    <Text variant="muted" className="text-xs flex items-center gap-1 mt-0.5">
                      <Clock size={10} />
                      {new Date(Number(escrow.fundedAt || escrow.createdAt) * 1000).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </Text>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full border-2 border-neutral-300 dark:border-neutral-700 bg-[var(--bg-primary)]" />
                  </div>
                  <div>
                    <Text variant="muted" className="text-sm">Awaiting delivery or next action...</Text>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right Column - Actions */}
        <div className="space-y-6">
          {/* Actions Card */}
          <Card variant="elevated" className="border-primary-500/10">
            <CardHeader>
              <Heading level={3} className="text-lg">Escrow Actions</Heading>
            </CardHeader>
            <CardBody className="space-y-3">
              <Button className="w-full" disabled={escrow.state !== "FUNDED"}>
                Release Funds
              </Button>
              <Button variant="outline" className="w-full" disabled={escrow.state !== "FUNDED"}>
                Open Dispute
              </Button>
              <Button variant="ghost" className="w-full text-error-500 hover:bg-error-50 dark:hover:bg-error-900/10" disabled={escrow.state !== "FUNDED"}>
                Request Refund
              </Button>
            </CardBody>
          </Card>

          {/* Time Info */}
          <Card variant="outlined" className="bg-primary-50/5 dark:bg-primary-900/5">
            <CardBody className="p-5">
              <div className="space-y-4">
                <div className="space-y-1">
                  <Text variant="muted" className="text-xs uppercase font-bold tracking-wider">Buyer Protection</Text>
                  <Text className="font-semibold text-sm">
                    {hasProtection
                      ? `Ends on ${expiryDateFormatted}`
                      : "No protection duration set"}
                  </Text>
                  {hasProtection && (
                    <Text variant="muted" className="text-[10px]">
                      Duration: {formatDuration(protectionSeconds)}
                    </Text>
                  )}
                </div>
                <div className="h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-primary-500 rounded-full transition-all duration-1000`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <Text variant="muted" className={`text-xs ${isExpired && hasProtection ? "text-error-500 font-medium" : ""}`}>
                  {getRemainingText()}
                </Text>
              </div>
            </CardBody>
          </Card>

          {/* Contract Info */}
          <Card variant="outlined">
            <CardBody className="p-5">
              <Text variant="muted" className="text-xs uppercase font-bold tracking-wider mb-2">Contract Address</Text>
              <div className="flex items-center justify-between gap-2 p-2 bg-neutral-50 dark:bg-neutral-800/50 rounded border border-[var(--border-secondary)]">
                <code className="text-[10px] text-[var(--text-primary)] truncate">
                  {escrow.id}
                </code>
                <button onClick={() => copyToClipboard(escrow.id)} className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded flex-shrink-0">
                  <Copy size={12} className="text-neutral-400" />
                </button>
              </div>
              <a
                href={`https://sepolia.etherscan.io/address/${escrow.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary-500 hover:text-primary-600 font-semibold mt-3 flex items-center gap-1 transition-colors"
              >
                View on Explorer
                <ExternalLink size={10} />
              </a>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
