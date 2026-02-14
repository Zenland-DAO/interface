import { forwardRef, type HTMLAttributes } from "react";
import { type LucideIcon } from "lucide-react";
import { Icon } from "./Icon";
import { Heading } from "./Heading";
import { Text } from "./Text";

/**
 * FeatureCard Component
 *
 * A minimal, elegant card for displaying features with an icon,
 * title, and description. Uses subtle border styling.
 *
 * @example
 * import { Shield } from "lucide-react";
 *
 * <FeatureCard
 *   icon={Shield}
 *   iconColor="primary"
 *   title="Secure by Design"
 *   description="All transactions are protected by smart contracts."
 * />
 */

type IconColor = "primary" | "success" | "warning" | "error" | "neutral";

interface FeatureCardProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** Lucide icon component */
  icon: LucideIcon;
  /** Icon box color theme */
  iconColor?: IconColor;
  /** Card title */
  title: string;
  /** Card description */
  description: string;
}

export const FeatureCard = forwardRef<HTMLDivElement, FeatureCardProps>(
  (
    {
      icon,
      iconColor = "primary",
      title,
      description,
      className = "",
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={`
          group
          p-6 sm:p-8
          rounded-2xl
          border border-[var(--border-secondary)]
          bg-transparent
          transition-all duration-200
          hover:border-[var(--border-primary)]
          ${className}
        `.trim()}
        {...props}
      >
        {/* Icon */}
        <Icon
          icon={icon}
          size="xl"
          boxed
          boxColor={iconColor}
        />

        {/* Content */}
        <div className="mt-8 space-y-4">
          <Heading level={3} className="text-2xl sm:text-3xl">
            {title}
          </Heading>
          <Text variant="muted" className="text-base sm:text-lg leading-relaxed">
            {description}
          </Text>
        </div>
      </div>
    );
  }
);

FeatureCard.displayName = "FeatureCard";
