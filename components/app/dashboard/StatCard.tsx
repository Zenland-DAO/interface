"use client";

import { Card, CardBody } from "@/components/ui";

interface StatCardProps {
  /** Label displayed above the value */
  label: string;
  /** The main stat value to display */
  value: string | number;
  /** Optional color variant for the value */
  variant?: "default" | "success" | "warning" | "error";
  /** Loading state */
  isLoading?: boolean;
}

const variantClasses = {
  default: "text-[var(--text-primary)]",
  success: "text-[var(--color-success-500)]",
  warning: "text-[var(--color-warning-500)]",
  error: "text-[var(--color-error-500)]",
};

/**
 * Reusable stat card component for displaying dashboard metrics.
 * Supports loading state with skeleton animation.
 */
export function StatCard({ label, value, variant = "default", isLoading }: StatCardProps) {
  return (
    <Card variant="default">
      <CardBody className="p-6">
        <p className="text-sm text-[var(--text-secondary)]">{label}</p>
        {isLoading ? (
          <div className="mt-2 h-9 w-20 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
        ) : (
          <p className={`text-3xl font-bold mt-2 ${variantClasses[variant]}`}>
            {value}
          </p>
        )}
      </CardBody>
    </Card>
  );
}
