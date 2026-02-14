import { forwardRef, type HTMLAttributes } from "react";

/**
 * Divider Component
 * 
 * A horizontal divider with optional centered text.
 * Useful for separating content sections or showing "or" between options.
 * 
 * @example
 * // Simple divider
 * <Divider />
 * 
 * // Divider with text
 * <Divider>or</Divider>
 * 
 * // Divider with custom spacing
 * <Divider spacing="lg">Continue with</Divider>
 */

type DividerSpacing = "none" | "sm" | "md" | "lg";

interface DividerProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** Text to display in the center of the divider */
  children?: React.ReactNode;
  /** Vertical spacing around the divider */
  spacing?: DividerSpacing;
}

const spacingStyles: Record<DividerSpacing, string> = {
  none: "",
  sm: "my-3",
  md: "my-4",
  lg: "my-6",
};

export const Divider = forwardRef<HTMLDivElement, DividerProps>(
  ({ children, spacing = "md", className = "", ...props }, ref) => {
    // Simple line divider without text
    if (!children) {
      return (
        <div
          ref={ref}
          role="separator"
          className={`
            w-full h-px
            bg-[var(--border-secondary)]
            ${spacingStyles[spacing]}
            ${className}
          `.trim()}
          {...props}
        />
      );
    }

    // Divider with centered text
    return (
      <div
        ref={ref}
        role="separator"
        className={`
          relative flex items-center
          ${spacingStyles[spacing]}
          ${className}
        `.trim()}
        {...props}
      >
        <div className="flex-1 h-px bg-[var(--border-secondary)]" />
        <span className="px-3 text-sm text-[var(--text-tertiary)] select-none">
          {children}
        </span>
        <div className="flex-1 h-px bg-[var(--border-secondary)]" />
      </div>
    );
  }
);

Divider.displayName = "Divider";
