/**
 * Contact platform registry.
 *
 * Maps a platform "name" (as stored on-chain in the `name:value` contact
 * encoding) to a visual identity: brand mark (inline SVG), brand color,
 * display label, optional URL builder, and aliases.
 *
 * The display layer (ContactDisplay) calls `resolveContactPlatform(name)`
 * to look up branding for any contact entry. Unknown but *named* entries
 * fall back to a deterministic monogram chip so they remain visually
 * distinct from each other (e.g. "myrandomforum" gets a stable color +
 * "MY" monogram, while "daoforum" gets full brand identity). Truly empty
 * names (legacy free-form) get the polished generic globe fallback.
 */

import type { SVGProps } from "react";

// =============================================================================
// BRAND MARKS (inline SVGs)
// =============================================================================

type BrandMarkProps = SVGProps<SVGSVGElement>;

/** Telegram — paper plane brand mark. */
function TelegramMark(props: BrandMarkProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

/** Discord — official wordless brand mark. */
function DiscordMark(props: BrandMarkProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.873-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.331c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.974 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

/** Email — clean envelope mark. */
function EmailMark(props: BrandMarkProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </svg>
  );
}

/** Bitcointalk — Bitcoin "₿" mark inside a rounded square. */
function BitcointalkMark(props: BrandMarkProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M3 6.5C3 4.567 4.567 3 6.5 3h11C19.433 3 21 4.567 21 6.5v11c0 1.933-1.567 3.5-3.5 3.5h-11C4.567 21 3 19.433 3 17.5v-11Zm10.94 2.197V7h-1.346v1.654c-.354 0-.715.007-1.075.014V7H10.17v1.697c-.293.006-.58.012-.86.012H7.45L7.45 10.143s.99-.018.973-.001c.543 0 .72.315.771.587v1.933h.13c-.043 0-.087 0-.13.002v2.708c-.024.17-.123.443-.502.443.016.015-.973 0-.973 0l-.27 1.611h1.756c.327 0 .649.005.965.008V19h1.348v-1.539c.37.008.728.011 1.078.011L11.594 19h1.346v-1.541c2.27-.13 3.857-.701 4.054-2.823.16-1.71-.643-2.473-1.928-2.78.78-.395 1.268-1.094 1.157-2.262-.151-1.59-1.519-2.124-3.283-2.273Zm.488 6.949c0 .985-1.357.967-2.182.952l-.222-.005c-.026.001-.117 0-.235.001-.582.005-1.715.014-1.715-.014l.342-2.057s2.14-.001 2.74.001c.6.002 1.272.337 1.272 1.122Zm-.473-3.967c0 .9-1.13.882-1.815.871l-.18-.005c-.02 0-.083 0-.176.002-.467.005-1.461.013-1.461-.014l.31-1.872s1.788-.001 2.292.001c.504.002 1.03.32 1.03 1.017Z" />
    </svg>
  );
}

/** BlackHatWorld — top hat brand mark. */
function BlackHatWorldMark(props: BrandMarkProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M7.5 4.5C7.5 3.672 8.172 3 9 3h6c.828 0 1.5.672 1.5 1.5v8.25H21a.75.75 0 0 1 .75.75v3a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3v-3a.75.75 0 0 1 .75-.75h4.5V4.5Zm9 8.25V4.875A.375.375 0 0 0 16.125 4.5h-8.25a.375.375 0 0 0-.375.375v7.875h9Zm-12.75 1.5v2.25c0 .828.672 1.5 1.5 1.5h13.5c.828 0 1.5-.672 1.5-1.5v-2.25H3.75Zm10.875 1.125a.75.75 0 0 1 .75-.75h2.25a.75.75 0 0 1 0 1.5h-2.25a.75.75 0 0 1-.75-.75Z" />
    </svg>
  );
}

/**
 * DAO Forum — speech bubble with three dots punched through.
 *
 * Note: the dots are drawn as circular subpaths and combined via the
 * even-odd fill rule so they render as transparent holes regardless of
 * background. This keeps the mark legible on both the brand-tinted
 * compact pill and the solid brand-color expanded tile.
 */
function DaoforumMark(props: BrandMarkProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.5 3A2.5 2.5 0 0 0 6 5.5v6A2.5 2.5 0 0 0 8.5 14h.4l.4 2.5a.5.5 0 0 0 .8.32L13.6 14h1.9A2.5 2.5 0 0 0 18 11.5v-6A2.5 2.5 0 0 0 15.5 3h-7Zm.5 6.5a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4Zm3 0a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4Zm4.2-1.2a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0Z"
      />
    </svg>
  );
}


/** Twitter / X — official X glyph. */
function TwitterXMark(props: BrandMarkProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
    </svg>
  );
}

