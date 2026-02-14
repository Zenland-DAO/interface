"use client";

/**
 * Skeleton Component
 *
 * Reusable loading placeholder with shimmer animation.
 * Used for loading states to improve perceived performance.
 *
 * @example
 * // Text skeleton
 * <Skeleton variant="text" width="100%" />
 *
 * // Circular skeleton (avatar)
 * <Skeleton variant="circular" width={40} height={40} />
 *
 * // Rectangular skeleton (card, image)
 * <Skeleton variant="rectangular" height={200} />
 */

import { type CSSProperties } from "react";

// =============================================================================
// TYPES
// =============================================================================

export type SkeletonVariant = "text" | "circular" | "rectangular";

export interface SkeletonProps {
  /** Shape variant */
  variant?: SkeletonVariant;
  /** Width (number = px, string = any CSS unit) */
  width?: number | string;
  /** Height (number = px, string = any CSS unit) */
  height?: number | string;
  /** Border radius override */
  borderRadius?: number | string;
  /** Additional class names */
  className?: string;
  /** Disable animation */
  disableAnimation?: boolean;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function Skeleton({
  variant = "text",
  width,
  height,
  borderRadius,
  className = "",
  disableAnimation = false,
}: SkeletonProps) {
  // Compute dimensions based on variant
  const style: CSSProperties = {
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height,
    borderRadius:
      borderRadius !== undefined
        ? typeof borderRadius === "number"
          ? `${borderRadius}px`
          : borderRadius
        : undefined,
  };

  // Variant-specific classes
  const variantClasses: Record<SkeletonVariant, string> = {
    text: "h-4 rounded",
    circular: "rounded-full",
    rectangular: "rounded-lg",
  };

  // Default dimensions for circular variant
  if (variant === "circular" && !width && !height) {
    style.width = "40px";
    style.height = "40px";
  }

  return (
    <div
      className={`
        bg-neutral-200 dark:bg-neutral-800
        ${variantClasses[variant]}
        ${!disableAnimation ? "animate-pulse" : ""}
        ${className}
      `.trim()}
      style={style}
      aria-hidden="true"
    />
  );
}

// =============================================================================
// PRESET COMPONENTS
// =============================================================================

/**
 * Skeleton for text content (single line)
 */
export function SkeletonText({
  width = "100%",
  className = "",
}: {
  width?: number | string;
  className?: string;
}) {
  return <Skeleton variant="text" width={width} className={className} />;
}

/**
 * Skeleton for avatar/profile image
 */
export function SkeletonAvatar({
  size = 40,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Skeleton
      variant="circular"
      width={size}
      height={size}
      className={className}
    />
  );
}

/**
 * Skeleton for card content
 */
export function SkeletonCard({
  height = 200,
  className = "",
}: {
  height?: number;
  className?: string;
}) {
  return (
    <Skeleton
      variant="rectangular"
      width="100%"
      height={height}
      className={className}
    />
  );
}

/**
 * Skeleton for form input field
 */
export function SkeletonInput({ className = "" }: { className?: string }) {
  return (
    <Skeleton
      variant="rectangular"
      width="100%"
      height={44}
      borderRadius={8}
      className={className}
    />
  );
}

/**
 * Skeleton for button
 */
export function SkeletonButton({
  width = 120,
  className = "",
}: {
  width?: number | string;
  className?: string;
}) {
  return (
    <Skeleton
      variant="rectangular"
      width={width}
      height={40}
      borderRadius={8}
      className={className}
    />
  );
}

// =============================================================================
// COMPOUND SKELETONS
// =============================================================================

/**
 * Skeleton for form with multiple fields
 */
export function SkeletonForm({
  fields = 4,
  className = "",
}: {
  fields?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-6 ${className}`}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <SkeletonText width={100} />
          <SkeletonInput />
        </div>
      ))}
      <div className="pt-4">
        <SkeletonButton width="100%" />
      </div>
    </div>
  );
}

/**
 * Skeleton for wizard progress indicator
 */
export function SkeletonWizardProgress({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center">
          <Skeleton variant="circular" width={32} height={32} />
          {i < 4 && (
            <Skeleton
              variant="rectangular"
              width={60}
              height={2}
              className="mx-2 hidden sm:block"
            />
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton for escrow creation wizard
 */
export function SkeletonEscrowWizard() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Progress */}
      <div className="max-w-3xl mx-auto">
        <SkeletonWizardProgress />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {/* Left: Form */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-[var(--border-secondary)] p-6 space-y-6">
            <Skeleton variant="text" width={200} height={24} />
            <SkeletonForm fields={5} />
          </div>
        </div>

        {/* Right: Summary */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-[var(--border-secondary)] p-6 space-y-4">
            <Skeleton variant="text" width={120} height={20} />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex justify-between">
                  <SkeletonText width={80} />
                  <SkeletonText width={60} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Skeleton;
