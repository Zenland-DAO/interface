"use client";

/**
 * useWalletAction Hook
 *
 * DRY pattern for gating on-chain actions behind wallet connection.
 * If wallet is not connected, opens the connect wallet modal.
 * Otherwise, executes the action.
 *
 * @example
 * ```tsx
 * const { requireWallet, isConnected } = useWalletAction();
 *
 * <Button onClick={() => requireWallet(() => onOpenModal("release"))}>
 *   Release Funds
 * </Button>
 * ```
 */

import { useCallback } from "react";
import { useConnection } from "wagmi";
import { useWalletModal } from "@/components/providers/WalletModalContext";

export interface UseWalletActionReturn {
    /**
     * Wrap an action to require wallet connection.
     * If not connected, opens the modal. Otherwise, executes the action.
     */
    requireWallet: (action: () => void) => void;
    /** Whether the wallet is currently connected */
    isConnected: boolean;
}

/**
 * Hook to gate on-chain actions behind wallet connection.
 */
export function useWalletAction(): UseWalletActionReturn {
    const { status } = useConnection();
    const { openModal } = useWalletModal();

    const isConnected = status === "connected";

    const requireWallet = useCallback(
        (action: () => void) => {
            if (!isConnected) {
                openModal();
                return;
            }
            action();
        },
        [isConnected, openModal]
    );

    return { requireWallet, isConnected };
}
