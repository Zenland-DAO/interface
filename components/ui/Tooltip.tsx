"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  delayDuration?: number;
}

/**
 * Tooltip component - accessible tooltip using Radix UI
 */
export function Tooltip({
  children,
  content,
  side = "top",
  align = "center",
  delayDuration = 200,
}: TooltipProps) {
  return (
    <TooltipPrimitive.Provider delayDuration={delayDuration}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            align={align}
            sideOffset={6}
            className="
              z-50
              px-3 py-1.5
              text-sm
              font-medium
              rounded-lg
              bg-[var(--bg-inverse)]
              text-[var(--text-inverse)]
              shadow-lg
              animate-[fade-in_0.15s_ease-out]
              data-[state=closed]:animate-[fade-out_0.1s_ease-in]
            "
          >
            {content}
            <TooltipPrimitive.Arrow className="fill-[var(--bg-inverse)]" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}

// Also export TooltipProvider for wrapping app if needed
export const TooltipProvider = TooltipPrimitive.Provider;
