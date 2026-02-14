"use client";

/**
 * AgentCollateral
 *
 * Displays agent's stake and financial information:
 * - Maximum Arbitrage Coverage (MAV)
 * - Stablecoin Stake
 * - DAO Token Stake
 * - Total Earnings
 * - Total Slashed
 */

import { Wallet, TrendingUp } from "lucide-react";

import { Card, CardHeader, CardBody, Heading, Text, Icon } from "@/components/ui";
import { useAgentProfile } from "../AgentProfileContext";
import { formatAmount } from "@/components/app/escrows/create/schema";

// =============================================================================
// CONSTANTS
// =============================================================================

/** Multiplier for calculating maximum arbitrage coverage */
const ARBITRAGE_MULTIPLIER = 20;

// =============================================================================
// TYPES
// =============================================================================

interface CollateralItem {
  label: string;
  value: string;
  unit: string;
  isNegative?: boolean;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function AgentCollateral() {
  const { agent } = useAgentProfile();

  const maxCoverage = formatAmount(
    BigInt(agent.stablecoinStake) * BigInt(ARBITRAGE_MULTIPLIER),
    agent.stablecoinDecimals || 6,
    0
  );

  const collateralItems: CollateralItem[] = [
    {
      label: "Stablecoin Stake",
      value: formatAmount(BigInt(agent.stablecoinStake), agent.stablecoinDecimals || 6),
      unit: "USDT/C",
    },
    {
      label: "DAO Token Stake",
      value: formatAmount(BigInt(agent.daoTokenStake), 18, 0),
      unit: "ZEN",
    },
    {
      label: "Total Earnings",
      value: formatAmount(BigInt(agent.totalEarnings), agent.stablecoinDecimals || 6),
      unit: "USD",
    },
    {
      label: "Total Slashed",
      value: formatAmount(BigInt(agent.totalSlashed || "0"), agent.stablecoinDecimals || 6, 0),
      unit: "USD",
      isNegative: true,
    },
  ];

  return (
    <Card variant="outlined">
      <CardHeader className="border-b border-[var(--border-secondary)]">
        <div className="flex items-center gap-3">
          <Icon icon={Wallet} boxed boxColor="primary" size="sm" />
          <Heading level={4}>Agent Collateral</Heading>
        </div>
      </CardHeader>
      <CardBody className="p-6 space-y-5">
        {/* Max Coverage Highlight */}
        <div className="p-4 rounded-lg bg-primary-50 dark:bg-primary-900/10 border border-primary-200 dark:border-primary-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-primary-500" />
              <Text variant="caption" className="text-xs font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
                Max Coverage
              </Text>
            </div>
            <Text className="text-xl font-bold text-primary-600 dark:text-primary-400">
              ${maxCoverage}
            </Text>
          </div>
          <Text variant="muted" className="text-xs mt-1">
            Based on stablecoin stake × {ARBITRAGE_MULTIPLIER}
          </Text>
        </div>

        {/* Collateral Details */}
        <div className="space-y-4">
          {collateralItems.map((item, index) => (
            <div key={index} className="flex justify-between items-center">
              <div className="space-y-0.5">
                <Text variant="muted" className="text-xs uppercase tracking-wider font-medium">
                  {item.label}
                </Text>
              </div>
              <div className="text-right">
                <span
                  className={`font-mono text-sm font-semibold ${
                    item.isNegative
                      ? "text-error-500"
                      : "text-[var(--text-primary)]"
                  }`}
                >
                  {item.value}
                </span>
                <Text variant="muted" className="text-xs ml-1">
                  {item.unit}
                </Text>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
