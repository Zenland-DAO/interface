import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { type LucideIcon } from "lucide-react";

/**
 * Icon Component
 * 
 * A wrapper component for Lucide icons with consistent sizing and styling.
 * Supports different sizes and can be wrapped in a decorative box.
 * 
 * @example
 * // Simple icon
 * <Icon icon={Shield} size="md" />
 * 
 * // Icon with box background
 * <Icon icon={Lock} size="lg" boxed boxColor="primary" />
 */

type IconSize = "xs" | "sm" | "md" | "lg" | "xl";
type IconBoxColor = "primary" | "success" | "warning" | "error" | "neutral";

interface IconProps extends Omit<ComponentPropsWithoutRef<"svg">, "ref"> {
  /** Lucide icon component */
  icon: LucideIcon;
  /** Icon size preset */
  size?: IconSize;
  /** Wrap icon in a decorative box */
  boxed?: boolean;
  /** Box background color (only when boxed) */
  boxColor?: IconBoxColor;
  /** Additional classes for the icon */
  className?: string;
}

const sizeMap: Record<IconSize, { icon: number; box: string; strokeWidth: number }> = {
  xs: { icon: 14, box: "w-6 h-6", strokeWidth: 2 },
  sm: { icon: 16, box: "w-8 h-8", strokeWidth: 2 },
  md: { icon: 20, box: "w-10 h-10", strokeWidth: 1.75 },
  lg: { icon: 24, box: "w-12 h-12", strokeWidth: 1.5 },
  xl: { icon: 32, box: "w-16 h-16", strokeWidth: 1.5 },
};

const boxColorStyles: Record<IconBoxColor, { bg: string; icon: string }> = {
  primary: {
    bg: "bg-primary-50 dark:bg-primary-950",
    icon: "text-primary-500 dark:text-primary-400",
  },
  success: {
    bg: "bg-success-50 dark:bg-success-950",
    icon: "text-success-600 dark:text-success-400",
  },
  warning: {
    bg: "bg-warning-50 dark:bg-warning-950",
    icon: "text-warning-600 dark:text-warning-500",
  },
  error: {
    bg: "bg-error-50 dark:bg-error-950",
    icon: "text-error-500 dark:text-error-400",
  },
  neutral: {
    bg: "bg-neutral-100 dark:bg-neutral-800",
    icon: "text-neutral-600 dark:text-neutral-400",
  },
};

export const Icon = forwardRef<SVGSVGElement, IconProps>(
  (
    {
      icon: LucideIcon,
      size = "md",
      boxed = false,
      boxColor = "primary",
      className = "",
      ...props
    },
    ref
  ) => {
    const sizeConfig = sizeMap[size];
    const colorConfig = boxColorStyles[boxColor];

    const iconElement = (
      <LucideIcon
        ref={ref}
        size={sizeConfig.icon}
        strokeWidth={sizeConfig.strokeWidth}
        className={`${boxed ? colorConfig.icon : ""} ${className}`.trim()}
        {...props}
      />
    );

    if (boxed) {
      return (
        <div
          className={`
            ${sizeConfig.box}
            ${colorConfig.bg}
            rounded-xl
            flex items-center justify-center
            flex-shrink-0
          `}
        >
          {iconElement}
        </div>
      );
    }

    return iconElement;
  }
);

Icon.displayName = "Icon";
