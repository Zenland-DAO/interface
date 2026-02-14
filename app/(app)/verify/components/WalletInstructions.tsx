"use client";

/**
 * WalletInstructions component
 * 
 * Displays contextual instructions based on user's role and escrow state
 */

import { User, Shield, CheckCircle2, AlertCircle, Wallet, Info } from "lucide-react";
import { Card, CardBody, Heading, Text, Badge } from "@/components/ui";
import type { WalletInstructions as WalletInstructionsType, EscrowRole } from "../utils";

interface WalletInstructionsProps {
  instructions: WalletInstructionsType;
  role: EscrowRole;
  isConnected: boolean;
}

/**
 * Get icon for the variant
 */
function getVariantIcon(variant: WalletInstructionsType["variant"]) {
  switch (variant) {
    case "action":
      return <AlertCircle className="w-5 h-5" />;
    case "completed":
      return <CheckCircle2 className="w-5 h-5" />;
    case "warning":
      return <AlertCircle className="w-5 h-5" />;
    case "info":
    default:
      return <Info className="w-5 h-5" />;
  }
}

/**
 * Get background color for the variant
 */
function getVariantStyles(variant: WalletInstructionsType["variant"]) {
  switch (variant) {
    case "action":
      return {
        bg: "bg-primary-50 dark:bg-primary-900/20",
        border: "border-primary-200 dark:border-primary-800",
        icon: "text-primary-500",
        title: "text-primary-700 dark:text-primary-400",
        description: "text-primary-600 dark:text-primary-500",
      };
    case "completed":
      return {
        bg: "bg-success-50 dark:bg-success-900/20",
        border: "border-success-200 dark:border-success-800",
        icon: "text-success-500",
        title: "text-success-700 dark:text-success-400",
        description: "text-success-600 dark:text-success-500",
      };
    case "warning":
      return {
        bg: "bg-warning-50 dark:bg-warning-900/20",
        border: "border-warning-200 dark:border-warning-800",
        icon: "text-warning-500",
        title: "text-warning-700 dark:text-warning-400",
        description: "text-warning-600 dark:text-warning-500",
      };
    case "info":
    default:
      return {
        bg: "bg-neutral-50 dark:bg-neutral-800/50",
        border: "border-neutral-200 dark:border-neutral-700",
        icon: "text-neutral-500",
        title: "text-neutral-700 dark:text-neutral-300",
        description: "text-neutral-600 dark:text-neutral-400",
      };
  }
}

/**
 * Get role icon and label
 */
function getRoleDisplay(role: EscrowRole) {
  switch (role) {
    case "buyer":
      return { icon: <User className="w-4 h-4" />, label: "Buyer" };
    case "seller":
      return { icon: <User className="w-4 h-4" />, label: "Seller" };
    case "agent":
      return { icon: <Shield className="w-4 h-4" />, label: "Agent" };
    case "none":
    default:
      return { icon: <Wallet className="w-4 h-4" />, label: "Viewer" };
  }
}

export function WalletInstructions({ instructions, role, isConnected }: WalletInstructionsProps) {
  const styles = getVariantStyles(instructions.variant);
  const roleDisplay = getRoleDisplay(role);

  return (
    <Card variant="outlined" className={`overflow-hidden ${styles.border}`}>
      <CardBody className={`${styles.bg}`}>
        <div className="flex items-start gap-4">
          {/* Role Badge */}
          <div className="shrink-0">
            {isConnected ? (
              <Badge 
                variant={role === "none" ? "secondary" : "primary"}
                className="flex items-center gap-1.5"
              >
                {roleDisplay.icon}
                {roleDisplay.label}
              </Badge>
            ) : (
              <Badge variant="secondary" className="flex items-center gap-1.5">
                <Wallet className="w-4 h-4" />
                Not Connected
              </Badge>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className={styles.icon}>{getVariantIcon(instructions.variant)}</span>
              <Heading level={5} className={styles.title}>
                {instructions.title}
              </Heading>
            </div>
            <Text variant="small" className={styles.description}>
              {instructions.description}
            </Text>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
