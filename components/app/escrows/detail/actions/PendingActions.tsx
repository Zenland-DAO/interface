"use client";

/**
 * PendingActions
 *
 * Actions available during the PENDING state.
 * - Seller: Accept, Decline
 * - Buyer: Cancel (if expired)
 */

import { Check, X, AlertOctagon, Wallet } from "lucide-react";
import { Button } from "@/components/ui";
import { useEscrowDetail } from "../EscrowDetailContext";
import { useWalletAction } from "@/hooks/wallet/useWalletAction";

export function PendingActions() {
    const { actions, write, isLoading } = useEscrowDetail();
    const { availableActions } = actions;
    const { requireWallet, isConnected } = useWalletAction();

    // If no pending actions are available, render nothing
    if (
        !availableActions.accept &&
        !availableActions.decline &&
        !availableActions.cancelExpired
    ) {
        return null;
    }

    return (
        <div className="space-y-3">
            {/* Seller Actions */}
            {(availableActions.accept || availableActions.decline) && (
                <div className="grid grid-cols-2 gap-3">
                    {availableActions.accept && (
                        <Button
                            variant="primary"
                            className="w-full"
                            disabled={isLoading}
                            onClick={() => requireWallet(() => write.accept())}
                        >
                            {isConnected ? (
                                <>
                                    <Check size={18} className="mr-2" />
                                    Accept
                                </>
                            ) : (
                                <>
                                    <Wallet size={18} className="mr-2" />
                                    Connect Wallet
                                </>
                            )}
                        </Button>
                    )}

                    {availableActions.decline && (
                        <Button
                            variant="outline"
                            className="w-full text-error-600 hover:text-error-700 hover:bg-error-50 dark:hover:bg-error-900/20 border-error-200 dark:border-error-800"
                            disabled={isLoading}
                            onClick={() => requireWallet(() => write.decline())}
                        >
                            {isConnected ? (
                                <>
                                    <X size={18} className="mr-2" />
                                    Decline
                                </>
                            ) : (
                                <>
                                    <Wallet size={18} className="mr-2" />
                                    Connect Wallet
                                </>
                            )}
                        </Button>
                    )}
                </div>
            )}

            {/* Buyer Actions */}
            {availableActions.cancelExpired && (
                <Button
                    variant="outline"
                    className="w-full text-error-600 hover:text-error-700 hover:bg-error-50 dark:hover:bg-error-900/20 border-error-200 dark:border-error-800"
                    disabled={isLoading}
                    onClick={() => requireWallet(() => write.cancelExpired())}
                >
                    {isConnected ? (
                        <>
                            <AlertOctagon size={18} className="mr-2" />
                            Cancel & Refund
                        </>
                    ) : (
                        <>
                            <Wallet size={18} className="mr-2" />
                            Connect Wallet
                        </>
                    )}
                </Button>
            )}
        </div>
    );
}
