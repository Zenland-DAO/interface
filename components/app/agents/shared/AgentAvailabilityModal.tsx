"use client";

import { useMemo } from "react";

import { ConfirmationModal } from "@/components/shared/ConfirmationModal";
import { useAgentActions } from "@/hooks";

export interface AgentAvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAvailable: boolean;
  activeCases: number;
}

/**
 * AgentAvailabilityModal
 *
 * Centralized UX for changing agent availability.
 *
 * NOTE: This is a *UX confirmation only*.
 * On-chain, setAvailability(false) only affects eligibility for *new* invitations.
 */
export function AgentAvailabilityModal({
  isOpen,
  onClose,
  isAvailable,
  activeCases,
}: AgentAvailabilityModalProps) {
  const { setAvailability, isLoading } = useAgentActions();

  const nextAvailability = !isAvailable;

  const ui = useMemo(() => {
    if (nextAvailability) {
      return {
        title: "Set Available",
        confirmText: "Set Available",
        variant: "info" as const,
        countdownSeconds: 0,
        message:
          "You will start receiving new dispute invitations again.",
      };
    }

    const casesLine =
      activeCases > 0
        ? ` You currently have ${activeCases} active case${activeCases === 1 ? "" : "s"}.`
        : "";

    return {
      title: "Set Unavailable",
      confirmText: "Set Unavailable",
      variant: "danger" as const,
      countdownSeconds: 3,
      message:
        "While unavailable:\n" +
        "• You will not receive new dispute invitations.\n" +
        "• Any escrow that selected you as agent cannot invite you during a dispute.\n" +
        "• Parties may be forced to negotiate a settlement (SPLIT) without your decision.\n" +
        casesLine +
        "\nThis may reduce trust from parties who chose you to arbitrate.",
    };
  }, [activeCases, nextAvailability]);

  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={async () => {
        const ok = await setAvailability(nextAvailability);
        if (ok) onClose();
      }}
      title={ui.title}
      message={ui.message}
      confirmText={ui.confirmText}
      variant={ui.variant}
      countdownSeconds={ui.countdownSeconds}
      isLoading={isLoading}
    />
  );
}
