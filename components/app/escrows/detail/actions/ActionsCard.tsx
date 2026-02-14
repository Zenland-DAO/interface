"use client";

/**
 * ActionsCard
 *
 * Main container for all escrow actions.
 * Orchestrates which action components to show based on user role and escrow state.
 * Manages the confirmation modal state.
 */

import { useState, useCallback } from "react";
import { Zap, CheckCircle } from "lucide-react";

import { Card, CardHeader, CardBody, Heading, Text } from "@/components/ui";
import { useEscrowDetail } from "../EscrowDetailContext";
import { isTerminalState } from "../types";
import { STATE_LABELS, STATE_DESCRIPTIONS } from "../constants";
import { formatAmount } from "@/lib/utils/amount";

import { ConfirmationModal } from "./ConfirmationModal";
import { BuyerActions } from "./BuyerActions";
import { SellerActions } from "./SellerActions";
import { AgentActions } from "./AgentActions";
import { PartyActions } from "./PartyActions";
import { SplitNegotiation } from "./SplitNegotiation";
import { PendingActions } from "./PendingActions";

// =============================================================================
// TYPES
// =============================================================================

type ModalType =
  | "release"
  | "refund"
  | "dispute"
  | "inviteAgent"
  | "agentResolve"
  | "claimTimeout"
  | "proposeSplit"
  | "approveSplit"
  | null;

interface ModalData {
  buyerBps?: number;
  sellerBps?: number;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function ActionsCard() {
  const { escrow, tokenInfo, write, actions, role } = useEscrowDetail();
  const { hasAnyAction } = actions;
  const { isPending } = write;

  // Modal state
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [modalData, setModalData] = useState<ModalData>({});

  // Check if escrow is in terminal state
  const isTerminal = isTerminalState(escrow.state);

  // Open modal handler
  const openModal = useCallback((type: ModalType, data?: ModalData) => {
    setActiveModal(type);
    setModalData(data || {});
  }, []);

  // Close modal handler
  const closeModal = useCallback(() => {
    if (!isPending) {
      setActiveModal(null);
      setModalData({});
    }
  }, [isPending]);

  // Handle modal confirmation
  const handleConfirm = useCallback(async () => {
    if (!activeModal) return;

    try {
      switch (activeModal) {
        case "release":
          // For seller after protection, use releaseAfterProtection
          if (role.isSeller) {
            await write.releaseAfterProtection();
          } else {
            await write.release();
          }
          break;
        case "refund":
          await write.sellerRefund();
          break;
        case "dispute":
          await write.openDispute();
          break;
        case "inviteAgent":
          await write.inviteAgent();
          break;
        case "agentResolve":
          if (modalData.buyerBps !== undefined && modalData.sellerBps !== undefined) {
            await write.agentResolve(modalData.buyerBps, modalData.sellerBps);
          }
          break;
        case "claimTimeout":
          await write.claimAgentTimeout();
          break;
        case "proposeSplit":
          if (modalData.buyerBps !== undefined && modalData.sellerBps !== undefined) {
            await write.proposeSplit(modalData.buyerBps, modalData.sellerBps);
          }
          break;
        case "approveSplit":
          if (modalData.buyerBps !== undefined && modalData.sellerBps !== undefined) {
            await write.approveSplit(modalData.buyerBps, modalData.sellerBps);
          }
          break;
      }
      closeModal();
    } catch (err) {
      // Error handling is done in useEscrowActions with toasts,
      // but we still log to avoid silent failures during development.
      console.error("[ActionsCard] Action confirm failed:", err);
    }
  }, [activeModal, modalData, role.isSeller, write, closeModal]);

  // Format amount for modal
  const formattedAmount = formatAmount(escrow.amount, tokenInfo.decimals);

  return (
    <>
      <Card variant="elevated" className="border-primary-500/10">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap size={18} className="text-primary-500" />
            <Heading level={3} className="text-lg">
              Actions
            </Heading>
          </div>
        </CardHeader>

        <CardBody className="space-y-4">
          {/* Terminal State Message */}
          {isTerminal && (
            <div className="text-center py-4 space-y-3">
              <div className="w-12 h-12 bg-success-50 dark:bg-success-900/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle size={24} className="text-success-500" />
              </div>
              <div>
                <Text className="font-semibold">
                  {STATE_LABELS[escrow.state]}
                </Text>
                <Text variant="muted" className="text-sm mt-1">
                  {STATE_DESCRIPTIONS[escrow.state]}
                </Text>
              </div>
            </div>
          )}

          {/* No Actions Available (but not terminal) */}
          {!isTerminal && !hasAnyAction && role.role === "viewer" && (
            <div className="text-center py-4">
              <Text variant="muted" className="text-sm">
                Connect your wallet to interact with this escrow.
              </Text>
            </div>
          )}

          {!isTerminal && !hasAnyAction && role.role !== "viewer" && (
            <div className="text-center py-4">
              <Text variant="muted" className="text-sm">
                No actions available at this time.
              </Text>
            </div>
          )}

          {/* Role-Based Actions */}
          {!isTerminal && hasAnyAction && (
            <div className="space-y-4">
              <PendingActions />
              {/* Primary Actions (by role) */}
              <BuyerActions onOpenModal={openModal} />
              <SellerActions onOpenModal={openModal} />
              <AgentActions onOpenModal={openModal} />

              {/* Shared Party Actions (buyer & seller) */}
              <PartyActions onOpenModal={openModal} />

              {/* Split Negotiation (expandable) */}
              <SplitNegotiation onOpenModal={openModal} />
            </div>
          )}
        </CardBody>
      </Card>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={activeModal !== null}
        type={activeModal}
        onClose={closeModal}
        onConfirm={handleConfirm}
        isLoading={isPending}
        data={{
          ...modalData,
          amount: formattedAmount,
          tokenSymbol: tokenInfo.symbol,
        }}
      />
    </>
  );
}
