"use client";

/**
 * Wallet Modal Context
 *
 * Global context to manage the Connect Wallet modal state.
 * - Provides `openModal()` and `closeModal()` functions.
 * - Auto-closes modal on successful wallet connection.
 */

import {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
    type ReactNode,
} from "react";
import { useConnection } from "wagmi";

// Defer state updates to avoid `react-hooks/set-state-in-effect`.
function defer(fn: () => void) {
    setTimeout(fn, 0);
}

// =============================================================================
// TYPES
// =============================================================================

interface WalletModalContextValue {
    /** Whether the modal is open */
    isOpen: boolean;
    /** Open the connect wallet modal */
    openModal: () => void;
    /** Close the connect wallet modal */
    closeModal: () => void;
}

// =============================================================================
// CONTEXT
// =============================================================================

const WalletModalContext = createContext<WalletModalContextValue | null>(null);

// =============================================================================
// PROVIDER
// =============================================================================

export interface WalletModalProviderProps {
    children: ReactNode;
}

export function WalletModalProvider({ children }: WalletModalProviderProps) {
    const [isOpen, setIsOpen] = useState(false);
    const { status } = useConnection();

    const openModal = useCallback(() => {
        setIsOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setIsOpen(false);
    }, []);

    // Auto-close modal when wallet connects successfully
    useEffect(() => {
        if (status === "connected" && isOpen) {
            defer(() => setIsOpen(false));
        }
    }, [status, isOpen]);

    return (
        <WalletModalContext.Provider value={{ isOpen, openModal, closeModal }}>
            {children}
        </WalletModalContext.Provider>
    );
}

// =============================================================================
// HOOK
// =============================================================================

/**
 * Hook to access the wallet modal context.
 *
 * @example
 * ```tsx
 * const { openModal, closeModal, isOpen } = useWalletModal();
 *
 * <Button onClick={openModal}>Connect Wallet</Button>
 * ```
 */
export function useWalletModal(): WalletModalContextValue {
    const context = useContext(WalletModalContext);
    if (!context) {
        throw new Error("useWalletModal must be used within a WalletModalProvider");
    }
    return context;
}
