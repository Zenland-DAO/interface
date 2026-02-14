import type { config } from "./config";

// Enables global type-safety for wagmi hooks based on our config.
declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
