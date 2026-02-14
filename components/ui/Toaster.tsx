"use client";

import { Toaster as SonnerToaster } from "sonner";
import { useTheme } from "@/components/providers";

/**
 * Toaster component - wrapper around Sonner for toast notifications
 * Automatically adapts to light/dark theme
 */
export function Toaster() {
  const { theme } = useTheme();

  return (
    <SonnerToaster
      theme={theme === "dark" ? "dark" : "light"}
      position="bottom-right"
      toastOptions={{
        style: {
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-primary)",
          color: "var(--text-primary)",
        },
        classNames: {
          toast: "font-sans",
          title: "font-medium",
          description: "text-sm opacity-80",
          actionButton: "bg-primary-500 text-white",
          cancelButton: "bg-neutral-200 text-neutral-700",
        },
      }}
      richColors
      closeButton
    />
  );
}

// Re-export toast function for easy imports
export { toast } from "sonner";
