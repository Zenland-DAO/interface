"use client";

/**
 * Web3ErrorHandler (legacy module)
 *
 * This file used to contain all web3 toast + transaction hooks.
 * It now acts as a compatibility layer.
 *
 * New code should import from:
 * - `@/components/shared/web3/useWeb3Transaction`
 * - `@/components/shared/web3/useWeb3Error`
 * - `@/components/shared/web3/toasts`
 */

import { RefreshCw, WifiOff, AlertCircle } from "lucide-react";

import type { ReactElement } from "react";

import { parseWeb3Error} from "@/lib/utils/web3-errors";

// Backwards-compatible re-exports
export { useWeb3Transaction } from "./web3/useWeb3Transaction";
export type {
  UseWeb3TransactionOptions,
  UseWeb3TransactionReturn,
  TransactionState,
} from "./web3/useWeb3Transaction";

export { useWeb3Error } from "./web3/useWeb3Error";
export type { UseWeb3ErrorOptions, UseWeb3ErrorReturn } from "./web3/useWeb3Error";

export {
  showPendingToast,
  updateToastPending,
  updateToastSuccess,
  updateToastError,
  dismissToast,
  showSuccessToast,
  showErrorToast,
} from "./web3/toasts";

// =============================================================================
// ERROR DISPLAY COMPONENT
// =============================================================================

export interface ErrorDisplayProps {
  error: unknown;
  title?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  compact?: boolean;
  className?: string;
}

export function ErrorDisplay({
  error,
  title,
  onRetry,
  onDismiss,
  compact = false,
  className = "",
}: ErrorDisplayProps): ReactElement | null {
  const parsed = parseWeb3Error(error);

  // Don't display user rejections
  if (parsed.isUserRejection) {
    return null;
  }

  const Icon = parsed.isNetworkError ? WifiOff : AlertCircle;

  if (compact) {
    return (
      <div
        className={`flex items-center gap-2 text-sm text-error-600 dark:text-error-400 ${className}`}
      >
        <Icon className="h-4 w-4 flex-shrink-0" />
        <span className="truncate">{parsed.message}</span>
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex-shrink-0 p-1 hover:bg-error-100 dark:hover:bg-error-900/20 rounded"
          >
            <RefreshCw className="h-3 w-3" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg border border-error-200 dark:border-error-800 bg-error-50 dark:bg-error-900/10 p-4 ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <Icon className="h-5 w-5 text-error-500" />
        </div>
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className="text-sm font-medium text-error-800 dark:text-error-200">
              {title}
            </h4>
          )}
          <p className="mt-1 text-sm text-error-700 dark:text-error-300">{parsed.message}</p>
          {(onRetry || onDismiss) && (
            <div className="mt-3 flex gap-2">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-error-600 dark:text-error-400 hover:text-error-800 dark:hover:text-error-200"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Try again
                </button>
              )}
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="text-sm text-error-500 hover:text-error-700 dark:hover:text-error-300"
                >
                  Dismiss
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Legacy re-export
export { parseWeb3Error, isUserRejectionError } from "@/lib/utils/web3-errors";
export type { ParsedWeb3Error } from "@/lib/utils/web3-errors";

