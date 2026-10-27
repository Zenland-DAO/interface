/**
 * Links Sentry errors, Clarity recordings and GA events from the same visit.
 *
 * - Every Sentry event carries the tag `zl_session`, and the Clarity session gets the
 *   same value as a custom tag: from a Sentry issue, filter Clarity recordings by
 *   custom tag `zl_session` to watch what the user did before and after the error.
 * - Every reported error tags the Clarity session with `sentry_event` (the Sentry
 *   event ID) and fires the Clarity event `sentry_error`, so recordings can be
 *   filtered to "sessions with a bug" and each one points back to its Sentry event.
 * - Unhandled errors are also sent to GA as `app_error`, so the funnel report can
 *   show where in the journey users hit bugs.
 *
 * The session ID is random, per browser tab, and never derived from the wallet.
 * Kept free of heavy imports: instrumentation-client loads it on every page.
 */

const CLARITY_ENABLED = Boolean(process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID);
const STORAGE_KEY = "zl_session";

let sessionId: string | undefined;

/** Random ID for this tab's visit; survives reloads, not new tabs. */
export const analyticsSessionId = (): string => {
  if (sessionId) return sessionId;
  const fresh = Math.random().toString(36).slice(2, 10);
  try {
    sessionId = sessionStorage.getItem(STORAGE_KEY) ?? fresh;
    sessionStorage.setItem(STORAGE_KEY, sessionId);
  } catch {
    sessionId = fresh;
  }
  return sessionId;
};

/**
 * Call the Clarity API. Before the tag has loaded, calls are queued on the same
 * `clarity.q` stub that components/layout/MicrosoftClarity installs.
 */
export const clarity = (...args: unknown[]): void => {
  if (typeof window === "undefined" || !CLARITY_ENABLED) return;
  if (!window.clarity) {
    const stub = Object.assign((...queued: unknown[]) => stub.q.push(queued), { q: [] as unknown[][] });
    window.clarity = stub;
  }
  window.clarity(...args);
};

/** Tag the Clarity session with this tab's session ID. Call once on startup. */
export const linkClaritySession = (): void => {
  clarity("set", STORAGE_KEY, analyticsSessionId());
};

/**
 * Called for every error Sentry sends. `alreadyTracked` is true for failures the
 * funnel already reports to GA (escrow_create_failed, ...), to avoid counting twice.
 */
export const linkSentryEvent = (eventId: string, message: string, alreadyTracked: boolean): void => {
  if (typeof window === "undefined") return;
  clarity("set", "sentry_event", eventId);
  clarity("event", "sentry_error");
  if (!alreadyTracked) {
    window.gtag?.("event", "app_error", { error_message: message.split("\n")[0].slice(0, 100) });
  }
};
