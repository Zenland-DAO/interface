import type { TransactionReceipt } from "viem";

import { parseWeb3Error } from "@/lib/utils/web3-errors";

type ErrorWithDiagnostics = {
  txHash?: string;
  receipt?: TransactionReceipt;
  action?: string;
  actionLabel?: string;
};

export type Web3ErrorReport = {
  title: string;
  message: string;
  contractErrorName?: string;
  txHash?: string;
  chainId?: number;
  action?: string;
  actionLabel?: string;
  receiptStatus?: string;
  receiptBlockNumber?: string;
  receiptGasUsed?: string;
  // minimal raw bits so users can paste to support channels
  rawMessage?: string;
};

export function buildWeb3ErrorReport(params: {
  title: string;
  error: unknown;
  chainId?: number;
}): Web3ErrorReport {
  const parsed = parseWeb3Error(params.error);
  const diag = (params.error as ErrorWithDiagnostics) ?? {};
  const receipt = diag.receipt;

  return {
    title: params.title,
    message: parsed.message,
    contractErrorName: parsed.contractErrorName,
    chainId: params.chainId,
    txHash: diag.txHash,
    action: diag.action,
    actionLabel: diag.actionLabel,
    receiptStatus: receipt?.status,
    receiptBlockNumber: receipt?.blockNumber ? String(receipt.blockNumber) : undefined,
    receiptGasUsed: receipt?.gasUsed ? String(receipt.gasUsed) : undefined,
    rawMessage: params.error instanceof Error ? params.error.message : String(params.error),
  };
}

export function formatWeb3ErrorReport(report: Web3ErrorReport): string {
  const entries = Object.entries(report).filter(([, v]) => v !== undefined && v !== "");
  const lines = entries.map(([k, v]) => `${k}: ${v}`);
  return [`[Zenland] ${report.title}`, ...lines].join("\n");
}

export async function copyWeb3ErrorReportToClipboard(report: Web3ErrorReport): Promise<boolean> {
  const text = formatWeb3ErrorReport(report);
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers.
    try {
      const el = document.createElement("textarea");
      el.value = text;
      el.style.position = "fixed";
      el.style.left = "-9999px";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      return true;
    } catch {
      return false;
    }
  }
}
