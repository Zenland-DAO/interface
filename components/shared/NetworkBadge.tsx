"use client";

/**
 * Network configuration for display.
 * Easy to switch between Sepolia (testnet) and Ethereum (mainnet) later.
 */
export interface NetworkConfig {
  name: string;
  isTestnet: boolean;
}

/**
 * Current network configuration.
 */
export const CURRENT_NETWORK: NetworkConfig = {
  name: "Ethereum",
  isTestnet: false,
};

interface NetworkBadgeProps {
  /** Optional network config override */
  network?: NetworkConfig;
  /** Size variant */
  size?: "sm" | "md";
  /** Additional CSS classes */
  className?: string;
}

/**
 * NetworkBadge - Displays current network with visual indicator.
 * 
 * Shows a colored dot (orange for testnet, green for mainnet) 
 * along with the network name.
 */
export function NetworkBadge({ 
  network = CURRENT_NETWORK, 
  size = "md",
  className = ""
}: NetworkBadgeProps) {
  const sizeClasses = {
    sm: "px-2 py-1 text-xs gap-1.5",
    md: "px-3 py-1.5 text-sm gap-2",
  };

  const dotSizeClasses = {
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2",
  };

  const baseClasses = [
    "inline-flex items-center rounded-full font-medium",
    "bg-neutral-100 dark:bg-neutral-800",
    "text-[var(--text-secondary)]",
    "border border-neutral-200 dark:border-neutral-700",
    sizeClasses[size],
    className
  ].filter(Boolean).join(" ");

  const dotClasses = [
    "rounded-full",
    dotSizeClasses[size],
    network.isTestnet ? "bg-warning-500 animate-pulse" : "bg-success-500"
  ].join(" ");

  return (
    <div className={baseClasses}>
      <span className={dotClasses} />
      <span>{network.name}</span>
      {network.isTestnet && (
        <span className="text-[var(--text-tertiary)]">Testnet</span>
      )}
    </div>
  );
}
