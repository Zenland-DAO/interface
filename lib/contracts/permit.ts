import type { Hex } from "viem";

import type { PermitSignature } from "@/hooks/contracts/useTokenApproval";

export type PermitParams = {
  deadline: bigint;
  v: number;
  r: `0x${string}`;
  s: `0x${string}`;
};

export const EMPTY_PERMIT: PermitParams = {
  deadline: BigInt(0),
  v: 0,
  r: "0x0000000000000000000000000000000000000000000000000000000000000000",
  s: "0x0000000000000000000000000000000000000000000000000000000000000000",
};

/**
 * Convert a hook-level PermitSignature to the on-chain EscrowTypes.PermitParams tuple.
 */
export function toPermitParams(sig: PermitSignature | null): PermitParams {
  if (!sig) return EMPTY_PERMIT;
  return {
    deadline: sig.deadline,
    v: sig.v,
    r: sig.r as unknown as Hex as `0x${string}`,
    s: sig.s as unknown as Hex as `0x${string}`,
  };
}
