"use client";

import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useChainId, useConnection } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import type { Address } from "viem";

import { agentRegistryAbi, getContractAddresses } from "@/lib/contracts";
import { useWeb3Transaction } from "@/components/shared/web3/useWeb3Transaction";
import { invalidateAgentQueries } from "./invalidateAgentQueries";

// =============================================================================
// TYPES
// =============================================================================

export type AgentAction =
  | "increaseStablecoinStake"
  | "increaseStablecoinStakeWithPermit"
  | "increaseDaoTokenStake"
  | "increaseDaoTokenStakeWithPermit"
  | "setAvailability"
  | "executeUnstake"
  | "updateProfile"
  | "updateDisputeFee"
  | "updateAssignmentFee";

export interface UseAgentActionsReturn {
  // Staking
  increaseStablecoinStake: (amount: bigint) => Promise<boolean>;
  increaseStablecoinStakeWithPermit: (
    amount: bigint,
    permit: {
      deadline: bigint;
      v: number;
      r: `0x${string}`;
      s: `0x${string}`;
    }
  ) => Promise<boolean>;
  increaseDaoTokenStake: (amount: bigint) => Promise<boolean>;
  increaseDaoTokenStakeWithPermit: (
    amount: bigint,
    permit: {
      deadline: bigint;
      v: number;
      r: `0x${string}`;
      s: `0x${string}`;
    }
  ) => Promise<boolean>;
  executeUnstake: () => Promise<boolean>;
  setAvailability: (available: boolean) => Promise<boolean>;

  // Profile / fees
  updateProfile: (description: string, contact: string) => Promise<boolean>;
  updateAssignmentFee: (feeBps: number) => Promise<boolean>;
  updateDisputeFee: (feeBps: number) => Promise<boolean>;

  // State
  isLoading: boolean;
  /** True while indexer queries are being refetched after a successful tx. */
  isRefreshing: boolean;
  isSubmitting: boolean;
  isConfirming: boolean;
  isSuccess: boolean;
  currentAction: AgentAction | null;
  error: unknown | null;
  hash: string | null;
}

// =============================================================================
// CONTEXT
// =============================================================================

const AgentActionsContext = createContext<UseAgentActionsReturn | null>(null);

export function AgentActionsProvider({ children }: { children: ReactNode }) {
  const value = useCreateAgentActions();
  return createElement(AgentActionsContext.Provider, { value }, children);
}

// =============================================================================
// HOOK
// =============================================================================

/**
 * Unified AgentRegistry write-actions hook.
 *
 * Why this exists:
 * - single tx state across all agent actions (dashboard + modals + edit page)
 * - one place for invalidation/refetch logic
 * - consistent toast lifecycle via `useWeb3Transaction`
 */
/**
 * Access the shared Agent actions instance.
 *
 * IMPORTANT: must be used under `<AgentActionsProvider>` to guarantee a single
 * tx state across dashboard/modals/edit page.
 */
export function useAgentActions(): UseAgentActionsReturn {
  const ctx = useContext(AgentActionsContext);
  if (!ctx) {
    throw new Error(
      "useAgentActions must be used within <AgentActionsProvider>. Wrap your page (dashboard/edit) with the provider to share tx state across components."
    );
  }
  return ctx;
}

// =============================================================================
// INTERNAL: create a single actions instance
// =============================================================================

