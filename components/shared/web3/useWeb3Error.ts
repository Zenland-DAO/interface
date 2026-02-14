"use client";

/**
 * useWeb3Error
 *
 * Shared hook for turning raw web3 errors into user-facing toasts.
 */

import { useCallback } from "react";

import {
  parseWeb3Error,
  isUserRejectionError,
  type ParsedWeb3Error,
} from "@/lib/utils/web3-errors";
import { showErrorToast } from "./toasts";

// =============================================================================
// TYPES
// =============================================================================

export interface UseWeb3ErrorOptions {
  onRetry?: () => void;
  errorTitle?: string;
}

export interface UseWeb3ErrorReturn {
  handleError: (error: unknown) => void;
  handleErrorWithContext: (error: unknown, context: string) => void;
  isUserRejection: (error: unknown) => boolean;
  parseError: (error: unknown) => ParsedWeb3Error;
}

// =============================================================================
// HOOK
// =============================================================================

export function useWeb3Error(options?: UseWeb3ErrorOptions): UseWeb3ErrorReturn {
  const handleError = useCallback(
    (error: unknown) => {
      const parsed = parseWeb3Error(error);
      showErrorToast(parsed, {
        title: options?.errorTitle,
        onRetry: options?.onRetry,
      });
    },
    [options?.errorTitle, options?.onRetry]
  );

  const handleErrorWithContext = useCallback(
    (error: unknown, context: string) => {
      const parsed = parseWeb3Error(error);
      showErrorToast(parsed, {
        title: context,
        onRetry: options?.onRetry,
      });
    },
    [options?.onRetry]
  );

  const isUserRejection = useCallback((error: unknown) => {
    return isUserRejectionError(error);
  }, []);

  const parseError = useCallback((error: unknown) => {
    return parseWeb3Error(error);
  }, []);

  return {
    handleError,
    handleErrorWithContext,
    isUserRejection,
    parseError,
  };
}

