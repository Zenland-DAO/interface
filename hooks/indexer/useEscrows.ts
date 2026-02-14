"use client";

import { useConnection } from "wagmi";
import {
  useEscrows as useSdkEscrows,
  STATE_GROUPS,
  type EscrowRole,
  type EscrowStateTab,
  type UseEscrowsArgs as SdkUseEscrowsArgs,
} from "@zenland/sdk/react";

export type { EscrowRole, EscrowStateTab };

export interface UseEscrowsArgs
  extends Omit<SdkUseEscrowsArgs, "address" | "enabled" | "stateTab"> {
  /** Include `needs_attention` in the UI, but it is filtered client-side */
  stateTab?: EscrowStateTab | "needs_attention";
}

export function useEscrows(args?: UseEscrowsArgs) {
  const { address } = useConnection();

  // NOTE: `needs_attention` is a UI-only tab. We still fetch all escrows and
  // filter in the component.
  const stateTab = args?.stateTab === "needs_attention" ? "all" : args?.stateTab;

  return useSdkEscrows({
    ...args,
    address,
    stateTab,
    enabled: !!address,
  });
}

/** Re-export state groups for use in components */
export { STATE_GROUPS };
