// BigInt polyfill for JSON serialization (required for WalletConnect)
// viem uses BigInt for chain IDs, but WalletConnect uses JSON.stringify internally
(BigInt.prototype as unknown as { toJSON: () => string }).toJSON = function () {
  return this.toString();
};

import type { config } from "./config";

// Enables global type-safety for wagmi hooks based on our config.
declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
