"use client";

import { useState, useMemo } from "react";
import { useConnection } from "wagmi";
import { useUserStats, useGlobalStats, type UserDashboardStats } from "./useUserStats";
import { useProtocolStats } from "./useProtocolStats";

export type DashboardViewMode = "personal" | "global";

export interface DashboardStats {
  activeCount: number;
  completedCount: number;
  disputeCount: number;
  tvl: bigint;
  recentEscrows: UserDashboardStats["recentEscrows"];
}

export interface UseDashboardStatsReturn {
  /** Current view mode */
  viewMode: DashboardViewMode;
  /** Toggle between personal and global view */
  setViewMode: (mode: DashboardViewMode) => void;
  /** Whether the user is connected (can toggle views) */
  isConnected: boolean;
  /** Dashboard stats based on current view mode */
  stats: DashboardStats | null;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
  /** Whether user stats are being fetched */
  isUserStatsLoading: boolean;
  /** Whether global stats are being fetched */
  isGlobalStatsLoading: boolean;
}

/**
 * Combined hook for dashboard statistics with toggle support.
 * 
 * - If wallet not connected: Shows global stats only
 * - If wallet connected: Shows personal stats by default, can toggle to global
 * 
 * Automatically handles data fetching and combines user stats with protocol stats.
 */
export function useDashboardStats(): UseDashboardStatsReturn {
  const { address } = useConnection();
  const isConnected = !!address;
  
  // Default to personal view when connected, global otherwise
  const [viewMode, setViewMode] = useState<DashboardViewMode>(
    isConnected ? "personal" : "global"
  );

  // Fetch user-specific stats (only when connected and in personal mode)
  const {
    data: userStats,
    isLoading: isUserStatsLoading,
    error: userError,
  } = useUserStats(viewMode === "personal" ? address : undefined);

  // Fetch global stats (for global view or when user not connected)
  const {
    data: globalStats,
    isLoading: isGlobalStatsLoading,
    error: globalError,
  } = useGlobalStats();

  // Fetch protocol stats for global TVL
  const {
    data: protocolStats,
    isLoading: isProtocolStatsLoading,
    error: protocolError,
  } = useProtocolStats();

  // Combine stats based on view mode
  const stats = useMemo<DashboardStats | null>(() => {
    if (viewMode === "personal" && isConnected) {
      // Personal view: use user stats
      if (!userStats) return null;
      
      return {
        activeCount: userStats.activeCount,
        completedCount: userStats.completedCount,
        disputeCount: userStats.disputeCount,
        tvl: userStats.tvl,
        recentEscrows: userStats.recentEscrows,
      };
    } else {
      // Global view: combine global stats with protocol TVL
      if (!globalStats || !protocolStats) return null;
      
      return {
        activeCount: globalStats.activeCount,
        completedCount: globalStats.completedCount,
        disputeCount: globalStats.disputeCount,
        tvl: protocolStats.currentTVL,
        recentEscrows: globalStats.recentEscrows,
      };
    }
  }, [viewMode, isConnected, userStats, globalStats, protocolStats]);

  // Combined loading state
  const isLoading = viewMode === "personal" && isConnected
    ? isUserStatsLoading
    : isGlobalStatsLoading || isProtocolStatsLoading;

  // Combined error state
  const error = viewMode === "personal" && isConnected
    ? userError
    : globalError ?? protocolError;

  return {
    viewMode: isConnected ? viewMode : "global",
    setViewMode: (mode) => {
      if (isConnected) {
        setViewMode(mode);
      }
    },
    isConnected,
    stats,
    isLoading,
    error: error as Error | null,
    isUserStatsLoading,
    isGlobalStatsLoading: isGlobalStatsLoading || isProtocolStatsLoading,
  };
}
