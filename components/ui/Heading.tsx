import { forwardRef, type ComponentPropsWithoutRef } from "react";

/**
 * Heading Component
 *
 * A semantic heading component that provides consistent typography styling
 * with proper sizing, line-height, letter-spacing, and spacing.
 *
 * @example
 * <Heading level={1}>Hero Title</Heading>
 * <Heading level={2}>Section Title</Heading>
 * <Heading level={3}>Card Title</Heading>
 * <Heading level={2} as="h3">Styled as h2, semantic h3</Heading>
 */

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

type HeadingProps = {
  /** Heading level (1-6) - determines styling */
  level: HeadingLevel;
  /** Override the semantic HTML element */
  as?: `h${HeadingLevel}`;
  /** Additional CSS classes */
  className?: string;
  /** Content */
  children?: React.ReactNode;
} & Omit<ComponentPropsWithoutRef<"h1">, "as" | "className" | "children">;

/**
 * Heading styles based on level
 * Includes: size, weight, line-height, letter-spacing, color, and bottom margin
 * Uses font-heading (Figtree) for premium typography
 */
const levelStyles: Record<HeadingLevel, string> = {
  1: "font-heading text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight tracking-tight text-[var(--text-primary)]",
  2: "font-heading text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-[var(--text-primary)]",
  3: "font-heading text-2xl sm:text-3xl font-semibold leading-snug tracking-tight text-[var(--text-primary)]",
  4: "font-heading text-lg sm:text-xl font-semibold leading-normal tracking-normal text-[var(--text-primary)]",
  5: "text-base sm:text-lg font-medium leading-normal tracking-normal text-[var(--text-primary)]",
  6: "text-sm sm:text-base font-medium leading-normal tracking-normal text-[var(--text-secondary)]",
};

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ level, as, className = "", children, ...props }, ref) => {
    // Use the `as` prop if provided, otherwise default to the heading level
    const Component = as || (`h${level}` as const);
    const baseStyles = levelStyles[level];

    return (
      <Component
        ref={ref}
        className={`${baseStyles} ${className}`.trim()}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Heading.displayName = "Heading";
