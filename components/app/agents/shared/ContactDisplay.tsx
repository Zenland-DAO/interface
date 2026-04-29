"use client";

import { Copy, Check, ExternalLink } from "lucide-react";
import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";

import { parseContactString, type ParsedContactEntry } from "@/lib/agents/contactCodec";
import { resolveContactPlatform, type ContactPlatform } from "@/lib/agents/contactPlatforms";
import { Text, toast } from "@/components/ui";

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Resolve the i18n label for a platform. Falls back to a humanized version of
 * the raw name if the translation is missing (so unknown platforms still get
 * a sensible label instead of "contact").
 */
function usePlatformLabel(platform: ContactPlatform, rawName: string): string {
  const t = useTranslations("agents.shared.contact");
  // Try the platform's labelKey, fall back gracefully for unknown ones.
  let label: string;
  try {
    label = t(platform.labelKey);
  } catch {
    label = "";
  }
  if (label && label !== platform.labelKey) return label;

  // Generic fallback: humanize the raw stored name.
  const humanized = rawName?.trim();
  if (humanized) {
    return humanized.charAt(0).toUpperCase() + humanized.slice(1);
  }
  // Last resort: localized "Contact"
  try {
    return t("contact");
  } catch {
    return "Contact";
  }
}

// =============================================================================
// CONTACT ITEM
// =============================================================================

interface ContactItemProps {
  entry: ParsedContactEntry;
  isPrimary: boolean;
  variant: "compact" | "expanded";
}

function ContactItem({ entry, isPrimary, variant }: ContactItemProps) {
  const [copied, setCopied] = useState(false);
  const t = useTranslations("agents.shared.contact");

  const platform = resolveContactPlatform(entry.name);
  const label = usePlatformLabel(platform, entry.name);
  const Mark = platform.Mark;
  const link = platform.getLink ? platform.getLink(entry.value) : null;

  const handleCopy = useCallback(async (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(entry.value);
      setCopied(true);
      toast.success(t("copiedToClipboard", { label }));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t("failedToCopy"));
    }
  }, [entry.value, label, t]);

  const handleClick = useCallback((e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    if (link) {
      e.preventDefault();
      window.open(link, "_blank", "noopener,noreferrer");
    } else {
      handleCopy(e);
    }
  }, [link, handleCopy]);

  const ariaLabel = link
    ? `${label}: ${entry.value} (open in new tab)`
    : `${label}: ${entry.value} (click to copy)`;

  // ---------------------------------------------------------------------------
  // COMPACT VARIANT — used in agent list cards
  // ---------------------------------------------------------------------------
  if (variant === "compact") {
    const TrailingIcon = link ? ExternalLink : copied ? Check : Copy;

    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label={ariaLabel}
        title={ariaLabel}
        style={{
          // Brand-tinted background. The CSS variable approach lets us swap
          // light/dark variants without inline JS.
          ["--brand-color" as string]: platform.brandColor,
          ["--brand-bg-light" as string]: platform.brandBgLight,
          ["--brand-bg-dark" as string]: platform.brandBgDark,
        }}
        className={`
          group/contact relative inline-flex items-center gap-1.5
          px-2 py-1 rounded-lg text-xs font-medium
          border border-transparent
          transition-all duration-200
          hover:scale-[1.04] hover:border-[color:var(--brand-color)]/30
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand-color)]/40
          bg-[color:var(--brand-bg-light)] dark:bg-[color:var(--brand-bg-dark)]
          ${isPrimary ? "ring-1 ring-[color:var(--brand-color)]/20" : ""}
        `}
      >
        <Mark width={12} height={12} style={{ color: platform.brandColor }} className="shrink-0" />
        <span className="text-[var(--text-primary)] truncate max-w-[120px]">
          {entry.value}
        </span>
        <TrailingIcon
          size={10}
          className={`shrink-0 transition-opacity ${
            copied ? "text-success-500 opacity-100" : "text-[var(--text-tertiary)] opacity-60 group-hover/contact:opacity-100"
          }`}
        />
      </button>
    );
  }

  // ---------------------------------------------------------------------------
  // EXPANDED VARIANT — used on agent profile page
  // ---------------------------------------------------------------------------
  const TrailingIcon = copied ? Check : link ? ExternalLink : Copy;
  const trailingIconColor = copied
    ? "text-success-500"
    : "text-[var(--text-tertiary)]";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick(e);
        }
      }}
      aria-label={ariaLabel}
      style={{
        ["--brand-color" as string]: platform.brandColor,
        ["--brand-bg-light" as string]: platform.brandBgLight,
        ["--brand-bg-dark" as string]: platform.brandBgDark,
      }}
      className={`
        group relative px-4 py-3 rounded-xl border cursor-pointer
        transition-all duration-200 hover:-translate-y-0.5
        flex items-center gap-3
        bg-[color:var(--brand-bg-light)] dark:bg-[color:var(--brand-bg-dark)]
        border-[color:var(--brand-color)]/20
        hover:border-[color:var(--brand-color)]/50
        hover:shadow-md hover:shadow-[color:var(--brand-color)]/10
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand-color)]/40
      `}
    >
      {/* Primary marker — small dot in the corner */}
      {isPrimary && (
        <span
          className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ring-2 ring-[var(--bg-primary)]"
          style={{ backgroundColor: platform.brandColor }}
          aria-hidden="true"
        />
      )}

      {/* Brand-tile icon */}
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
        style={{
          backgroundColor: platform.brandColor,
          boxShadow: `0 4px 12px -4px ${platform.brandColor}66`,
        }}
      >
        <Mark width={18} height={18} className="text-white" />
      </div>

      {/* Label + value */}
      <div className="flex-1 min-w-0">
        <Text className="text-[10px] uppercase font-black tracking-wider opacity-60 leading-none mb-1.5">
          {isPrimary ? `${t("primary")} · ${label}` : label}
        </Text>
        <Text className="font-semibold text-sm leading-tight truncate text-[var(--text-primary)]">
          {entry.value}
        </Text>
      </div>

      {/* Trailing action icon */}
      <div className="shrink-0 transition-opacity opacity-50 group-hover:opacity-100">
        <TrailingIcon size={16} className={trailingIconColor} />
      </div>
    </div>
  );
}

