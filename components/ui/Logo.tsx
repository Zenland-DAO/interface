"use client";

import { forwardRef, type ComponentPropsWithoutRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "@/components/providers";

/**
 * Logo Component
 *
 * The Zenland brand logo using theme-aware SVG.
 * Supports different sizes and can be used as a link or static element.
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
  const { theme } = useTheme();
  const config = sizeConfig[size];
  const src = theme === "dark"
    ? "/branding/logo/svg/logo-dark.svg"
    : "/branding/logo/svg/logo-light.svg";

  return (
    <Image
      src={src}
      alt="Zenland"
      width={config.width}
      height={config.height}
      className="flex-shrink-0"
      unoptimized
      priority
    />
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
