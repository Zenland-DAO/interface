"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("agents.availability");

  const nextAvailability = !isAvailable;

  const ui = useMemo(() => {
    if (nextAvailability) {
      return {
        title: t("setAvailable.title"),
        confirmText: t("setAvailable.confirmText"),
        variant: "info" as const,
        countdownSeconds: 0,
        message: t("setAvailable.message"),
      };
    }

    const casesLine =
      activeCases > 0
        ? t("setUnavailable.activeCasesLine", { count: activeCases })
        : "";

    return {
      title: t("setUnavailable.title"),
      confirmText: t("setUnavailable.confirmText"),
      variant: "danger" as const,
      countdownSeconds: 3,
      message: t("setUnavailable.message", { casesLine }),
    };
  }, [activeCases, nextAvailability, t]);

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
