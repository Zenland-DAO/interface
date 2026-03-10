"use client";

/**
 * EscrowDetails
 *
 * Displays the main escrow information:
 * - Amount with token symbol
 * - State description
 * - Participants (buyer, seller, agent)
 * - Terms hash
 */

import { Copy, Check, User, UserCheck, Shield } from "lucide-react";
import { useState, useCallback } from "react";
import { toast } from "sonner";

import { useTranslations } from "next-intl";
import { Card, CardHeader, CardBody, Heading, Text } from "@/components/ui";
import { useEscrowDetail } from "../EscrowDetailContext";
import { formatAmount } from "@/lib/utils/amount";

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Truncate an address for display.
 */
function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface AddressRowProps {
  label: string;
  address: string | null;
  icon: React.ReactNode;
  isCurrentUser?: boolean;
}

function AddressRow({ label, address, icon, isCurrentUser }: AddressRowProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!address) return;
    
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      toast.success("Address copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy address");
    }
  }, [address]);

  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-2">
        <span className="text-[var(--text-tertiary)]">{icon}</span>
        <Text variant="muted" className="text-sm font-medium">
          {label}
        </Text>
        {isCurrentUser && (
          <span className="text-[10px] px-1.5 py-0.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded font-semibold">
            You
          </span>
        )}
      </div>

      {address ? (
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 group hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded px-2 py-1 -mr-2 transition-colors"
        >
          <Text className="font-mono text-xs">{truncateAddress(address)}</Text>
          {copied ? (
            <Check size={12} className="text-success-500" />
          ) : (
            <Copy
              size={12}
              className="text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors"
            />
          )}
        </button>
      ) : (
        <Text variant="muted" className="text-sm italic">
          Not assigned
        </Text>
      )}
    </div>
  );
}

// =============================================================================
// COMPONENT
// =============================================================================

export function EscrowDetails() {
  const t = useTranslations("escrows");
  const { escrow, tokenInfo, role } = useEscrowDetail();

  const stateDescription = t(`stateDescriptions.${escrow.state}`);
  const formattedAmount = formatAmount(escrow.amount, tokenInfo.decimals);

  return (
    <Card variant="elevated">
      <CardHeader>
        <Heading level={3} className="text-lg">
          {t("detail.escrowDetails")}
        </Heading>
      </CardHeader>

      <CardBody className="space-y-6">
        {/* Amount Section */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Text
              variant="muted"
              className="text-xs uppercase font-bold tracking-wider mb-1"
            >
              {t("detail.amount")}
            </Text>
            <Text className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {formattedAmount} {tokenInfo.symbol}
            </Text>
          </div>

          <div>
            <Text
              variant="muted"
              className="text-xs uppercase font-bold tracking-wider mb-1"
            >
              {t("detail.status")}
            </Text>
            <Text className="text-sm">{stateDescription}</Text>
          </div>
        </div>

        {/* Participants Section */}
        <div className="pt-4 border-t border-[var(--border-secondary)]">
          <Text
            variant="muted"
            className="text-xs uppercase font-bold tracking-wider mb-2"
            >
              {t("detail.participants")}
            </Text>

          <div className="divide-y divide-[var(--border-secondary)]">
            <AddressRow
              label={t("roles.buyer")}
              address={escrow.buyer}
              icon={<User size={14} />}
              isCurrentUser={role.isBuyer}
            />
            <AddressRow
              label={t("roles.seller")}
              address={escrow.seller}
              icon={<UserCheck size={14} />}
              isCurrentUser={role.isSeller}
            />
            <AddressRow
              label={t("roles.agent")}
              address={escrow.agent}
              icon={<Shield size={14} />}
              isCurrentUser={role.isAgent}
            />
          </div>
        </div>

        {/* Terms Hash Section */}
        <div className="pt-4 border-t border-[var(--border-secondary)]">
          <Text
            variant="muted"
            className="text-xs uppercase font-bold tracking-wider mb-3"
            >
              {t("detail.termsHash")}
            </Text>
          <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-[var(--border-secondary)] font-mono text-xs break-all text-[var(--text-secondary)]">
            {escrow.termsHash}
          </div>
        </div>

        {/* Resolution Info (if resolved) */}
        {escrow.resolvedAt && (
          <div className="pt-4 border-t border-[var(--border-secondary)]">
            <Text
              variant="muted"
              className="text-xs uppercase font-bold tracking-wider mb-3"
            >
              {t("detail.resolution")}
            </Text>
            <div className="grid grid-cols-2 gap-4">
              {escrow.buyerReceived !== null && (
                <div>
                  <Text variant="muted" className="text-xs mb-1">
                    {t("detail.buyerReceived")}
                  </Text>
                  <Text className="font-semibold">
                    {formatAmount(escrow.buyerReceived, tokenInfo.decimals)}{" "}
                    {tokenInfo.symbol}
                  </Text>
                </div>
              )}
              {escrow.sellerReceived !== null && (
                <div>
                  <Text variant="muted" className="text-xs mb-1">
                    {t("detail.sellerReceived")}
                  </Text>
                  <Text className="font-semibold">
                    {formatAmount(escrow.sellerReceived, tokenInfo.decimals)}{" "}
                    {tokenInfo.symbol}
                  </Text>
                </div>
              )}
              {escrow.agentFeeReceived !== null &&
                escrow.agentFeeReceived > 0n && (
                  <div>
                    <Text variant="muted" className="text-xs mb-1">
                      {t("detail.agentFee")}
                    </Text>
                    <Text className="font-semibold">
                      {formatAmount(escrow.agentFeeReceived, tokenInfo.decimals)}{" "}
                      {tokenInfo.symbol}
                    </Text>
                  </div>
                )}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
