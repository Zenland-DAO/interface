"use client";

import { useEffect, useMemo, useState } from "react";
import {
  useConnection,
  useSwitchChain,
  type UseSwitchChainReturnType,
} from "wagmi";

export type UseEnsureChainArgs = {
  /**
   * Chain IDs that the page is willing to operate on.
   * If the user is connected on a chain not in this list, we will attempt to switch.
   */
  supportedChainIds: readonly number[];

  /**
   * Chain the UI should use for actions.
   * If omitted, we default to the first supported chain.
   */
  desiredChainId?: number;

  /** Whether to attempt an automatic network switch when connected on the wrong chain. */
  autoSwitch?: boolean;

  /**
   * If true, we also attempt to switch when user is on a supported chain but
   * not the desired one.
   */
  enforceDesiredChain?: boolean;
};

type SupportedChainId = 1 | 11155111;

export type UseEnsureChainReturn = {
  connection: ReturnType<typeof useConnection>;
  switchChain: UseSwitchChainReturnType;
  isOnSupportedChain: boolean;
  isOnDesiredChain: boolean;
  desiredChainId: SupportedChainId;
  isSwitching: boolean;
  chainError: string | null;
  clearChainError: () => void;
  switchManually: () => void;
};

function isSupportedChainId(chainId: number | undefined, supportedChainIds: readonly number[]) {
  if (!chainId) return false;
  return supportedChainIds.includes(chainId);
}

function isSupportedKnownChainId(chainId: number): chainId is SupportedChainId {
  return chainId === 1 || chainId === 11155111;
}

/**
 * Ensures the user is connected to a supported chain.
 *
 * Pattern:
 * - If connected on unsupported chain, auto-switch to desiredChainId (if enabled)
 * - If auto-switch fails, exposes error + manual switch action
 */
export function useEnsureChain({
  supportedChainIds,
  desiredChainId: desiredChainIdProp,
  autoSwitch = true,
  enforceDesiredChain = false,
}: UseEnsureChainArgs): UseEnsureChainReturn {
  const connection = useConnection();
  const switchChain = useSwitchChain();

  const [chainError, setChainError] = useState<string | null>(null);

  const desiredChainId = useMemo(() => {
    const fallback = supportedChainIds[0];
    const candidate = desiredChainIdProp ?? fallback;

    // Ensure this is both supported by the caller and is one of the wagmi-configured chains.
    if (
      typeof candidate === "number" &&
      supportedChainIds.includes(candidate) &&
      isSupportedKnownChainId(candidate)
    ) {
      return candidate;
    }

    // Otherwise fall back to first supported chain (must also be known)
    if (typeof fallback === "number" && isSupportedKnownChainId(fallback)) {
      return fallback;
    }

    // As a last resort, keep TS happy.
    return 11155111;
  }, [desiredChainIdProp, supportedChainIds]);

  const isConnected = connection.status === "connected";
  const isOnSupportedChain = isSupportedChainId(connection.chainId, supportedChainIds);
  const isOnDesiredChain = connection.chainId === desiredChainId;

  const isSwitching = switchChain.status === "pending";

  const clearChainError = () => setChainError(null);

  const switchManually = () => {
    clearChainError();
    switchChain.mutate(
      { chainId: desiredChainId },
      {
        onError: (err) => {
          setChainError(
            err?.message ||
              `Unsupported network. Please switch to chainId ${desiredChainId}.`,
          );
        },
      },
    );
  };

  // Auto-switch attempt.
  useEffect(() => {
    if (!autoSwitch) return;
    if (!isConnected || isOnSupportedChain) return;

    switchManually();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSwitch, isConnected, isOnSupportedChain, desiredChainId]);

  // Optional: enforce desired chain even when currently on a supported chain.
  useEffect(() => {
    if (!autoSwitch) return;
    if (!enforceDesiredChain) return;
    if (!isConnected) return;
    if (!isOnSupportedChain) return;
    if (isOnDesiredChain) return;

    switchManually();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSwitch, enforceDesiredChain, isConnected, isOnSupportedChain, isOnDesiredChain, desiredChainId]);

  return {
    connection,
    switchChain,
    isOnSupportedChain,
    isOnDesiredChain,
    desiredChainId,
    isSwitching,
    chainError,
    clearChainError,
    switchManually,
  };
}