function useCreateAgentActions(): UseAgentActionsReturn {
  const chainId = useChainId();
  const queryClient = useQueryClient();
  const addresses = useMemo(() => getContractAddresses(chainId), [chainId]);
  const agentRegistryAddress = addresses?.agentRegistry as Address | undefined;

  const { address } = useConnection();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    executeTransaction,
    state,
    isPending,
    txHash,
    lastError,
    currentAction,
  } = useWeb3Transaction({
    onSuccess: async () => {
      if (!address) return;

      // Mark cached data stale and kick active refetch immediately (no artificial delay).
      invalidateAgentQueries(queryClient, address as Address);

      setIsRefreshing(true);
      try {
        await Promise.all([
          queryClient.refetchQueries({
            queryKey: ["indexer", "agent", address],
            type: "active",
          }),
          queryClient.refetchQueries({
            queryKey: ["indexer", "agents"],
            type: "active",
          }),
        ]);
      } finally {
        setIsRefreshing(false);
      }
    },
  });

  const hasRegistryAddress = useCallback(
    (addr: Address | undefined): addr is Address => Boolean(addr),
    []
  );

  const run = useCallback(
    async (
      action: AgentAction,
      actionLabel: string,
      transactionFn: Parameters<typeof executeTransaction>[0]
    ): Promise<boolean> => {
      if (!hasRegistryAddress(agentRegistryAddress)) return false;
      const hash = await executeTransaction(transactionFn, { action, actionLabel });
      return Boolean(hash);
    },
    [executeTransaction, hasRegistryAddress, agentRegistryAddress]
  );

  // ---------------------------------------------------------------------------
  // Staking
  // ---------------------------------------------------------------------------

  const increaseStablecoinStake = useCallback(
    async (amount: bigint) => {
      return run(
        "increaseStablecoinStake",
        "Increasing stake",
        (write) =>
          write({
            address: agentRegistryAddress as Address,
            abi: agentRegistryAbi,
            functionName: "increaseStablecoinStake",
            args: [amount],
          })
      );
    },
    [agentRegistryAddress, run]
  );

  const increaseStablecoinStakeWithPermit = useCallback(
    async (
      amount: bigint,
      permit: {
        deadline: bigint;
        v: number;
        r: `0x${string}`;
        s: `0x${string}`;
      }
    ) => {
      return run(
        "increaseStablecoinStakeWithPermit",
        "Increasing stake",
        (write) =>
          write({
            address: agentRegistryAddress as Address,
            abi: agentRegistryAbi,
            functionName: "increaseStablecoinStakeWithPermit",
            args: [amount, permit],
          })
      );
    },
    [agentRegistryAddress, run]
  );

  const increaseDaoTokenStake = useCallback(
    async (amount: bigint) => {
      return run(
        "increaseDaoTokenStake",
        "Increasing stake",
        (write) =>
          write({
            address: agentRegistryAddress as Address,
            abi: agentRegistryAbi,
            functionName: "increaseDaoTokenStake",
            args: [amount],
          })
      );
    },
    [agentRegistryAddress, run]
  );

  const increaseDaoTokenStakeWithPermit = useCallback(
    async (
      amount: bigint,
      permit: {
        deadline: bigint;
        v: number;
        r: `0x${string}`;
        s: `0x${string}`;
      }
    ) => {
      return run(
        "increaseDaoTokenStakeWithPermit",
        "Increasing stake",
        (write) =>
          write({
            address: agentRegistryAddress as Address,
            abi: agentRegistryAbi,
            functionName: "increaseDaoTokenStakeWithPermit",
            args: [amount, permit],
          })
      );
    },
    [agentRegistryAddress, run]
  );

  const setAvailability = useCallback(
    async (available: boolean) => {
      return run(
        "setAvailability",
        available ? "Setting available" : "Setting unavailable",
        (write) =>
          write({
            address: agentRegistryAddress as Address,
            abi: agentRegistryAbi,
            functionName: "setAvailability",
            args: [available],
          })
      );
    },
    [agentRegistryAddress, run]
  );

  const executeUnstake = useCallback(async () => {
    return run("executeUnstake", "Unstaking", (write) =>
      write({
        address: agentRegistryAddress as Address,
        abi: agentRegistryAbi,
        functionName: "executeUnstake",
      })
    );
  }, [agentRegistryAddress, run]);

  // ---------------------------------------------------------------------------
  // Profile / fees
  // ---------------------------------------------------------------------------

  const updateProfile = useCallback(
    async (description: string, contact: string) => {
      return run(
        "updateProfile",
        "Updating profile",
        (write) =>
          write({
            address: agentRegistryAddress as Address,
            abi: agentRegistryAbi,
            functionName: "updateAgentProfile",
            args: [description.trim(), contact.trim()],
          })
      );
    },
    [agentRegistryAddress, run]
  );

  const updateDisputeFee = useCallback(
    async (feeBps: number) => {
      return run(
        "updateDisputeFee",
        "Updating dispute fee",
        (write) =>
          write({
            address: agentRegistryAddress as Address,
            abi: agentRegistryAbi,
            functionName: "updateAgentDisputeFee",
            args: [BigInt(feeBps)],
          })
      );
    },
    [agentRegistryAddress, run]
  );

  const updateAssignmentFee = useCallback(
    async (feeBps: number) => {
      return run(
        "updateAssignmentFee",
        "Updating assignment fee",
        (write) =>
          write({
            address: agentRegistryAddress as Address,
            abi: agentRegistryAbi,
            functionName: "updateAgentAssignmentFee",
            args: [BigInt(feeBps)],
          })
      );
    },
    [agentRegistryAddress, run]
  );

  return {
    increaseStablecoinStake,
    increaseStablecoinStakeWithPermit,
    increaseDaoTokenStake,
    increaseDaoTokenStakeWithPermit,
    setAvailability,
    executeUnstake,
    updateProfile,
    updateDisputeFee,
    updateAssignmentFee,
    isLoading: isPending || isRefreshing,
    isRefreshing,
    isSubmitting: state === "pending",
    isConfirming: state === "confirming",
    isSuccess: state === "success",
    currentAction: (currentAction as AgentAction | null) ?? null,
    error: lastError,
    hash: txHash,
  };
}