/** Reddit — Snoo-inspired wordless mark. */
function RedditMark(props: BrandMarkProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 2.5a1.75 1.75 0 0 1 1.75 1.75v3.32c1.7.08 3.27.43 4.6 1A2.5 2.5 0 1 1 21.7 11.6c.2.55.31 1.13.31 1.73 0 3.83-4.48 6.94-10 6.94S2 17.16 2 13.33c0-.6.1-1.18.31-1.73a2.5 2.5 0 1 1 3.34-3.03c1.34-.57 2.92-.92 4.6-1V4.25c0-.97.79-1.75 1.75-1.75ZM7.5 13.5a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0Zm6 0a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0Zm-6.4 2.6a.7.7 0 0 0-.2.97c1.05 1.7 3.04 2.55 5.1 2.55s4.05-.85 5.1-2.55a.7.7 0 1 0-1.18-.74c-.8 1.27-2.39 1.9-3.92 1.9s-3.13-.63-3.92-1.9a.7.7 0 0 0-.97-.23ZM15.5 4a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z" />
    </svg>
  );
}

/** Matrix — open-bracket "[m]" inspired mark. */
function MatrixMark(props: BrandMarkProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      {/* Outer brackets */}
      <path d="M5 3H3v18h2" />
      <path d="M19 3h2v18h-2" />
      {/* Inner "M" shape */}
      <path d="M7 17V8l3.5 4L14 8v9" />
    </svg>
  );
}

/** Signal — speech-balloon outline mark. */
function SignalMark(props: BrandMarkProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M12 3a9 9 0 0 1 7.7 13.66l.8 3.34-3.55-.78A9 9 0 1 1 12 3Z" />
    </svg>
  );
}

/** Generic fallback — globe with subtle ring (used for empty/unnamed legacy entries). */
function GenericMark(props: BrandMarkProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a13.5 13.5 0 0 1 0 18M12 3a13.5 13.5 0 0 0 0 18" />
    </svg>
  );
}

/**
 * Monogram mark — renders 1–2 capital letters from a name, centered.
 * Used as a deterministic fallback for unknown but *named* platforms,
 * so each unique name gets a distinctive, repeatable visual identity.
 */
function makeMonogramMark(letters: string): (props: BrandMarkProps) => React.ReactElement {
  const text = letters.slice(0, 2).toUpperCase() || "?";
  // Pick a font size so 1-letter monograms feel chunkier than 2-letter ones.
  const fontSize = text.length === 1 ? 14 : 11;
  const MonogramMark = (props: BrandMarkProps) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <text
        x="12"
        y="12"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={fontSize}
        fontWeight={800}
        fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
        fill="currentColor"
        letterSpacing="-0.5"
      >
        {text}
      </text>
    </svg>
  );
  MonogramMark.displayName = `MonogramMark(${text})`;
  return MonogramMark;
}

// =============================================================================
// REGISTRY
// =============================================================================

export interface ContactPlatform {
  /** Canonical name (matches what we render in labels and store on-chain). */
  canonical: string;
  /** Translation key under `agents.shared.contact`. */
  labelKey: string;
  /** React component for the brand mark. */
  Mark: (props: BrandMarkProps) => React.ReactElement;
  /** Brand foreground color (used for icon + accents). */
  brandColor: string;
  /** Brand background tint (used as a pill bg in light mode). */
  brandBgLight: string;
  /** Brand background tint (used as a pill bg in dark mode). */
  brandBgDark: string;
  /** Optional clickable URL builder. Return null to fall back to copy-to-clipboard. */
  getLink?: (value: string) => string | null;
  /** Common alternate names users might type. */
  aliases?: readonly string[];
  /** True if this is the catch-all generic fallback (empty/unnamed entries). */
  isGeneric?: boolean;
  /** True if this platform was synthesized at lookup-time for an unknown name. */
  isMonogram?: boolean;
}

const TELEGRAM: ContactPlatform = {
  canonical: "telegram",
  labelKey: "telegram",
  Mark: TelegramMark,
  brandColor: "#229ED9",
  brandBgLight: "rgba(34, 158, 217, 0.10)",
  brandBgDark: "rgba(34, 158, 217, 0.16)",
  getLink: (value) => {
    const username = value.trim().replace(/^@/, "");
    if (!username) return null;
    return `https://t.me/${encodeURIComponent(username)}`;
  },
  aliases: ["tg", "tgram"],
};

const DISCORD: ContactPlatform = {
  canonical: "discord",
  labelKey: "discord",
  Mark: DiscordMark,
  brandColor: "#5865F2",
  brandBgLight: "rgba(88, 101, 242, 0.10)",
  brandBgDark: "rgba(88, 101, 242, 0.18)",
  // Discord usernames are not directly linkable.
  aliases: ["dc", "disc"],
};

