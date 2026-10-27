import * as Sentry from "@sentry/nextjs";
import { analyticsSessionId, linkClaritySession, linkSentryEvent } from "@/lib/analytics/session";

/**
 * Wallet addresses (0x + 40 hex) show up in viem error messages and console logs.
 * The privacy policy promises we never send them to analytics/monitoring tools, so
 * they are masked. Transaction hashes (64 hex) are left alone.
 */
const ADDRESS = /0x[0-9a-fA-F]{40}(?![0-9a-fA-F])/g;
const redactAddresses = (text: string) => text.replace(ADDRESS, "0x[address]");
const redactValue = (value: unknown): unknown =>
  typeof value === "string" ? redactAddresses(value) : value;

/**
 * Error messages produced by third-party wallet browser extensions fighting
 * over `window.ethereum`. These are NOT bugs in our app — they originate from
 * injected extension scripts (MetaMask, Nightly, Backpack, Sender, etc.) and
 * we cannot prevent them.  Downgrading them to warnings keeps the error feed clean
 * while preserving visibility.
 */
const WALLET_EXTENSION_NOISE = [
  "MetaMask extension not found",
  "Failed to connect to MetaMask",
  "Cannot redefine property: ethereum",
  "Unable to redefine window.ethereum",
];

/**
 * Errors from third-party wallet SDKs and in-app browsers that are completely
 * unactionable by us. These are dropped entirely to keep the error feed clean.
 *
 * 1. Coinbase SDK IndexedDB error — Safari aggressively closes IDB connections
 *    during page navigation/visibility changes. The Coinbase Wallet SDK's
 *    internal analytics & subscription system (`core/subscription`) tries to
 *    open transactions on an already-closing IDB connection.
 *    Affects: Safari only. Zero user impact.
 *
 * 2. MetaMask Mobile circular JSON — MetaMask Mobile's in-app browser injects
 *    `__mm__updateUrl` which calls `JSON.stringify` on DOM nodes. React 19
 *    attaches `__reactFiber$*` with circular refs to DOM nodes, causing the
 *    serialization to fail. Not our code, not actionable.
 *    Affects: MetaMask Mobile WebView on Android only.
 *
 * 3. WalletConnect "Proposal expired" — Fires when a user initiates a
 *    WalletConnect connection but doesn't approve it in their wallet within
 *    the 5-minute timeout. This is normal user behavior, not an app error.
 *    Affects: All browsers, only WalletConnect flow.
 */
const THIRD_PARTY_SDK_NOISE: Array<{
  /** Match against exception type(s) */
  type?: string;
  /** Match against the concatenated exception message */
  message: string;
}> = [
  // Coinbase SDK — IndexedDB closing on Safari
  {
    type: "InvalidStateError",
    message: "The database connection is closing",
  },
  // MetaMask Mobile — circular JSON from __mm__updateUrl
  {
    message: "Converting circular structure to JSON",
  },
  // WalletConnect — session proposal timeout
  {
    message: "Proposal expired",
  },
];

Sentry.init({
  dsn: "https://6b15eeba595cc4e49e27070060bd234d@o4510866637258752.ingest.de.sentry.io/4510866638766160",

  // Adds request headers and IP for users
  sendDefaultPii: true,

  // Capture 100% in dev, 10% in production
  // Adjust based on your traffic volume
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  integrations: [
    // Send console.log, console.warn, and console.error calls as logs to Sentry
    Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
    // Session Replay is added lazily below (see loadReplayWhenIdle)
  ],

  // Shared with the Clarity session (custom tag zl_session), see lib/analytics/session
  initialScope: { tags: { zl_session: analyticsSessionId() } },

  // Session Replay
  // 10% of sessions in production; set to 1.0 during testing
  replaysSessionSampleRate: 0.1,
  // Always capture replays when an error occurs
  replaysOnErrorSampleRate: 1.0,

  beforeBreadcrumb(breadcrumb) {
    if (breadcrumb.message) breadcrumb.message = redactAddresses(breadcrumb.message);
    if (Array.isArray(breadcrumb.data?.arguments)) {
      breadcrumb.data.arguments = breadcrumb.data.arguments.map(redactValue);
    }
    return breadcrumb;
  },

  beforeSendLog(log) {
    // May be a parameterized String object; only replace it when there is something to mask.
    const original = String(log.message);
    const redacted = redactAddresses(original);
    if (redacted !== original) log.message = redacted;
    return log;
  },

  // Filter and downgrade non-actionable errors before sending to Sentry.
  beforeSend(event) {
    const values = event.exception?.values;
    if (values?.length) {
      const msg = values.map((v) => v.value ?? "").join(" ");

      // Drop user-initiated wallet rejections entirely.
      // These happen when a user declines a MetaMask/wallet signature or
      // transaction prompt — completely normal behaviour, not an app bug.
      if (
        values.some((v) => v.type === "UserRejectedRequestError") ||
        msg.includes("User rejected the request") ||
        msg.includes("User denied transaction signature")
      ) {
        return null;
      }

      // Drop third-party wallet SDK errors entirely.
      // These originate from Coinbase SDK (IndexedDB on Safari),
      // MetaMask Mobile in-app browser (circular JSON), and
      // WalletConnect (proposal timeout) — none are actionable by us.
      if (
        THIRD_PARTY_SDK_NOISE.some(
          (rule) =>
            msg.includes(rule.message) &&
            (!rule.type || values.some((v) => v.type === rule.type)),
        )
      ) {
        return null;
      }

      // Downgrade third-party wallet extension errors to warnings.
      // These originate from extension scripts fighting over window.ethereum —
      // not actionable by us, but still useful for visibility.
      if (WALLET_EXTENSION_NOISE.some((noise) => msg.includes(noise))) {
        event.level = "warning";
        event.tags = { ...event.tags, wallet_extension_noise: "true" };
        // Override fingerprint so all wallet extension noise groups into one issue
        event.fingerprint = ["wallet-extension-provider-conflict"];
      }

      for (const v of values) if (v.value) v.value = redactAddresses(v.value);
    }
    if (event.message) event.message = redactAddresses(event.message);

    if (event.event_id && event.level !== "warning") {
      const message = values?.map((v) => `${v.type}: ${v.value}`).join(" ") ?? event.message ?? "";
      linkSentryEvent(event.event_id, message, Boolean(event.tags?.funnel_event));
    }
    return event;
  },
});

/**
 * Session Replay (rrweb) is the heaviest part of the Sentry SDK, and bundling it made
 * Sentry the most expensive script on mobile page loads. It is fetched from Sentry's
 * CDN instead, once the page has loaded and the main thread is idle.
 * If the CDN is blocked (e.g. by an ad blocker) the app simply runs without Replay.
 */
function loadReplayWhenIdle() {
  const load = () => {
    Sentry.lazyLoadIntegration("replayIntegration")
      .then((replayIntegration) => Sentry.addIntegration(replayIntegration()))
      .catch(() => {});
  };
  const whenIdle = () =>
    "requestIdleCallback" in window ? window.requestIdleCallback(load, { timeout: 5000 }) : setTimeout(load, 0);
  const afterLoad = () => setTimeout(whenIdle, 3000);

  if (document.readyState === "complete") afterLoad();
  else window.addEventListener("load", afterLoad, { once: true });
}

loadReplayWhenIdle();
linkClaritySession();

// This export will instrument router navigations
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
