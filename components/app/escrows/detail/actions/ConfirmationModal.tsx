"use client";

/**
 * ConfirmationModal
 *
 * Reusable confirmation dialog for escrow actions.
 * Uses the modal configuration from constants.ts.
 */

import {
  Send,
  RefreshCw,
  AlertTriangle,
  UserCheck,
  Percent,
  Clock,
  Check,
  X,
  Loader2,
} from "lucide-react";

import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Heading,
  Text,
} from "@/components/ui";
import { type ConfirmationModalType } from "../types";
import { MODAL_CONFIG, type ModalConfig } from "../constants";

// =============================================================================
// ICON MAPPING
// =============================================================================

const ICON_MAP = {
  release: Send,
  refund: RefreshCw,
  dispute: AlertTriangle,
  agent: UserCheck,
  split: Percent,
  timeout: Clock,
  check: Check,
  x: X,
} as const;

// =============================================================================
// TYPES
// =============================================================================

export interface ConfirmationModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Modal type (determines content) */
  type: ConfirmationModalType;
  /** Close handler */
  onClose: () => void;
  /** Confirm handler */
  onConfirm: () => void;
  /** Whether action is in progress */
  isLoading?: boolean;
  /** Additional data for display (e.g., split percentages) */
  data?: {
    buyerBps?: number;
    sellerBps?: number;
    amount?: string;
    tokenSymbol?: string;
  };
}

// =============================================================================
// COMPONENT
// =============================================================================

export function ConfirmationModal({
  isOpen,
  type,
  onClose,
  onConfirm,
  isLoading = false,
  data,
}: ConfirmationModalProps) {
  // Don't render if no type
  if (!type) return null;

  const config: ModalConfig = MODAL_CONFIG[type];
  const Icon = ICON_MAP[config.icon];

  // Build description with dynamic data
  let description = config.description;

  // For split modals, add percentage info
  if (data?.buyerBps !== undefined && data?.sellerBps !== undefined) {
    const buyerPct = data.buyerBps / 100;
    const sellerPct = data.sellerBps / 100;
    description += ` Split: ${buyerPct}% to buyer, ${sellerPct}% to seller.`;
  }

  // For release/refund, show amount
  if (data?.amount && data?.tokenSymbol) {
    description = description.replace(
      "escrowed funds",
      `${data.amount} ${data.tokenSymbol}`
    );
  }

  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm();
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="sm">
      <ModalHeader onClose={handleClose}>
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg ${
              config.confirmVariant === "danger"
                ? "bg-error-50 dark:bg-error-900/20 text-error-600 dark:text-error-400"
                : "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
            }`}
          >
            <Icon size={20} />
          </div>
          <Heading level={3} className="text-lg font-semibold">
            {config.title}
          </Heading>
        </div>
      </ModalHeader>

      <ModalBody>
        <Text variant="muted" className="text-sm leading-relaxed">
          {description}
        </Text>

        {/* Split Preview (for split-related modals) */}
        {(type === "proposeSplit" || type === "approveSplit" || type === "agentResolve") &&
          data?.buyerBps !== undefined &&
          data?.sellerBps !== undefined && (
            <div className="mt-4 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg space-y-3">
              <Text
                variant="muted"
                className="text-xs uppercase font-bold tracking-wider"
              >
                Split Preview
              </Text>
              <div className="flex justify-between items-center">
                <Text variant="muted" className="text-sm">
                  Buyer receives
                </Text>
                <Text className="font-semibold">
                  {(data.buyerBps / 100).toFixed(1)}%
                </Text>
              </div>
              <div className="flex justify-between items-center">
                <Text variant="muted" className="text-sm">
                  Seller receives
                </Text>
                <Text className="font-semibold">
                  {(data.sellerBps / 100).toFixed(1)}%
                </Text>
              </div>

              {/* Visual bar */}
              <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden flex">
                <div
                  className="bg-primary-500 h-full transition-all"
                  style={{ width: `${data.buyerBps / 100}%` }}
                />
                <div
                  className="bg-success-500 h-full transition-all"
                  style={{ width: `${data.sellerBps / 100}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-[var(--text-tertiary)]">
                <span>Buyer</span>
                <span>Seller</span>
              </div>
            </div>
          )}
      </ModalBody>

      <ModalFooter className="flex gap-3">
        <Button
          variant="ghost"
          onClick={handleClose}
          disabled={isLoading}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          variant={config.confirmVariant === "danger" ? "danger" : "primary"}
          onClick={handleConfirm}
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin mr-2" />
              Processing...
            </>
          ) : (
            config.confirmLabel
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