const EMAIL: ContactPlatform = {
  canonical: "email",
  labelKey: "email",
  Mark: EmailMark,
  brandColor: "#EA4335",
  brandBgLight: "rgba(234, 67, 53, 0.10)",
  brandBgDark: "rgba(234, 67, 53, 0.16)",
  getLink: (value) => {
    const v = value.trim();
    return v ? `mailto:${v}` : null;
  },
  aliases: ["mail", "e-mail"],
};

const BITCOINTALK: ContactPlatform = {
  canonical: "bitcointalk",
  labelKey: "bitcointalk",
  Mark: BitcointalkMark,
  brandColor: "#F7931A",
  brandBgLight: "rgba(247, 147, 26, 0.12)",
  brandBgDark: "rgba(247, 147, 26, 0.18)",
  // Bitcointalk profile URLs require numeric user IDs, not usernames.
  // We deliberately do not attempt to link — copying the username is the best UX.
  aliases: ["bct", "btctalk", "bitcoin-talk"],
};

const BLACKHATWORLD: ContactPlatform = {
  canonical: "blackhatworld",
  labelKey: "blackhatworld",
  Mark: BlackHatWorldMark,
  brandColor: "#C9201D",
  brandBgLight: "rgba(201, 32, 29, 0.10)",
  brandBgDark: "rgba(201, 32, 29, 0.18)",
  // BHW (XenForo) profile URLs need username + user-id; copy-only is safest.
  aliases: ["bhw", "blackhat", "blackhatworld-com"],
};

const DAOFORUM: ContactPlatform = {
  canonical: "daoforum",
  labelKey: "daoforum",
  Mark: DaoforumMark,
  brandColor: "#0B141C",
  brandBgLight: "rgba(11, 20, 28, 0.08)",
  brandBgDark: "rgba(255, 255, 255, 0.10)",
  // DAO Forum (XenForo) profile URLs include a numeric ID after the slug; copy-only is safest.
  aliases: ["dao", "daoforum-com", "daoforum-org"],
};

const TWITTER: ContactPlatform = {
  canonical: "twitter",
  labelKey: "twitter",
  Mark: TwitterXMark,
  brandColor: "#0F1419",
  brandBgLight: "rgba(15, 20, 25, 0.08)",
  brandBgDark: "rgba(255, 255, 255, 0.10)",
  getLink: (value) => {
    const handle = value.trim().replace(/^@/, "");
    if (!handle) return null;
    return `https://x.com/${encodeURIComponent(handle)}`;
  },
  aliases: ["x", "tw"],
};

const REDDIT: ContactPlatform = {
  canonical: "reddit",
  labelKey: "reddit",
  Mark: RedditMark,
  brandColor: "#FF4500",
  brandBgLight: "rgba(255, 69, 0, 0.10)",
  brandBgDark: "rgba(255, 69, 0, 0.18)",
  getLink: (value) => {
    const handle = value.trim().replace(/^(?:u\/|@)/i, "");
    if (!handle) return null;
    return `https://www.reddit.com/user/${encodeURIComponent(handle)}`;
  },
  aliases: ["rd", "r"],
};

const MATRIX: ContactPlatform = {
  canonical: "matrix",
  labelKey: "matrix",
  Mark: MatrixMark,
  brandColor: "#0DBD8B",
  brandBgLight: "rgba(13, 189, 139, 0.10)",
  brandBgDark: "rgba(13, 189, 139, 0.18)",
  getLink: (value) => {
    const v = value.trim();
    if (!v.startsWith("@") || !v.includes(":")) return null;
    return `https://matrix.to/#/${encodeURIComponent(v)}`;
  },
  aliases: ["mx"],
};

const SIGNAL: ContactPlatform = {
  canonical: "signal",
  labelKey: "signal",
  Mark: SignalMark,
  brandColor: "#3A76F0",
  brandBgLight: "rgba(58, 118, 240, 0.10)",
  brandBgDark: "rgba(58, 118, 240, 0.18)",
  // Signal usernames/phone numbers are not reliably web-linkable.
  aliases: ["sgnl"],
};

const GENERIC: ContactPlatform = {
  canonical: "contact",
  labelKey: "contact",
  Mark: GenericMark,
  brandColor: "#6366F1",
  brandBgLight: "rgba(99, 102, 241, 0.08)",
  brandBgDark: "rgba(99, 102, 241, 0.18)",
  isGeneric: true,
};

export const CONTACT_PLATFORMS: readonly ContactPlatform[] = [
  TELEGRAM,
  DISCORD,
  EMAIL,
  TWITTER,
  REDDIT,
  MATRIX,
  SIGNAL,
  BITCOINTALK,
  BLACKHATWORLD,
  DAOFORUM,
] as const;

