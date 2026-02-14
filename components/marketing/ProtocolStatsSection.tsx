"use client";

import { useEffect, useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { 
  Link2, 
  ExternalLink, 
  TrendingUp, 
  Shield, 
  Lock,
  Zap,
  Users,
  Box,
  Activity,
  Code2,
  Clock
} from "lucide-react";
import { Container, Card, CardBody } from "@/components/ui";
import { NetworkBadge } from "@/components/shared/NetworkBadge";
import { useProtocolStats } from "@/hooks/indexer/useProtocolStats";
import { useRecentEscrows, type RecentEscrow } from "@/hooks/indexer/useRecentEscrows";
import { formatUsdValue, formatCompactNumber } from "@/lib/utils/format";
import { AnimateOnScroll } from "@/hooks";

/**
 * Indexer API URL for the "Data source" link.
 */
const INDEXER_API_URL = "https://api.zen.land";

/**
 * Block explorer URL for verification links.
 */
const BLOCK_EXPLORER_URL = "https://etherscan.io";

// ============================================
// ANIMATED COUNT-UP COMPONENT
// ============================================

interface AnimatedNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  formatter?: (value: number) => string;
}

function AnimatedNumber({ 
  value, 
  prefix = "", 
  suffix = "", 
  decimals = 0,
  duration = 2000,
  formatter,
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (hasAnimated || value === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setHasAnimated(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    const currentElement = elementRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => observer.disconnect();
  }, [value, hasAnimated]);

  useEffect(() => {
    if (!hasAnimated || value === 0) return;

    const startTime = performance.now();
    let frameId: number;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out quart for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 4);
      
      setDisplayValue(value * eased);

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [hasAnimated, value, duration]);

  const formatValue = () => {
    if (formatter) {
      return `${prefix}${formatter(displayValue)}${suffix}`;
    }
    
    const formatted = decimals === 0 
      ? Math.round(displayValue).toLocaleString()
      : displayValue.toLocaleString(undefined, { 
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals 
        });
    
    return `${prefix}${formatted}${suffix}`;
  };

  return <span ref={elementRef}>{formatValue()}</span>;
}

// ============================================
// HERO STAT CARD COMPONENT
// ============================================

interface HeroStatProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subValue?: string;
  isLoading?: boolean;
  animated?: boolean;
  animatedValue?: number;
  prefix?: string;
  suffix?: string;
  formatter?: (value: number) => string;
}

function HeroStat({ 
  icon, 
  label, 
  value, 
  subValue, 
  isLoading,
  animated = false,
  animatedValue,
  prefix = "",
  suffix = "",
  formatter,
}: HeroStatProps) {
  return (
    <div className="relative group">
      {/* Gradient background on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative p-6 text-center">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-500/10 text-primary-500 mb-4">
          {icon}
        </div>
        
        {/* Value */}
        {isLoading ? (
          <div className="h-12 w-28 mx-auto bg-neutral-200 dark:bg-neutral-700 rounded-lg animate-pulse" />
        ) : (
          <p className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)] tracking-tight mb-1">
            {animated && animatedValue !== undefined ? (
              <AnimatedNumber 
                value={animatedValue} 
                prefix={prefix} 
                suffix={suffix}
                formatter={formatter}
              />
            ) : (
              value
            )}
          </p>
        )}
        
        {/* Label */}
        <p className="text-sm font-medium text-[var(--text-secondary)] mb-1">{label}</p>
        
        {/* Sub value */}
        {subValue && (
          <p className="text-xs text-[var(--text-tertiary)]">{subValue}</p>
        )}
      </div>
    </div>
  );
}

// ============================================
// SECONDARY STAT COMPONENT
// ============================================

interface SecondaryStatProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  isLoading?: boolean;
}

function SecondaryStat({ icon, label, value, isLoading }: SecondaryStatProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-secondary)]">
        {icon}
      </div>
      <div className="min-w-0">
        {isLoading ? (
          <div className="h-5 w-16 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
        ) : (
          <p className="text-lg font-semibold text-[var(--text-primary)] truncate">{value}</p>
        )}
        <p className="text-xs text-[var(--text-tertiary)]">{label}</p>
      </div>
    </div>
  );
}

