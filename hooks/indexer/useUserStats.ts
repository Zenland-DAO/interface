"use client";

/**
 * These hooks are now provided by the SDK, so the interface doesn't need to
 * touch the Zenland client directly.
 */
export {
  useUserStats,
  useGlobalStats,
  type UserDashboardStats,
} from "@zenland/sdk/react";
