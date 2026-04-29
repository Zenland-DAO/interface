/**
 * Contact platform registry.
 *
 * Maps a platform "name" (as stored on-chain in the `name:value` contact
 * encoding) to a visual identity: brand mark (inline SVG), brand color,
 * display label, optional URL builder, and aliases.
 *
 * The display layer (ContactDisplay) calls `resolveContactPlatform(name)`
 * to look up branding for any contact entry. Unknown names fall back to a
 * polished generic platform, so even unexpected entries render nicely.
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

/** Generic fallback — globe with subtle ring. */
function GenericMark(props: BrandMarkProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a13.5 13.5 0 0 1 0 18M12 3a13.5 13.5 0 0 0 0 18" />
    </svg>
  );
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
  /** True if this is the catch-all generic fallback. */
  isGeneric?: boolean;
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
  BITCOINTALK,
  BLACKHATWORLD,
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

/**
 * Resolve a stored contact "name" (e.g. "telegram", "bhw", "BCT") to a
 * ContactPlatform. Always returns a platform — unknown names get the
 * generic fallback so the UI never breaks.
 */
export function resolveContactPlatform(rawName: string | undefined | null): ContactPlatform {
  if (!rawName) return GENERIC;
  const key = rawName.trim().toLowerCase();
  if (!key) return GENERIC;
  return PLATFORM_LOOKUP.get(key) ?? GENERIC;
}
