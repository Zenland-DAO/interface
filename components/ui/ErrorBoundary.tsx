"use client";

/**
 * ErrorBoundary Component
 *
 * Reusable error boundary for catching and displaying errors gracefully.
 * Provides a fallback UI with retry functionality.
 *
 * @example
 * <ErrorBoundary fallback={<ErrorFallback />}>
 *   <MyComponent />
 * </ErrorBoundary>
 *
 * // With custom onError handler
 * <ErrorBoundary onError={(error, errorInfo) => logToService(error)}>
 *   <MyComponent />
 * </ErrorBoundary>
 */

import React, { Component, type ReactNode, type ErrorInfo } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "./Button";
import { Card, CardBody } from "./Card";
import { Heading } from "./Heading";
import { Text } from "./Text";

// =============================================================================
// TYPES
// =============================================================================

export interface ErrorBoundaryProps {
  /** Children to render */
  children: ReactNode;
  /** Custom fallback component */
  fallback?: ReactNode;
  /** Custom fallback render function with error details */
  fallbackRender?: (props: FallbackProps) => ReactNode;
  /** Callback when error occurs */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Callback when reset/retry is triggered */
  onReset?: () => void;
  /** Key to reset the boundary when it changes */
  resetKey?: string | number;
}

export interface FallbackProps {
  error: Error;
  errorInfo: ErrorInfo | null;
  resetError: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

// =============================================================================
// ERROR BOUNDARY CLASS COMPONENT
// =============================================================================

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    // Reset error state when resetKey changes
    if (
      this.props.resetKey !== prevProps.resetKey &&
      this.state.hasError
    ) {
      this.resetError();
    }
  }

  resetError = () => {
    this.props.onReset?.();
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback, fallbackRender } = this.props;

    if (hasError && error) {
      // Custom fallback render function
      if (fallbackRender) {
        return fallbackRender({
          error,
          errorInfo,
          resetError: this.resetError,
        });
      }

      // Custom fallback component
      if (fallback) {
        return fallback;
      }

      // Default fallback
      return (
        <DefaultErrorFallback
          error={error}
          errorInfo={errorInfo}
          resetError={this.resetError}
        />
      );
    }

    return children;
  }
}

// =============================================================================
// DEFAULT FALLBACK COMPONENT
// =============================================================================

interface DefaultErrorFallbackProps {
  error: Error;
  errorInfo: ErrorInfo | null;
  resetError: () => void;
}

function DefaultErrorFallback({
  error,
  errorInfo,
  resetError,
}: DefaultErrorFallbackProps) {
  const isDev = process.env.NODE_ENV === "development";

  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <Card variant="elevated" className="max-w-lg w-full">
        <CardBody className="p-8 text-center">
          {/* Icon */}
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-error-100 dark:bg-error-900/30 flex items-center justify-center">
            <AlertTriangle size={32} className="text-error-500" />
          </div>

          {/* Title */}
          <Heading level={3} className="mb-2">
            Something went wrong
          </Heading>

          {/* Description */}
          <Text variant="muted" className="mb-6">
            {isDev
              ? error.message
              : "An unexpected error occurred. Please try again."}
          </Text>

          {/* Error details in dev mode */}
          {isDev && errorInfo && (
            <details className="mb-6 text-left">
              <summary className="cursor-pointer text-sm text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]">
                Show error details
              </summary>
              <pre className="mt-2 p-3 text-xs bg-neutral-100 dark:bg-neutral-900 rounded-lg overflow-auto max-h-40 text-error-600 dark:text-error-400">
                {error.stack}
              </pre>
              <pre className="mt-2 p-3 text-xs bg-neutral-100 dark:bg-neutral-900 rounded-lg overflow-auto max-h-40 text-neutral-600 dark:text-neutral-400">
                {errorInfo.componentStack}
              </pre>
            </details>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="primary"
              onClick={resetError}
              leftIcon={<RefreshCw size={16} />}
            >
              Try Again
            </Button>
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/")}
              leftIcon={<Home size={16} />}
            >
              Go Home
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

// =============================================================================
// MINIMAL FALLBACK (for inline errors)
// =============================================================================

export interface MinimalErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
  message?: string;
}

export function MinimalErrorFallback({
  error,
  resetError,
  message = "Failed to load",
}: MinimalErrorFallbackProps) {
  return (
    <div className="p-4 rounded-xl bg-error-50 dark:bg-error-900/10 border border-error-200 dark:border-error-800">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <AlertTriangle size={18} className="text-error-500" />
          <Text className="text-sm font-medium text-error-700 dark:text-error-300">
            {message}
          </Text>
        </div>
        {resetError && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetError}
            leftIcon={<RefreshCw size={14} />}
          >
            Retry
          </Button>
        )}
      </div>
      {error && process.env.NODE_ENV === "development" && (
        <Text variant="muted" className="text-xs mt-2 font-mono">
          {error.message}
        </Text>
      )}
    </div>
  );
}

// =============================================================================
// SUSPENSE-STYLE ERROR BOUNDARY WRAPPER
// =============================================================================

export interface AsyncBoundaryProps {
  /** Children to render */
  children: ReactNode;
  /** Loading fallback (for Suspense) */
  loadingFallback?: ReactNode;
  /** Error fallback */
  errorFallback?: ReactNode;
  /** Error fallback render function */
  errorFallbackRender?: (props: FallbackProps) => ReactNode;
  /** Callback on error */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Callback on reset */
  onReset?: () => void;
}

/**
 * Combined Suspense + ErrorBoundary wrapper
 * Handles both loading and error states
 */
export function AsyncBoundary({
  children,
  loadingFallback,
  errorFallback,
  errorFallbackRender,
  onError,
  onReset,
}: AsyncBoundaryProps) {
  return (
    <ErrorBoundary
      fallback={errorFallback}
      fallbackRender={errorFallbackRender}
      onError={onError}
      onReset={onReset}
    >
      <React.Suspense fallback={loadingFallback}>{children}</React.Suspense>
    </ErrorBoundary>
  );
}

export default ErrorBoundary;
