import { forwardRef, type HTMLAttributes } from "react";

/**
 * Container Component
 * 
 * A responsive container component that provides consistent max-width
 * and horizontal padding across the application. Mobile-first approach.
 * 
 * @example
 * <Container>
 *   <h1>Page content</h1>
 * </Container>
 * 
 * <Container size="sm">Narrow content</Container>
 * <Container size="full" padding="none">Full width, no padding</Container>
 */

type ContainerSize = "sm" | "md" | "lg" | "xl" | "full";
type ContainerPadding = "none" | "sm" | "md" | "lg";

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  /** Max-width preset */
  size?: ContainerSize;
  /** Horizontal padding preset */
  padding?: ContainerPadding;
  /** Center the container horizontally */
  centered?: boolean;
}

const sizeStyles: Record<ContainerSize, string> = {
  sm: "max-w-2xl",      // 672px - for narrow content like forms
  md: "max-w-4xl",      // 896px - for medium content
  lg: "max-w-6xl",      // 1152px - for wide content
  xl: "max-w-7xl",      // 1280px - for full-width sections (1200px effective with padding)
  full: "max-w-none",   // No max-width
};

const paddingStyles: Record<ContainerPadding, string> = {
  none: "",
  sm: "px-4",
  md: "px-4 sm:px-6 lg:px-8",
  lg: "px-4 sm:px-8 lg:px-12",
};

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  (
    {
      size = "xl",
      padding = "md",
      centered = true,
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
          w-full
          ${sizeStyles[size]}
          ${paddingStyles[padding]}
          ${centered ? "mx-auto" : ""}
          ${className}
        `.trim()}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Container.displayName = "Container";