// ============================================
// TRUST BADGE COMPONENT
// ============================================

interface TrustBadgeProps {
  icon: React.ReactNode;
  label: string;
  href?: string;
}

function TrustBadge({ icon, label, href }: TrustBadgeProps) {
  const content = (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--bg-tertiary)] border border-[var(--border-secondary)] text-xs font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--border-primary)] hover:text-[var(--text-primary)]">
      {icon}
      <span>{label}</span>
      {href && <ExternalLink className="w-3 h-3 opacity-50" />}
    </div>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  return content;
}

// ============================================
// ACTIVITY FEED ITEM COMPONENT
// ============================================

interface ActivityItemProps {
  escrow: RecentEscrow;
  isNew?: boolean;
}

function ActivityItem({ escrow, isNew }: ActivityItemProps) {
  const t = useTranslations("marketing.protocolStats.activity");

  // Format the amount (assuming stablecoin with 6 decimals)
  const formattedAmount = formatUsdValue(escrow.amount, { compact: true });
  
  // Calculate time ago
  const now = BigInt(Math.floor(Date.now() / 1000));
  const secondsAgo = Number(now - escrow.createdAt);
  
  const getTimeAgo = () => {
    if (secondsAgo < 60) return t("timeAgo.justNow");
    if (secondsAgo < 3600) return t("timeAgo.minutes", { count: Math.floor(secondsAgo / 60) });
    if (secondsAgo < 86400) return t("timeAgo.hours", { count: Math.floor(secondsAgo / 3600) });

    return t("timeAgo.days", { count: Math.floor(secondsAgo / 86400) });
  };

  // Get state indicator
  const getStateColor = () => {
    switch (escrow.state) {
      case "PENDING":
      case "ACTIVE":
        return "bg-warning-500";
      case "RELEASED":
      case "AGENT_RESOLVED":
        return "bg-success-500";
      case "DISPUTED":
      case "AGENT_INVITED":
        return "bg-error-500";
      default:
        return "bg-neutral-500";
    }
  };

  return (
    <div className={`
      flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-500
      ${isNew ? "bg-primary-500/10 animate-pulse" : "hover:bg-[var(--state-hover)]"}
    `}>
      {/* State indicator */}
      <div className={`w-2 h-2 rounded-full ${getStateColor()}`} />
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium text-[var(--text-primary)]">
          {formattedAmount}
        </span>
        <span className="text-sm text-[var(--text-tertiary)]"> {t("escrowed")}</span>
      </div>
      
      {/* Time */}
      <span className="text-xs text-[var(--text-tertiary)] whitespace-nowrap">
        {getTimeAgo()}
      </span>
    </div>
  );
}

// ============================================
// ACTIVITY FEED COMPONENT
// ============================================

interface ActivityFeedProps {
  escrows: RecentEscrow[];
  isLoading?: boolean;
}

