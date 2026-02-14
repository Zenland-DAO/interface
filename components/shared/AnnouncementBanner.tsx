"use client";

import { useCallback, useSyncExternalStore, type ReactNode } from "react";
import { Badge } from "@/components/ui";

// ============================================================================
// Types
// ============================================================================

export interface AnnouncementBannerProps {
  /** Unique identifier for localStorage persistence */
  id: string;
  /** Badge text (e.g., "BETA", "NEW", "UPDATE") */
  badge?: string;
  /** Badge variant for styling */
  badgeVariant?: "primary" | "secondary" | "success" | "warning" | "danger" | "neutral";
  /** Main message content */
  children: ReactNode;
  /** Optional link configuration */
  link?: {
    href: string;
    text: string;
    external?: boolean;
  };
  /** Hours until banner reappears after dismissal (default: 24) */
  reappearAfterHours?: number;
  /** Whether the banner can be dismissed */
  dismissible?: boolean;
  /** Optional icon (emoji or component) */
  icon?: ReactNode;
  /** Callback when banner is dismissed */
  onDismiss?: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_PREFIX = "zenland_announcement_dismissed_";
const DEFAULT_REAPPEAR_HOURS = 24;

// ============================================================================
// External Store for Banner State
// ============================================================================

type BannerState = { isVisible: boolean; isClosing: boolean };
type BannerStates = Map<string, BannerState>;

const bannerStates: BannerStates = new Map();
let listeners: Array<() => void> = [];

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void): () => void {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getBannerState(id: string, reappearAfterHours: number): BannerState {
  const existing = bannerStates.get(id);
  if (existing) return existing;

  // Calculate initial visibility from localStorage
  const isVisible = shouldShowBanner(id, reappearAfterHours);
  const state: BannerState = { isVisible, isClosing: false };
  bannerStates.set(id, state);
  return state;
}

// Cached server snapshot to avoid infinite loop warning
const SERVER_SNAPSHOT: BannerState = { isVisible: false, isClosing: false };

function getServerSnapshot(): BannerState {
  // Don't show on server to avoid hydration mismatch
  return SERVER_SNAPSHOT;
}

function updateBannerState(id: string, updates: Partial<BannerState>) {
  const current = bannerStates.get(id) ?? { isVisible: true, isClosing: false };
  bannerStates.set(id, { ...current, ...updates });
  emitChange();
}

/**
 * Check if a banner should be shown based on localStorage timestamp
 */
function shouldShowBanner(id: string, reappearAfterHours: number): boolean {
  if (typeof window === "undefined") return false;

  const key = `${STORAGE_PREFIX}${id}`;
  const dismissedAt = localStorage.getItem(key);

  if (!dismissedAt) return true;

  const dismissedTime = parseInt(dismissedAt, 10);
  const now = Date.now();
  const hoursPassed = (now - dismissedTime) / (1000 * 60 * 60);

  return hoursPassed >= reappearAfterHours;
}

/**
 * Store dismissal timestamp in localStorage
 */
function storeDismissal(id: string): void {
  if (typeof window === "undefined") return;

  const key = `${STORAGE_PREFIX}${id}`;
  localStorage.setItem(key, Date.now().toString());
}

// ============================================================================
// Component
// ============================================================================

/**
 * AnnouncementBanner
 *
 * A reusable, dismissible announcement banner for displaying important
 * messages, updates, or calls to action at the top of the app.
 *
 * Features:
 * - Configurable dismissal with timed reappearance
 * - localStorage persistence
 * - Optional badge, icon, and external link
 * - Smooth animations
 * - Follows design system patterns
 *
 * @example
 * ```tsx
 * <AnnouncementBanner
 *   id="beta-launch"
 *   badge="BETA"
 *   icon="🛠️"
 *   link={{
 *     href: "https://t.me/zenlandofficial",
 *     text: "Join our Telegram",
 *     external: true,
 *   }}
 * >
 *   Help us make Zenland better! Found a bug or have feedback?
 * </AnnouncementBanner>
 * ```
 */
export function AnnouncementBanner({
  id,
  badge,
  badgeVariant = "primary",
  children,
  link,
  reappearAfterHours = DEFAULT_REAPPEAR_HOURS,
  dismissible = true,
  icon,
  onDismiss,
}: AnnouncementBannerProps) {
  // Use external store for SSR-safe state management
  const { isVisible, isClosing } = useSyncExternalStore(
    subscribe,
    () => getBannerState(id, reappearAfterHours),
    getServerSnapshot
  );

  const handleDismiss = useCallback(() => {
    updateBannerState(id, { isClosing: true });

    // Wait for animation to complete
    setTimeout(() => {
      storeDismissal(id);
      updateBannerState(id, { isVisible: false, isClosing: false });
      onDismiss?.();
    }, 300);
  }, [id, onDismiss]);

  // Don't render if not visible
  if (!isVisible) return null;

  return (
    <div
      role="banner"
      aria-label="Announcement"
      className={`
        relative w-full overflow-hidden
        bg-gradient-to-r from-primary-500/10 via-primary-400/5 to-primary-500/10
        dark:from-primary-500/15 dark:via-primary-400/8 dark:to-primary-500/15
        border-b border-primary-200/30 dark:border-primary-700/30
        transition-all duration-300 ease-out
        ${isClosing ? "opacity-0 -translate-y-full" : "opacity-100 translate-y-0"}
      `}
    >
      {/* Subtle shine effect */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent 
                   dark:via-white/3 pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto px-4 py-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-3 text-sm">
          {/* Icon */}
          {icon && (
            <span className="flex-shrink-0 text-base" aria-hidden="true">
              {icon}
            </span>
          )}

          {/* Badge */}
          {badge && (
            <Badge variant={badgeVariant} size="sm">
              {badge}
            </Badge>
          )}

          {/* Message */}
          <p className="text-[var(--text-primary)] font-medium">{children}</p>

          {/* Link */}
          {link && (
            <a
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
              className="
                inline-flex items-center gap-1.5 
                text-primary-600 dark:text-primary-400 
                font-semibold hover:underline underline-offset-2
                transition-colors duration-200
                flex-shrink-0
              "
            >
              {link.text}
              {link.external && (
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              )}
            </a>
          )}

          {/* Dismiss button */}
          {dismissible && (
            <button
              type="button"
              onClick={handleDismiss}
              className="
                absolute right-2 top-1/2 -translate-y-1/2
                sm:relative sm:right-auto sm:top-auto sm:translate-y-0
                ml-auto sm:ml-4 p-1.5 rounded-md
                text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                hover:bg-neutral-500/10 dark:hover:bg-neutral-400/10
                transition-colors duration-200
                focus:outline-none focus-visible:ring-2 
                focus-visible:ring-primary-500 focus-visible:ring-offset-1
              "
              aria-label="Dismiss announcement"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
