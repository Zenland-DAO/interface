"use client";

/**
 * useAgentSelectionSender Hook
 *
 * Used by the agents listing and profile pages to send selected agent
 * back to the escrow creation form via postMessage.
 *
 * Handles two scenarios:
 * 1. Opened from escrow form (via postMessage) -> sends message + closes tab
 * 2. Direct URL access -> redirects to /escrows/new?agent=ADDRESS
 */

import { useCallback } from "react";
import { useRouter } from "next/navigation";

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * Message type for agent selection postMessage.
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
// HOOK
// =============================================================================

export interface UseAgentSelectionSenderReturn {
  /**
   * Send agent selection back to the opener window or redirect.
   * @param address - The selected agent's address
   */
  sendSelection: (address: string) => void;

  /**
   * Check if this page was opened from another window (has opener).
   */
  hasOpener: boolean;
}

/**
 * Hook for sending agent selection from the agents page.
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

  const sendSelection = useCallback(
    (address: string) => {
      // Check if we were opened from another window
      if (typeof window !== "undefined" && window.opener) {
        // Send message to opener window
        const message: AgentSelectedMessage = {
          type: AGENT_SELECTED_MESSAGE_TYPE,
          address,
        };

        try {
          window.opener.postMessage(message, "*");
          // Close this tab after sending
          window.close();
        } catch (error) {
          // If postMessage or close fails, fallback to redirect
          console.warn("Failed to communicate with opener, redirecting...", error);
          router.push(`/escrows/new?agent=${address}`);
        }
      } else {
        // No opener - redirect to escrow creation with agent param
        router.push(`/escrows/new?agent=${address}`);
      }
    },
    [router]
  );

  // Check if window.opener exists (client-side only)
  const hasOpener = typeof window !== "undefined" && !!window.opener;

  return {
    sendSelection,
    hasOpener,
  };
}

export default useAgentSelectionSender;
