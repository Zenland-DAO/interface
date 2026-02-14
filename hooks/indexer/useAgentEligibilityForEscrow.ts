"use client";

import { useMemo } from "react";
import { formatUnits } from "viem";
import { useAgent } from "@zenland/sdk/react";
import {
  type IndexerAgent,
  isAgentEligibleForEscrow,
  type AgentEligibilityFailureReason,
} from "@zenland/sdk";

function toBigIntSafe(value: unknown): bigint {
  if (typeof value === "bigint") return value;
  if (typeof value === "number") return BigInt(Math.trunc(value));
  if (typeof value === "string") {
    if (!value) return 0n;
    return BigInt(value);
  }
  return 0n;
}

function normalizeIndexerAgent(raw: unknown): IndexerAgent | null {
  if (!raw || typeof raw !== "object") return null;
  const a = raw as Record<string, unknown>;

  return {
    id: String(a["id"] ?? ""),
    isActive: Boolean(a["isActive"]),
    isAvailable: Boolean(a["isAvailable"]),
    stablecoinStake: toBigIntSafe(a["stablecoinStake"]),
    stablecoinDecimals: Number(a["stablecoinDecimals"] ?? 6),
    registrationTime: toBigIntSafe(a["registrationTime"]),
    activeCases: Number(a["activeCases"] ?? 0),
    totalResolved: Number(a["totalResolved"] ?? 0),
  };
}

export type AgentEligibilityStatus =
  | { status: "idle" }
  | { status: "loading" }
  | {
      status: "invalid";
      reason: AgentEligibilityFailureReason;
      agent?: IndexerAgent;
      agentMavUsd?: bigint;
      requiredUsd: bigint;
    }
  | {
      status: "valid";
      agent: IndexerAgent;
      agentMavUsd: bigint;
      requiredUsd: bigint;
    };

/**
 * Determine whether a given agent address is eligible for the current escrow.
 */
export function useAgentEligibilityForEscrow(args: {
  agentAddress: string;
  escrowAmount: bigint | undefined;
}): AgentEligibilityStatus {
  const { data: rawAgent, isLoading } = useAgent(args.agentAddress);

  return useMemo(() => {
    if (!args.agentAddress || !args.escrowAmount) return { status: "idle" };

    if (isLoading) return { status: "loading" };

    const agent = normalizeIndexerAgent(rawAgent);

    const result = isAgentEligibleForEscrow({
      agent,
      escrowAmount: args.escrowAmount,
    });

    if (!result.ok) {
      return {
        status: "invalid",
        reason: result.reason,
        agent: agent ?? undefined,
        agentMavUsd: result.agentMavUsd,
        requiredUsd: result.requiredUsd,
      };
    }

    return {
      status: "valid",
      agent: agent!,
      agentMavUsd: result.agentMavUsd,
      requiredUsd: result.requiredUsd,
    };
  }, [args.agentAddress, args.escrowAmount, isLoading, rawAgent]);
}

/**
 * Format bigint amounts in stablecoin decimals.
 */
export function formatUsdLikeAmount(amount: bigint, decimals: number): string {
  try {
    const raw = formatUnits(amount, decimals);
    const asNumber = Number(raw);
    if (!Number.isFinite(asNumber)) return raw;
    return asNumber.toLocaleString(undefined, { maximumFractionDigits: 2 });
  } catch {
    return amount.toString();
  }
}
