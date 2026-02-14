"use client";

/**
 * Web3 Toast Helpers
 *
 * Shared toast utilities used by transaction executors and error handlers.
 * Kept separate from the transaction execution logic to follow SRP.
 */

import { toast } from "sonner";
import { WifiOff, XCircle, AlertCircle } from "lucide-react";

import { parseWeb3Error, type ParsedWeb3Error } from "@/lib/utils/web3-errors";

// =============================================================================
// TOAST CONFIGURATION
// =============================================================================

const ERROR_TOAST_DURATION = 5000;
const NETWORK_ERROR_TOAST_DURATION = 8000;

// =============================================================================
// TOASTS
// =============================================================================

export type ToastId = string | number;

export function showPendingToast(message: string): ToastId {
  return toast.loading(message, {
    description: "Please confirm in your wallet...",
  });
}

export function updateToastPending(
  toastId: ToastId,
  message: string,
  options?: {
    description?: string;
  }
): void {
  toast.loading(message, {
    id: toastId,
    description: options?.description,
  });
}

export function dismissToast(toastId: ToastId): void {
  toast.dismiss(toastId);
}

export function updateToastSuccess(
  toastId: ToastId,
  message: string,
  options?: {
    description?: string;
    action?: {
      label: string;
      onClick: () => void;
    };
  }
): void {
  toast.success(message, {
    id: toastId,
    description: options?.description,
    duration: 4000,
    action: options?.action,
  });
}

export function updateToastError(
  toastId: ToastId,
  error: unknown,
  options?: {
    title?: string;
    onRetry?: () => void;
  }
): void {
  const parsed = parseWeb3Error(error);

  // Don't update for user rejections, just dismiss.
  if (parsed.isUserRejection) {
    toast.dismiss(toastId);
    return;
  }

  const title = options?.title || "Transaction Failed";

  toast.error(title, {
    id: toastId,
    description: parsed.message,
    duration: ERROR_TOAST_DURATION,
    action: options?.onRetry
      ? {
          label: "Retry",
          onClick: options.onRetry,
        }
      : undefined,
  });
}

export function showSuccessToast(
  message: string,
  options?: {
    description?: string;
    action?: {
      label: string;
      onClick: () => void;
    };
  }
): void {
  toast.success(message, {
    description: options?.description,
    duration: 4000,
    action: options?.action,
  });
}

export function showErrorToast(
  parsed: ParsedWeb3Error,
  options?: {
    title?: string;
    onRetry?: () => void;
  }
): void {
  if (parsed.isUserRejection) return;

  const title = options?.title || "Transaction Failed";

  if (parsed.isNetworkError && options?.onRetry) {
    toast.error(title, {
      description: parsed.message,
      duration: NETWORK_ERROR_TOAST_DURATION,
      icon: <WifiOff className="h-4 w-4" />,
      action: {
        label: "Retry",
        onClick: options.onRetry,
      },
    });
    return;
  }

  if (parsed.isContractRevert) {
    toast.error(title, {
      description: parsed.message,
      duration: ERROR_TOAST_DURATION,
      icon: <XCircle className="h-4 w-4" />,
    });
    return;
  }

  toast.error(title, {
    description: parsed.message,
    duration: ERROR_TOAST_DURATION,
    icon: <AlertCircle className="h-4 w-4" />,
  });
}

