"use client";

import { VERSION, COMMIT_HASH, getCommitUrl, IS_DEV_BUILD } from "@/lib/version";

interface VersionInfoProps {
  /** Additional CSS classes */
  className?: string;
  /** Show full version string or compact */
  compact?: boolean;
}

/**
 * Displays application version and commit hash
 * 
 * Format: v0.1.0 · abc123f (hash is clickable to GitHub)
 * In dev: v0.1.0 · dev
 */
export function VersionInfo({ className = "", compact = false }: VersionInfoProps) {
  const commitUrl = getCommitUrl();
  
  return (
    <div 
      className={`text-xs text-[var(--text-tertiary)] ${className}`}
    >
      {compact ? (
        <span>v{VERSION}</span>
      ) : (
        <>
          <span>v{VERSION}</span>
          <span className="mx-1.5">·</span>
          {commitUrl && !IS_DEV_BUILD ? (
            <a
              href={commitUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--text-secondary)] hover:underline transition-colors font-mono"
              title="View commit on GitHub"
            >
              {COMMIT_HASH}
            </a>
          ) : (
            <span className="font-mono">{COMMIT_HASH}</span>
          )}
        </>
      )}
    </div>
  );
}
