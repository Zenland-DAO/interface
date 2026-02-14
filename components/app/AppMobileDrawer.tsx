"use client";

import { useEffect } from "react";

import { AppSidebar } from "./AppSidebar";

type AppMobileDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function AppMobileDrawer({ isOpen, onClose }: AppMobileDrawerProps) {
  // Close on Escape.
  useEffect(() => {
    if (!isOpen) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close menu"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="absolute inset-y-0 left-0 w-[85%] max-w-xs shadow-xl">
        <AppSidebar onNavigate={onClose} />
      </div>
    </div>
  );
}

