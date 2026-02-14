import {
  forwardRef,
  type ElementType,
  type ComponentPropsWithoutRef,
  type ComponentPropsWithRef,
} from "react";

/**
 * Text Component
 * 
 * A polymorphic text component that provides consistent typography styling
 * with proper line-height, letter-spacing, and theme-aware colors.
 * 
 * @example
 * <Text>Default body text</Text>
 * <Text variant="lead">Larger intro text</Text>
 * <Text variant="small">Smaller text</Text>
 * <Text variant="muted">Secondary content</Text>
 * <Text as="span" variant="caption">Inline caption</Text>
 */

type TextVariant = "body" | "lead" | "small" | "caption" | "muted";

type TextProps<T extends ElementType = "p"> = {
  /** Visual style variant */
  variant?: TextVariant;
  /** Render as a different HTML element */
  as?: T;
  /** Additional CSS classes */
  className?: string;
  /** Content */
  children?: React.ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "variant" | "className" | "children">;

const variantStyles: Record<TextVariant, string> = {
  body: "text-base leading-relaxed text-[var(--text-primary)] tracking-normal",
  lead: "text-lg sm:text-xl leading-relaxed text-[var(--text-secondary)] tracking-normal",
  small: "text-sm leading-normal text-[var(--text-secondary)] tracking-normal",
  caption: "text-xs leading-normal text-[var(--text-tertiary)] tracking-wide uppercase",
  muted: "text-base leading-relaxed text-[var(--text-tertiary)] tracking-normal",
};

type TextComponentType = {
  <T extends ElementType = "p">(
    props: TextProps<T> & { ref?: ComponentPropsWithRef<T>["ref"] }
  ): React.ReactElement | null;
  displayName?: string;
};

// NOTE: `forwardRef` does not support generic render functions.
// We implement the render function with broad types, then cast the exported component
// to a polymorphic signature.
function TextRender(
  { variant = "body", as, className = "", children, ...props }: TextProps<ElementType>,
  ref: React.ForwardedRef<Element>
) {
  const Component = as || "p";
  const baseStyles = variantStyles[variant];

  return (
    <Component
      // The ref type depends on `as`; keep runtime correct and trust the exported signature.
      ref={ref as never}
      className={`${baseStyles} ${className}`.trim()}
      {...(props as Record<string, unknown>)}
    >
      {children}
    </Component>
  );
}

export const Text = forwardRef(TextRender) as TextComponentType;

// Display name for dev tools / ESLint react/display-name
Text.displayName = "Text";
