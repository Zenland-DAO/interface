"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { type LucideIcon, Wallet } from "lucide-react";
import Image from "next/image";

/**
 * WalletOption Component
 *
 * A clean, Apple-style wallet connection option button.
 * Features subtle hover states and proper alignment.
 * Supports both Lucide icons and custom image icons.
 *
 * @example
 * // With Lucide icon
 * <WalletOption
 *   icon={Wallet}
 *   name="MetaMask"
 *   description="Connect with browser extension"
 *   onClick={() => connect('metamask')}
 * />
 *
 * @example
 * // With custom image
 * <WalletOption
 *   imageSrc="/assets/wallets/metamask-icon.svg"
 *   name="MetaMask"
 *   description="Connect with browser extension"
 *   onClick={() => connect('metamask')}
 * />
 *
 * @example
 * // Sponsored wallet (NYKNYC)
 * <WalletOption
 *   imageSrc="/assets/wallets/nyknyc-icon.svg"
 *   name="NYKNYC"
 *   description="Connect with gas-free transactions"
 *   sponsored
 *   sponsorBadge="Sponsored by Zenland - No gas fees"
 *   onClick={() => connect('nyknyc')}
 * />
 */

interface WalletOptionProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Lucide icon component (fallback if no imageSrc) */
  icon?: LucideIcon | React.FC<{ className?: string }>;
  /** Custom image source - takes priority over icon */
  imageSrc?: string;
  /** Wallet name */
  name: string;
  /** Optional description */
  description?: string;
  /** Show as popular/recommended */
  popular?: boolean;
  /** Show as sponsored (special styling for NYKNYC) */
  sponsored?: boolean;
  /** Sponsor badge text (e.g., "Sponsored by Zenland - No gas fees") */
  sponsorBadge?: string;
}

export const WalletOption = forwardRef<HTMLButtonElement, WalletOptionProps>(
  (
    {
      icon: IconComponent,
      imageSrc,
      name,
      description,
      popular = false,
      sponsored = false,
      sponsorBadge,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    // Determine base styles based on sponsored status
    const baseStyles = sponsored
      ? `
          bg-gradient-to-r from-primary-50 to-transparent
          dark:from-primary-950/30 dark:to-transparent
          border border-primary-200 dark:border-primary-800
          hover:from-primary-100 hover:to-primary-50/50
          dark:hover:from-primary-900/40 dark:hover:to-primary-950/20
        `
      : `
          bg-transparent
          hover:bg-[var(--state-hover)]
          active:bg-[var(--state-selected)]
        `;

    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        className={`
          w-full
          flex items-center gap-4
          px-4 py-3.5
          text-left
          rounded-xl
          transition-all duration-150
          ${baseStyles}
          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-[var(--border-focus)]
          focus-visible:ring-offset-2
          focus-visible:ring-offset-[var(--bg-primary)]
          disabled:opacity-50
          disabled:cursor-not-allowed
          disabled:hover:bg-transparent
          ${className}
        `.trim()}
        {...props}
      >
        {/* Icon Container */}
        <div
          className={`
            flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden
            ${sponsored 
              ? "bg-primary-100 dark:bg-primary-900/50" 
              : "bg-[var(--bg-tertiary)]"
            }
          `}
        >
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={`${name} icon`}
              width={28}
              height={28}
              className="object-contain"
            />
          ) : IconComponent ? (
            <IconComponent className="w-5 h-5 text-[var(--text-primary)]" />
          ) : (
            <Wallet className="w-5 h-5 text-[var(--text-primary)]" />
          )}
        </div>

        {/* Text Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`
                font-medium
                ${sponsored ? "text-primary-700 dark:text-primary-300" : "text-[var(--text-primary)]"}
              `}
            >
              {name}
            </span>
            {popular && !sponsored && (
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300">
                Popular
              </span>
            )}
            {sponsored && (
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400">
                Recommended
              </span>
            )}
          </div>
          {description && (
            <span className="block mt-0.5 text-sm text-[var(--text-tertiary)] truncate">
              {description}
            </span>
          )}
          {sponsorBadge && (
            <span className="block mt-1 text-xs font-medium text-success-600 dark:text-success-400">
              ✨ {sponsorBadge}
            </span>
          )}
        </div>

        {/* Chevron */}
        <svg
          className={`
            w-5 h-5 flex-shrink-0
            ${sponsored ? "text-primary-400 dark:text-primary-500" : "text-[var(--text-tertiary)]"}
          `}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    );
  }
);

WalletOption.displayName = "WalletOption";