// =============================================================================
// PUBLIC API
// =============================================================================

export interface ContactDisplayProps {
  /** Raw contact string from the blockchain (e.g., "telegram:@user;discord:@user"). */
  contact: string | null | undefined;
  /** Display variant. */
  variant?: "compact" | "expanded";
  /** Additional CSS classes. */
  className?: string;
}

/**
 * Displays agent contact information with platform icons and clickable links.
 *
 * Recognised platforms (and aliases): telegram (`tg`, `tgram`), discord
 * (`dc`, `disc`), email (`mail`, `e-mail`), bitcointalk (`bct`, `btctalk`),
 * and blackhatworld (`bhw`, `blackhat`).
 *
 * Anything else still renders nicely via a generic fallback.
 *
 * Supported on-chain formats:
 *   - New:    "telegram:@username;discord:@username"
 *   - Legacy: "contact1 | contact2"
 */
export function ContactDisplay({
  contact,
  variant = "compact",
  className = "",
}: ContactDisplayProps) {
  const t = useTranslations("agents.shared.contact");

  if (!contact?.trim()) {
    return variant === "expanded" ? (
      <Text variant="muted" className="italic">{t("noContactInfo")}</Text>
    ) : null;
  }

  const entries = parseContactString(contact);

  if (entries.length === 0) {
    return variant === "expanded" ? (
      <Text variant="muted" className="italic">{t("noContactInfo")}</Text>
    ) : null;
  }

  if (variant === "compact") {
    return (
      <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
        {entries.map((entry, idx) => (
          <ContactItem
            key={`${entry.name || "unknown"}-${idx}`}
            entry={entry}
            isPrimary={idx === 0}
            variant="compact"
          />
        ))}
      </div>
    );
  }

  // Expanded variant - grid layout for consistent widths
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${className}`}>
      {entries.map((entry, idx) => (
        <ContactItem
          key={`${entry.name || "unknown"}-${idx}`}
          entry={entry}
          isPrimary={idx === 0}
          variant="expanded"
        />
      ))}
    </div>
  );
}
