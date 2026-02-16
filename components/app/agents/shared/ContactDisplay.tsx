"use client";

import { Send, MessageCircle, Mail, Globe, Copy, Check, ExternalLink } from "lucide-react";
import { useState, useCallback } from "react";
import { parseContactString, type ParsedContactEntry } from "@/lib/agents/contactCodec";
import { Text, toast } from "@/components/ui";

// Platform configuration for icons and link generation
const PLATFORM_CONFIG: Record<string, {
  icon: React.ElementType;
  getLink: (value: string) => string | null;
  color: string;
  label: string;
}> = {
  telegram: {
    icon: Send,
    getLink: (value) => {
      const username = value.startsWith("@") ? value.slice(1) : value;
      return `https://t.me/${username}`;
    },
    color: "text-[#0088cc]",
    label: "Telegram",
  },
  discord: {
    icon: MessageCircle,
    getLink: () => null, // Discord usernames can't be linked directly
    color: "text-[#5865F2]",
    label: "Discord",
  },
  email: {
    icon: Mail,
    getLink: (value) => `mailto:${value}`,
    color: "text-[#EA4335]",
    label: "Email",
  },
};

const DEFAULT_PLATFORM = {
  icon: Globe,
  getLink: () => null,
  color: "text-[var(--text-secondary)]",
  label: "Contact",
};

interface ContactItemProps {
  entry: ParsedContactEntry;
  isPrimary: boolean;
  variant: "compact" | "expanded";
}

function ContactItem({ entry, isPrimary, variant }: ContactItemProps) {
  const [copied, setCopied] = useState(false);

  const platform = PLATFORM_CONFIG[entry.name.toLowerCase()] || DEFAULT_PLATFORM;
  const IconComponent = platform.icon;
  const link = platform.getLink(entry.value);

  const handleCopy = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(entry.value);
      setCopied(true);
      toast.success(`${platform.label} copied to clipboard`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  }, [entry.value, platform.label]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (link) {
      window.open(link, "_blank", "noopener,noreferrer");
    } else {
      handleCopy(e);
    }
  }, [link, handleCopy]);

  if (variant === "compact") {
    return (
      <button
        onClick={handleClick}
        className={`
          inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium
          transition-all duration-200 hover:scale-105
          ${isPrimary 
            ? "bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30" 
            : "bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700"
          }
        `}
        title={link ? `Open ${platform.label}` : `Copy ${platform.label}`}
      >
        <IconComponent size={12} className={platform.color} />
        <span className="text-[var(--text-secondary)] truncate max-w-[100px]">
          {entry.value}
        </span>
        {!link && (
          copied 
            ? <Check size={10} className="text-success-500" /> 
            : <Copy size={10} className="text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100" />
        )}
      </button>
    );
  }

  // Expanded variant for profile page
  return (
    <div
      className={`
        px-4 py-3 rounded-xl border flex items-center gap-3 cursor-pointer
        transition-all duration-200 hover:scale-[1.02] group
        ${isPrimary 
          ? "bg-primary-50/50 dark:bg-primary-900/10 border-primary-200 dark:border-primary-800 hover:border-primary-400 dark:hover:border-primary-600" 
          : "bg-neutral-50 dark:bg-neutral-800/50 border-[var(--border-secondary)] hover:border-neutral-400 dark:hover:border-neutral-600"
        }
      `}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleClick(e as unknown as React.MouseEvent)}
    >
      <div className={`
        w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110
        ${isPrimary 
          ? "bg-primary-500 text-white shadow-lg shadow-primary-500/20" 
          : "bg-neutral-200 dark:bg-neutral-700 text-[var(--text-secondary)]"
        }
      `}>
        <IconComponent size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <Text className="text-[10px] uppercase font-black tracking-tight opacity-50 leading-none mb-1">
          {isPrimary ? "Primary" : "Secondary"} · {platform.label}
        </Text>
        <Text className="font-semibold text-sm leading-none truncate">
          {entry.value}
        </Text>
      </div>
      <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        {link ? (
          <ExternalLink size={16} className="text-primary-500" />
        ) : copied ? (
          <Check size={16} className="text-success-500" />
        ) : (
          <Copy size={16} className="text-[var(--text-tertiary)]" />
        )}
      </div>
    </div>
  );
}

export interface ContactDisplayProps {
  /** Raw contact string from the blockchain (e.g., "telegram:@user;discord:@user") */
  contact: string | null | undefined;
  /** Display variant */
  variant?: "compact" | "expanded";
  /** Additional CSS classes */
  className?: string;
}

/**
 * Displays agent contact information with platform icons and clickable links.
 * 
 * Supports formats:
 * - New: "telegram:@username;discord:@username"
 * - Legacy: "contact1 | contact2"
 */
export function ContactDisplay({ 
  contact, 
  variant = "compact",
  className = "" 
}: ContactDisplayProps) {
  if (!contact?.trim()) {
    return variant === "expanded" ? (
      <Text variant="muted" className="italic">No contact information provided</Text>
    ) : null;
  }

  const entries = parseContactString(contact);
  
  if (entries.length === 0) {
    return variant === "expanded" ? (
      <Text variant="muted" className="italic">No contact information provided</Text>
    ) : null;
  }

  if (variant === "compact") {
    return (
      <div className={`flex flex-wrap items-center gap-2 ${className}`}>
        {entries.map((entry, idx) => (
          <ContactItem 
            key={`${entry.name}-${idx}`} 
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
          key={`${entry.name}-${idx}`} 
          entry={entry} 
          isPrimary={idx === 0}
          variant="expanded"
        />
      ))}
    </div>
  );
}
