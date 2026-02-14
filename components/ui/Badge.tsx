import { type ReactNode } from "react";

type BadgeVariant = "primary" | "secondary" | "success" | "warning" | "danger" | "neutral";
type BadgeSize = "sm" | "md" | "lg";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  primary: "bg-primary-50 text-primary-700 border-primary-200 dark:bg-primary-900/10 dark:text-primary-400 dark:border-primary-800",
  secondary: "bg-neutral-50 text-neutral-700 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700",
  success: "bg-success-50 text-success-700 border-success-200 dark:bg-success-900/10 dark:text-success-400 dark:border-success-800",
  warning: "bg-warning-50 text-warning-700 border-warning-200 dark:bg-warning-900/10 dark:text-warning-400 dark:border-warning-800",
  danger: "bg-error-50 text-error-700 border-error-200 dark:bg-error-900/10 dark:text-error-400 dark:border-error-800",
  neutral: "bg-neutral-50 text-neutral-600 border-neutral-200 dark:bg-neutral-900/30 dark:text-neutral-500 dark:border-neutral-800",
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-2.5 py-1 text-xs",
  lg: "px-3 py-1.5 text-sm",
};

export const Badge = ({ children, variant = "primary", size = "md", className = "" }: BadgeProps) => {
  return (
    <span className={`
      inline-flex items-center justify-center font-bold uppercase tracking-wider rounded-md border
      ${variantStyles[variant]}
      ${sizeStyles[size]}
      ${className}
    `}>
      {children}
    </span>
  );
};
