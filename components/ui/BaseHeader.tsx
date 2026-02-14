import { ReactNode } from "react";

/**
 * BaseHeader Component
 *
 * Unified header layout that provides consistent structure across marketing and app.
 * Uses slot-based design for flexible content while maintaining fixed positioning.
 *
 * Key features:
 * - Consistent left padding (px-12 sm:px-16 lg:px-24) for logo alignment
 * - Fixed height (h-14) for predictable layout
 * - Sticky positioning with backdrop blur
 * - Mobile-first responsive design
 *
 * @example Marketing
 * <BaseHeader
 *   leftSlot={<Logo />}
 *   centerSlot={<nav>...</nav>}
 *   rightSlot={<ThemeToggle /> + <Button>Launch App</Button>}
 * />
 *
 * @example App
 * <BaseHeader
 *   leftSlot={<MobileMenu /> or <Logo />}
 *   rightSlot={<ThemeToggle /> + <ConnectedWallet />}
 * />
 */

interface BaseHeaderProps {
  /** Content for left section - typically logo or mobile menu + logo */
  leftSlot?: ReactNode;
  /** Content for center section - typically navigation links (marketing only) */
  centerSlot?: ReactNode;
  /** Content for right section - typically theme toggle + CTA or wallet */
  rightSlot?: ReactNode;
  /** Additional className for customization */
  className?: string;
}

export function BaseHeader({
  leftSlot,
  centerSlot,
  rightSlot,
  className = "",
  paddingX = "px-4 lg:px-8", // Aligns with main content's p-4 lg:p-8
}: BaseHeaderProps & { paddingX?: string }) {
  return (
    <header
      className={`
        sticky top-0 z-50 w-full
        border-b border-[var(--border-secondary)]
        bg-[var(--nav-bg)]
        backdrop-blur-xl
        supports-[backdrop-filter]:bg-[var(--nav-bg)]
        ${className}
      `.trim()}
    >
      <div className={`flex h-16 items-center justify-between ${paddingX}`}>
        {/* Left Section - Logo */}
        <div className="flex items-center">
          {leftSlot}
        </div>

        {/* Center Section - Navigation (optional) */}
        {centerSlot && (
          <div className="hidden md:flex items-center gap-1">
            {centerSlot}
          </div>
        )}

        {/* Right Section - Actions */}
        <div className="flex items-center gap-3">
          {rightSlot}
        </div>
      </div>
    </header>
  );
}
