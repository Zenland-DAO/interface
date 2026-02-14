"use client";

/**
 * useWeb3Transaction
 *
 * Shared transaction executor for wagmi writes.
 *
 * Responsibilities:
 * - standard toast lifecycle (pending/success/error)
 * - track `isPending` and `currentAction`
 * - provide a simple generic `execute` helper
 */

import { useCallback, useRef, useState } from "react";
import { useChainId, usePublicClient, useWriteContract } from "wagmi";
import type { TransactionReceipt } from "viem";

import { parseWeb3Error } from "@/lib/utils/web3-errors";
import {
  dismissToast,
  showPendingToast,
  updateToastPending,
  updateToastError,
  updateToastSuccess,
  type ToastId,
} from "./toasts";

type TxDiagnostics = {
  txHash?: string;
  receipt?: TransactionReceipt;
  action?: string;
  actionLabel?: string;
};

function attachDiagnostics(target: unknown, diag: TxDiagnostics): void {
  if (!target || typeof target !== "object") return;
  Object.assign(target as Record<string, unknown>, diag);
}

// =============================================================================
// TYPES
// =============================================================================

export type TransactionState = "idle" | "pending" | "confirming" | "success" | "error";

export interface UseWeb3TransactionOptions {
  onPending?: () => void;
  onConfirming?: (txHash: string) => void;
  onSuccess?: (txHash: string) => void;
  onError?: (error: unknown) => void;
  successMessage?: string;
  pendingMessage?: string;
  errorTitle?: string;
}

type WriteContractAsyncFn = NonNullable<ReturnType<typeof useWriteContract>["writeContractAsync"]>;

export interface UseWeb3TransactionReturn {
  execute: <T>(
    transactionFn: () => Promise<T>,
    options?: {
      pendingMessage?: string;
      successMessage?: string;
      errorTitle?: string;
      onSuccess?: (result: T) => void;
    }
  ) => Promise<T | null>;

  executeTransaction: (
    transactionFn: (writeContractAsync: WriteContractAsyncFn) => Promise<string>,
    options: {
      action: string;
      actionLabel: string;
      onSuccess?: (txHash: string) => void;
      onError?: (error: unknown) => void;
    }
  ) => Promise<string | null>;

  isPending: boolean;
  currentAction: string | null;

  /** Most recent tx hash submitted by this hook (if any). */
  txHash: string | null;
  /** Most recent receipt (if any) - set for both success and mined reverts. */
  receipt: TransactionReceipt | null;
  /** Most recent error (if any) - useful for rendering persistent UI errors. */
  lastError: unknown | null;
  /** Receipt-aware state. */
  state: TransactionState;
}

/**
 * Error thrown when a transaction is mined but reverted (receipt.status = 0).
 * Includes txHash/receipt so UIs can show copyable diagnostics.
 */
export class MinedRevertError extends Error {
  txHash?: string;
  receipt?: TransactionReceipt;
  action?: string;
  actionLabel?: string;
  cause?: unknown;

  constructor(message: string, opts?: {
    txHash?: string;
    receipt?: TransactionReceipt;
    action?: string;
    actionLabel?: string;
    cause?: unknown;
  }) {
    super(message);
    this.name = "MinedRevertError";
    this.txHash = opts?.txHash;
    this.receipt = opts?.receipt;
    this.action = opts?.action;
    this.actionLabel = opts?.actionLabel;
    this.cause = opts?.cause;
  }
}

// =============================================================================
// HOOK
// =============================================================================

