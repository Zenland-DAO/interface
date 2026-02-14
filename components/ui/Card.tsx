import { forwardRef, type HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "outlined" | "elevated";
  padding?: "none" | "sm" | "md" | "lg";
}

type CardHeaderProps = HTMLAttributes<HTMLDivElement>;
type CardBodyProps = HTMLAttributes<HTMLDivElement>;
type CardFooterProps = HTMLAttributes<HTMLDivElement>;

const variantStyles: Record<string, string> = {
  default: `
    bg-white dark:bg-neutral-900
    border border-[var(--border-secondary)]
  `,
  outlined: `
    bg-transparent
    border border-[var(--border-primary)]
  `,
  elevated: `
    bg-white dark:bg-neutral-900
    shadow-card border border-white/50 dark:border-neutral-800
  `,
};

const paddingStyles: Record<string, string> = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

/**
 * Card Component
 * 
 * A container component for grouping related content.
 * Can be composed with CardHeader, CardBody, and CardFooter.
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = "default",
      padding = "none",
      children,
      className = "",
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={`
          rounded-2xl overflow-hidden
          transition-all duration-200
          ${variantStyles[variant]}
          ${paddingStyles[padding]}
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

/**
 * CardHeader Component
 * 
 * Header section for the Card component.
 */
export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ children, className = "", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`
          px-6 py-4
          border-b border-[var(--border-secondary)]
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardHeader.displayName = "CardHeader";

/**
 * CardBody Component
 * 
 * Main content section for the Card component.
 */
export const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(
  ({ children, className = "", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`px-6 py-4 ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardBody.displayName = "CardBody";

/**
 * CardFooter Component
 * 
 * Footer section for the Card component.
 */
export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ children, className = "", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`
          px-6 py-4
          border-t border-[var(--border-secondary)]
          bg-neutral-50 dark:bg-neutral-950/50
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = "CardFooter";