function ActivityFeed({ escrows, isLoading }: ActivityFeedProps) {
  const t = useTranslations("marketing.protocolStats.activity");

  const previousIdsRef = useRef<Set<string>>(new Set());
  const [newIds, setNewIds] = useState<Set<string>>(new Set());

  // Track new escrows for highlighting
  useEffect(() => {
    if (escrows.length === 0) return;
    
    const currentIds = new Set(escrows.map(e => e.id));
    const newOnes = new Set<string>();
    
    currentIds.forEach(id => {
      if (previousIdsRef.current.size > 0 && !previousIdsRef.current.has(id)) {
        newOnes.add(id);
      }
    });
    
    // Update ref immediately (no re-render needed)
    previousIdsRef.current = currentIds;
    
    if (newOnes.size > 0) {
      // Use setTimeout to batch state update outside of effect
      const timeoutId = setTimeout(() => {
        setNewIds(newOnes);
        // Clear new status after animation
        setTimeout(() => setNewIds(new Set()), 3000);
      }, 0);
      
      return () => clearTimeout(timeoutId);
    }
  }, [escrows]);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2">
            <div className="w-2 h-2 rounded-full bg-neutral-300 dark:bg-neutral-600 animate-pulse" />
            <div className="h-4 flex-1 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
            <div className="h-3 w-12 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (escrows.length === 0) {
    return (
      <div className="text-center py-4 text-sm text-[var(--text-tertiary)]">
        {t("noActivity")}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {escrows.slice(0, 5).map((escrow) => (
        <ActivityItem 
          key={escrow.id} 
          escrow={escrow} 
          isNew={newIds.has(escrow.id)}
        />
      ))}
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

/**
 * ProtocolStatsSection - Enhanced trust-building section with live on-chain protocol statistics.
 * 
 * Features:
 * - Hero stats with animated count-up numbers
 * - Secondary stats row with icons
 * - Trust badges (on-chain, open source, etc.)
 * - Real-time activity feed showing recent escrows
 * - Network indicator and data source link
 */
export function ProtocolStatsSection() {
  const t = useTranslations("marketing.protocolStats");

  const { data: stats, isLoading: statsLoading, error: statsError } = useProtocolStats();
  const { data: recentEscrows, isLoading: escrowsLoading } = useRecentEscrows(5);

  // Calculate derived values
  const totalVolumeUsd = stats?.totalVolumeEscrowed 
    ? parseFloat((Number(stats.totalVolumeEscrowed) / 1_000_000).toFixed(0)) // Convert from 6 decimals
    : 0;
  
  const currentTvlUsd = stats?.currentTVL 
    ? parseFloat((Number(stats.currentTVL) / 1_000_000).toFixed(0))
    : 0;

  // Calculate success rate (released / total completed)
  // For now, we'll show a placeholder or compute from available data
  const successIndicator = t("stats.security.value");

  // Format values for display
  const formattedStats = {
    tvl: stats?.currentTVL ? formatUsdValue(stats.currentTVL, { compact: true }) : "$0",
    volume: stats?.totalVolumeEscrowed ? formatUsdValue(stats.totalVolumeEscrowed, { compact: true }) : "$0",
    totalEscrows: stats?.totalEscrowsCreated ?? 0,
    activeEscrows: stats?.activeEscrowCount ?? 0,
    agents: stats?.totalAgentsRegistered ?? 0,
    activeAgents: stats?.activeAgentsCount ?? 0,
  };

  // Don't render if there's an error (fail gracefully)
  if (statsError) {
    return null;
  }

  return (
    <section id="stats" className="py-16 sm:py-20 lg:py-24">
      <Container>
        <AnimateOnScroll animation="fade-up">
          {/* Section Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-4 rounded-full bg-success-500/10 border border-success-500/20">
              <span className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-success-600 dark:text-success-400">
                {t("badge")}
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-3">
              {t("title")}
            </h2>
            <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
              {t("subtitle")}
            </p>
          </div>

          <Card 
            variant="default" 
            className="overflow-hidden border-[var(--border-secondary)] shadow-lg"
          >
            <CardBody className="p-0">
              {/* Header with network badge */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-6 py-4 border-b border-[var(--border-primary)] bg-gradient-to-r from-[var(--bg-tertiary)] to-[var(--bg-secondary)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-primary-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--text-primary)]">{t("header.title")}</h3>
                    <p className="text-xs text-[var(--text-tertiary)]">{t("header.subtitle")}</p>
                  </div>
                </div>
                <NetworkBadge size="sm" />
              </div>

              {/* Hero Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[var(--border-primary)] bg-[var(--bg-secondary)]">
                <HeroStat
                  icon={<Lock className="w-6 h-6" />}
                  label={t("stats.tvl.label")}
                  value={formattedStats.tvl}
                  animated={true}
                  animatedValue={currentTvlUsd}
                  prefix="$"
                  formatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(1)}K` : Math.round(val).toLocaleString()}
                  subValue={t("stats.tvl.subValue")}
                  isLoading={statsLoading}
                />
                <HeroStat
                  icon={<TrendingUp className="w-6 h-6" />}
                  label={t("stats.volume.label")}
                  value={formattedStats.volume}
                  animated={true}
                  animatedValue={totalVolumeUsd}
                  prefix="$"
                  suffix="+"
                  formatter={(val) => val >= 1000000 ? `${(val / 1000000).toFixed(1)}M` : val >= 1000 ? `${(val / 1000).toFixed(1)}K` : Math.round(val).toLocaleString()}
                  subValue={t("stats.volume.subValue")}
                  isLoading={statsLoading}
                />
                <HeroStat
                  icon={<Shield className="w-6 h-6" />}
                  label={t("stats.security.label")}
                  value={successIndicator}
                  subValue={t("stats.security.subValue")}
                  isLoading={statsLoading}
                />
              </div>

              {/* Secondary Stats + Activity Feed */}
              <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[var(--border-primary)]">
                {/* Secondary Stats */}
                <div className="p-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)] px-4 mb-3">{t("metrics.title")}</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <SecondaryStat
                      icon={<Box className="w-4 h-4" />}
                      label={t("metrics.escrowsCreated")}
                      value={formatCompactNumber(formattedStats.totalEscrows)}
                      isLoading={statsLoading}
                    />
                    <SecondaryStat
                      icon={<Zap className="w-4 h-4" />}
                      label={t("metrics.activeNow")}
                      value={formattedStats.activeEscrows}
                      isLoading={statsLoading}
                    />
                    <SecondaryStat
                      icon={<Users className="w-4 h-4" />}
                      label={t("metrics.registeredAgents")}
                      value={formattedStats.agents}
                      isLoading={statsLoading}
                    />
                    <SecondaryStat
                      icon={<Clock className="w-4 h-4" />}
                      label={t("metrics.availableAgents")}
                      value={formattedStats.activeAgents}
                      isLoading={statsLoading}
                    />
                  </div>
                </div>

                {/* Activity Feed */}
                <div className="p-4">
                  <div className="flex items-center justify-between px-4 mb-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                      {t("activity.title")}
                    </h4>
                    <div className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse" />
                      <span>{t("activity.live")}</span>
                    </div>
                  </div>
                  <ActivityFeed 
                    escrows={recentEscrows ?? []} 
                    isLoading={escrowsLoading} 
                  />
                </div>
              </div>

              {/* Trust Badges */}
              <div className="px-6 py-4 border-t border-[var(--border-primary)] bg-[var(--bg-tertiary)]">
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <TrustBadge 
                    icon={<Link2 className="w-3.5 h-3.5" />} 
                    label={t("trustBadges.onChain")} 
                    href={`${BLOCK_EXPLORER_URL}/address/0x11c6bb595824014e1c11c6b4a6ad2095cf7d22ab`}
                  />
                  <TrustBadge 
                    icon={<Code2 className="w-3.5 h-3.5" />} 
                    label={t("trustBadges.openSource")} 
                    href="https://github.com/zenland-dao"
                  />
                  <TrustBadge 
                    icon={<Shield className="w-3.5 h-3.5" />} 
                    label={t("trustBadges.nonCustodial")} 
                  />
                  <TrustBadge 
                    icon={<Zap className="w-3.5 h-3.5" />} 
                    label={t("trustBadges.gasOptimized")} 
                  />
                </div>
              </div>

              {/* Footer with indexer link */}
              <div className="px-6 py-3 border-t border-[var(--border-primary)] bg-[var(--bg-secondary)]">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[var(--text-tertiary)]">
                  <span>{t("footer.updateInterval")}</span>
                  <a
                    href={INDEXER_API_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 hover:text-[var(--text-secondary)] transition-colors"
                  >
                    <span>{t("footer.poweredBy")}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </CardBody>
          </Card>
        </AnimateOnScroll>
      </Container>
    </section>
  );
}
