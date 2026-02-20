"use client";

/**
 * useAgentSelectionSender Hook
 *
 * Used by the agents listing and profile pages to send selected agent
 * back to the escrow creation form via cross-tab messaging.
 *
 * Handles two scenarios:
 * 1. Opened in select mode (via ?mode=select) -> sends message via
 *    BroadcastChannel (or localStorage fallback) + closes tab
 * 2. Direct URL access -> redirects to /escrows/new?agent=ADDRESS
 *
 * Cross-tab communication strategy:
 * - Primary: BroadcastChannel API (all modern browsers, Safari 15.4+)
 * - Fallback: localStorage + storage event (universal support, covers
 *   older iOS Safari)
 */

import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * Channel name for cross-tab agent selection messaging.
 * Used by both BroadcastChannel and localStorage fallback.
 */
export const AGENT_SELECTION_CHANNEL = "agent-selection" as const;

/**
 * Message type for agent selection.
 */
export const AGENT_SELECTED_MESSAGE_TYPE = "AGENT_SELECTED" as const;

/**
 * postMessage payload structure.
 */
export interface AgentSelectedMessage {
  type: typeof AGENT_SELECTED_MESSAGE_TYPE;
  address: string;
}

// =============================================================================
// CROSS-TAB MESSAGING (DRY helper)
// =============================================================================

/**
 * Send a message to other tabs on the same origin.
 *
 * Tries BroadcastChannel first (modern standard), then falls back to
 * localStorage + storage event for older browsers (e.g. iOS Safari < 15.4).
 *
 * @returns true if the message was sent via at least one channel
 */
function sendCrossTabMessage(data: AgentSelectedMessage): boolean {
  let sent = false;

  // Primary: BroadcastChannel (Safari 15.4+, Chrome 54+, Firefox 38+)
  if (typeof BroadcastChannel !== "undefined") {
    try {
      const channel = new BroadcastChannel(AGENT_SELECTION_CHANNEL);
      channel.postMessage(data);
      channel.close();
      sent = true;
    } catch (error) {
      console.warn("[AgentSelection] BroadcastChannel send failed:", error);
    }
  }

  // Fallback: localStorage triggers 'storage' event in other same-origin tabs.
  // Note: the storage event only fires in *other* tabs, not the current one,
  // which is exactly the behavior we want.
  if (!sent) {
    try {
      const payload = JSON.stringify(data);
      localStorage.setItem(AGENT_SELECTION_CHANNEL, payload);
      // Remove after a short delay so it can be re-used for future selections
      setTimeout(() => {
        try {
          localStorage.removeItem(AGENT_SELECTION_CHANNEL);
        } catch {
          /* noop */
        }
      }, 500);
      sent = true;
    } catch (error) {
      console.warn("[AgentSelection] localStorage fallback failed:", error);
    }
  }

  return sent;
}

// =============================================================================
// HOOK
// =============================================================================

export interface UseAgentSelectionSenderReturn {
  /**
   * Send agent selection to the opener tab (or redirect as fallback).
   * @param address - The selected agent's address
   */
  sendSelection: (address: string) => void;

  /**
   * Whether this page was opened in agent selection mode (?mode=select).
   */
  isSelectMode: boolean;
}

/**
 * Hook for sending agent selection from the agents page.
 *
 * When in select mode (?mode=select):
 * 1. Sends the agent address via BroadcastChannel / localStorage fallback
 * 2. Closes the tab
 * 3. If close fails, redirects to /escrows/new?agent=ADDRESS
 *
 * When NOT in select mode (direct navigation):
 * 1. Redirects to /escrows/new?agent=ADDRESS
 *
 * @example
 * ```tsx
 * function AgentCard({ agent, isSelectMode }) {
 *   const { sendSelection } = useAgentSelectionSender();
 *
 *   const handleSelect = () => {
 *     sendSelection(agent.address);
 *   };
 *
 *   return (
 *     <Card>
 *       ...
 *       {isSelectMode && (
 *         <Button onClick={handleSelect}>Select</Button>
 *       )}
 *     </Card>
 *   );
 * }
 * ```
 */
export function useAgentSelectionSender(): UseAgentSelectionSenderReturn {
  const router = useRouter();
  const searchParams = useSearchParams();

  const isSelectMode = useMemo(
    () => searchParams.get("mode") === "select",
    [searchParams]
  );

  const sendSelection = useCallback(
    (address: string) => {
      const fallbackUrl = `/escrows/new?agent=${address}`;

      if (isSelectMode) {
        const message: AgentSelectedMessage = {
          type: AGENT_SELECTED_MESSAGE_TYPE,
          address,
        };

        const sent = sendCrossTabMessage(message);

        if (sent) {
          // Try to close this tab. window.close() only works for tabs opened
          // via window.open() or via scripts; otherwise it's a no-op.
          try {
            window.close();
          } catch {
            /* noop */
          }

          // If the tab didn't close (e.g. mobile Safari restrictions),
          // wait a tick and redirect as a fallback so the user isn't stuck.
          setTimeout(() => {
            // If we're still here, the close didn't work
            if (!window.closed) {
              router.push(fallbackUrl);
            }
          }, 300);
          return;
        }
      }

      // Not in select mode, or messaging failed entirely → redirect
      router.push(fallbackUrl);
    },
    [router, isSelectMode]
  );

  return {
    sendSelection,
    isSelectMode,
  };
}

export default useAgentSelectionSender;
