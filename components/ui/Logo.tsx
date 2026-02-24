import { forwardRef, type ComponentPropsWithoutRef } from "react";
import Link from "next/link";
import Image from "next/image";

/**
 * Logo Component
 *
 * Theme-aware logo using CSS dark-mode classes instead of useTheme().
 * Both SVGs are rendered server-side; CSS shows the correct one immediately
 * based on the `.dark` class on <html> — no JS execution required.
 *
 * @example
 * // As a link (default)
 * <Logo />
 *
 * // Different sizes
 * <Logo size="sm" />
 * <Logo size="lg" />
 *
 * // Without link
 * <Logo asLink={false} />
 */

type LogoSize = "sm" | "md" | "lg";

interface LogoProps extends Omit<ComponentPropsWithoutRef<"div">, "children"> {
  /** Size preset */
  size?: LogoSize;
  /** Render as a link to homepage */
  asLink?: boolean;
  /** Custom href when used as link */
  href?: string;
}

const sizeConfig: Record<LogoSize, { width: number; height: number }> = {
  sm: { width: 150, height: 36 },
  md: { width: 190, height: 46 },
  lg: { width: 230, height: 56 },
};

const LogoContent = ({ size = "md" }: { size?: LogoSize }) => {
  const config = sizeConfig[size];

  return (
    <>
      {/* Light logo: visible by default, hidden when .dark is on <html> */}
      <Image
        src="/branding/logo/svg/logo-light.svg"
        alt="Zenland"
        width={config.width}
        height={config.height}
        className="flex-shrink-0 dark:hidden"
        unoptimized
        priority
      />
      {/* Dark logo: hidden by default, shown when .dark is on <html> */}
      <Image
        src="/branding/logo/svg/logo-dark.svg"
        alt="Zenland"
        width={config.width}
        height={config.height}
        className="flex-shrink-0 hidden dark:block"
        unoptimized
      />
    </>
  );
};

export const Logo = forwardRef<HTMLDivElement, LogoProps>(
  ({ size = "md", asLink = true, href = "/", className = "", ...props }, ref) => {
    if (asLink) {
      return (
        <div ref={ref} className={className} {...props}>
          <Link
            href={href}
            className="inline-block transition-opacity hover:opacity-80"
          >
            <LogoContent size={size} />
          </Link>
        </div>
      );
    }

    return (
      <div ref={ref} className={className} {...props}>
        <LogoContent size={size} />
      </div>
    );
  }
);

Logo.displayName = "Logo";