// Build a lookup map: canonical + every alias → ContactPlatform.
const PLATFORM_LOOKUP: ReadonlyMap<string, ContactPlatform> = (() => {
  const map = new Map<string, ContactPlatform>();
  for (const p of CONTACT_PLATFORMS) {
    map.set(p.canonical, p);
    for (const alias of p.aliases ?? []) {
      map.set(alias, p);
    }
  }
  return map;
})();

// =============================================================================
// MONOGRAM FALLBACK
// =============================================================================

/**
 * Curated palette of brand-style colors for monogram fallbacks. Picked to be
 * legible on white tiles and to feel "branded" rather than random.
 */
const MONOGRAM_PALETTE: readonly { fg: string; bgLight: string; bgDark: string }[] = [
  { fg: "#0EA5E9", bgLight: "rgba(14, 165, 233, 0.10)", bgDark: "rgba(14, 165, 233, 0.20)" }, // sky
  { fg: "#10B981", bgLight: "rgba(16, 185, 129, 0.10)", bgDark: "rgba(16, 185, 129, 0.20)" }, // emerald
  { fg: "#F59E0B", bgLight: "rgba(245, 158, 11, 0.12)", bgDark: "rgba(245, 158, 11, 0.22)" }, // amber
  { fg: "#EF4444", bgLight: "rgba(239, 68, 68, 0.10)", bgDark: "rgba(239, 68, 68, 0.20)" }, // red
  { fg: "#8B5CF6", bgLight: "rgba(139, 92, 246, 0.10)", bgDark: "rgba(139, 92, 246, 0.20)" }, // violet
  { fg: "#EC4899", bgLight: "rgba(236, 72, 153, 0.10)", bgDark: "rgba(236, 72, 153, 0.20)" }, // pink
  { fg: "#14B8A6", bgLight: "rgba(20, 184, 166, 0.10)", bgDark: "rgba(20, 184, 166, 0.20)" }, // teal
  { fg: "#F97316", bgLight: "rgba(249, 115, 22, 0.10)", bgDark: "rgba(249, 115, 22, 0.20)" }, // orange
  { fg: "#6366F1", bgLight: "rgba(99, 102, 241, 0.10)", bgDark: "rgba(99, 102, 241, 0.20)" }, // indigo
  { fg: "#A855F7", bgLight: "rgba(168, 85, 247, 0.10)", bgDark: "rgba(168, 85, 247, 0.20)" }, // purple
  { fg: "#22C55E", bgLight: "rgba(34, 197, 94, 0.10)", bgDark: "rgba(34, 197, 94, 0.20)" }, // green
  { fg: "#0891B2", bgLight: "rgba(8, 145, 178, 0.10)", bgDark: "rgba(8, 145, 178, 0.20)" }, // cyan
] as const;

/** djb2-style string hash → unsigned 32-bit. Stable, fast, no deps. */
function hashName(name: string): number {
  let h = 5381;
  for (let i = 0; i < name.length; i++) {
    h = ((h << 5) + h + name.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

/** Pull initials from a contact name like "daoforum" → "DA", "bhw" → "BH". */
function initialsForName(name: string): string {
  const cleaned = name.replace(/[^a-z0-9]+/gi, "");
  if (!cleaned) return "?";
  // For multi-word-like names (e.g. "blackhatworld"), use the first two chars.
  // This is intentionally simple and deterministic.
  return cleaned.slice(0, 2);
}

/** Build a synthetic ContactPlatform that renders a monogram chip. */
function buildMonogramPlatform(rawName: string): ContactPlatform {
  const normalized = rawName.trim().toLowerCase();
  const palette = MONOGRAM_PALETTE[hashName(normalized) % MONOGRAM_PALETTE.length];
  const Mark = makeMonogramMark(initialsForName(normalized));
  return {
    canonical: normalized,
    labelKey: normalized,
    Mark,
    brandColor: palette.fg,
    brandBgLight: palette.bgLight,
    brandBgDark: palette.bgDark,
    isMonogram: true,
  };
}

/**
 * Resolve a stored contact "name" (e.g. "telegram", "bhw", "BCT", "daoforum",
 * "myrandomforum") to a ContactPlatform. Always returns a platform — unknown
 * names get a deterministic monogram chip; empty names get the generic globe.
 */
export function resolveContactPlatform(rawName: string | undefined | null): ContactPlatform {
  if (!rawName) return GENERIC;
  const key = rawName.trim().toLowerCase();
  if (!key) return GENERIC;
  const found = PLATFORM_LOOKUP.get(key);
  if (found) return found;
  return buildMonogramPlatform(key);
}