export function useWeb3Transaction(
  defaultOptions?: UseWeb3TransactionOptions
): UseWeb3TransactionReturn {
  const [state, setState] = useState<TransactionState>("idle");
  const [currentAction, setCurrentAction] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<TransactionReceipt | null>(null);
  const [lastError, setLastError] = useState<unknown | null>(null);

  // Bridge async executeTransaction() calls with receipt state changes.
  const inFlightRef = useRef<{
    toastId: ToastId;
    action: string;
    actionLabel: string;
    resolve: (hash: string) => void;
    reject: (err: unknown) => void;
  } | null>(null);

  // Get the current chain ID from wagmi - ensures transactions target the correct chain
  const chainId = useChainId();
  const { writeContractAsync } = useWriteContract();

  // Prefer direct receipt waiting over query callbacks.
  // This is more reliable (no React Query callback semantics) and ensures that
  // reverts propagate as errors.
  const publicClient = usePublicClient();

  const isPending = state === "pending" || state === "confirming";

  const execute = useCallback(
    async <T>(
      transactionFn: () => Promise<T>,
      options?: {
        pendingMessage?: string;
        successMessage?: string;
        errorTitle?: string;
        onSuccess?: (result: T) => void;
      }
    ): Promise<T | null> => {
      const pendingMessage =
        options?.pendingMessage ||
        defaultOptions?.pendingMessage ||
        "Processing transaction...";
      const successMessage =
        options?.successMessage ||
        defaultOptions?.successMessage ||
        "Transaction successful!";
      const errorTitle =
        options?.errorTitle || defaultOptions?.errorTitle || "Transaction Failed";

      const toastId = showPendingToast(pendingMessage);

      try {
        defaultOptions?.onPending?.();
        const result = await transactionFn();

        const txHash = typeof result === "string" ? result : undefined;
        if (txHash) defaultOptions?.onConfirming?.(txHash);

        // NOTE: `execute()` is for generic async work and does not enforce receipt mining.
        // Prefer `executeTransaction()` for on-chain writes.
        updateToastSuccess(toastId, successMessage, {
          description: txHash ? "Transaction submitted" : undefined,
        });

        defaultOptions?.onSuccess?.(txHash || "");
        options?.onSuccess?.(result);
        return result;
      } catch (error) {
        const parsed = parseWeb3Error(error);

        if (parsed.isUserRejection) {
          dismissToast(toastId);
        } else {
          updateToastError(toastId, error, { title: errorTitle });
        }

        defaultOptions?.onError?.(error);
        return null;
      }
    },
    [defaultOptions]
  );

  const executeTransaction = useCallback(
    async (
      transactionFn: (writeFn: WriteContractAsyncFn) => Promise<string>,
      options: {
        action: string;
        actionLabel: string;
        onSuccess?: (txHash: string) => void;
        onError?: (error: unknown) => void;
      }
    ): Promise<string | null> => {
      const { action, actionLabel } = options;

      setLastError(null);
      setReceipt(null);
      setState("pending");
      setCurrentAction(action);

      const toastId = showPendingToast(`${actionLabel} — confirm in wallet`);

      try {
        // Bridge toasts + state with a future-proof resolve/reject handle.
        // (We keep this even though we currently return the txHash directly.)
        const resolve = () => {};
        const reject = () => {};
        inFlightRef.current = { toastId, action, actionLabel, resolve, reject };

        // Wrap the wagmi write fn so we can capture the last write request.
        // This enables us to re-simulate the exact call if the tx is mined but reverts.
        // Also ensures chainId is always included to target the correct network.
        let lastWriteRequest: Parameters<WriteContractAsyncFn>[0] | null = null;
        const wrappedWrite = (async (req: Parameters<WriteContractAsyncFn>[0]) => {
          // Inject chainId to ensure the transaction targets the correct network
          const reqWithChain = { ...req, chainId };
          lastWriteRequest = reqWithChain;
          // wagmi's inferred generic type can be narrower; convert via `unknown`.
          return (writeContractAsync as unknown as WriteContractAsyncFn)(reqWithChain);
        }) as WriteContractAsyncFn;

        const hash = await transactionFn(wrappedWrite);

        // Move into confirming state; now wait for receipt.
        setTxHash(hash);
        setState("confirming");
        updateToastPending(toastId, `${actionLabel} — confirming...`, {
          description: "Waiting for transaction to be mined",
        });
        defaultOptions?.onConfirming?.(hash);

        if (!publicClient) {
          throw new Error("No public client available to wait for transaction receipt");
        }

        // Wait until the tx is mined.
        const receipt = await publicClient.waitForTransactionReceipt({
          hash: hash as `0x${string}`,
        });

        // Store receipt regardless of outcome (useful for diagnostics).
        setReceipt(receipt);

        // viem returns a receipt even for reverts; receipt.status indicates success.
        if (receipt.status !== "success") {
          // Try to re-simulate the exact contract call to recover the custom error.
          // This will typically throw a viem BaseError that includes the custom error name + args.
          let decodedCause: unknown = null;
          if (lastWriteRequest) {
            try {
              await publicClient.simulateContract(
                lastWriteRequest as unknown as Parameters<typeof publicClient.simulateContract>[0]
              );
            } catch (simErr) {
              decodedCause = simErr;
            }
          }

          // Prefer the decoded cause, but always throw an error that includes tx + receipt.
          if (decodedCause) {
            // Attach diagnostics for downstream UIs (copy/paste reports).
            attachDiagnostics(decodedCause, {
              txHash: hash,
              receipt,
              action,
              actionLabel,
            });
            throw decodedCause;
          }

          throw new MinedRevertError("Transaction reverted", {
            txHash: hash,
            receipt,
            action,
            actionLabel,
          });
        }

        setState("success");
        setLastError(null);
        updateToastSuccess(toastId, `${actionLabel} confirmed`, {
          description: "Transaction mined",
        });
        defaultOptions?.onSuccess?.(hash);
        inFlightRef.current?.resolve(hash);
        inFlightRef.current = null;
        setCurrentAction(null);
        // Keep last successful tx hash available to consumers.
        // (Do not clear; UIs may want to show it.)

        // We already resolved the promise above; just return the hash.
        // (Keeping the promise bridge is useful if we later reintroduce query-based receipt waits.)
        options.onSuccess?.(hash);
        return hash;
      } catch (error) {
        const parsed = parseWeb3Error(error);

        if (parsed.isUserRejection) {
          dismissToast(toastId);
        } else {
          updateToastError(toastId, error, {
            title: `${actionLabel} failed`,
          });
        }

        setState("error");
        setLastError(error);
        options.onError?.(error);
        defaultOptions?.onError?.(error);
        inFlightRef.current?.reject(error);
        inFlightRef.current = null;
        setCurrentAction(null);
        // IMPORTANT: keep txHash/receipt if available so the UI can show diagnostics.
        return null;
      }
    },
    [chainId, defaultOptions, publicClient, writeContractAsync]
  );

  return {
    execute,
    executeTransaction,
    isPending,
    currentAction,
    txHash,
    receipt,
    lastError,
    state,
  };
}

