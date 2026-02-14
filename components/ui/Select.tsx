"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check, Info, AlertCircle } from "lucide-react";
import { Text } from "./Text";

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
  hideLabel?: boolean;
  variant?: "default" | "compact";
  helperText?: string | React.ReactNode;
  error?: string;
}

export function Select({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  className = "",
  label,
  hideLabel = false,
  variant = "default",
  helperText,
  error,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && !hideLabel && (
        <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5 ml-1">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center justify-between w-full ${variant === "compact" ? "px-2 tracking-tighter" : "px-4"} py-3
          bg-[var(--bg-primary)] border
          ${error ? "border-error-500 ring-1 ring-error-500/20" : "border-[var(--border-secondary)]"}
          rounded-xl text-sm font-bold transition-all duration-200
          hover:border-[var(--color-primary-400)] focus:outline-none
          focus:ring-2 focus:ring-primary-500/20
          ${isOpen ? "border-[var(--color-primary-500)] ring-2 ring-primary-500/20" : ""}
          ${!selectedOption ? "text-[var(--text-tertiary)]" : "text-[var(--text-primary)]"}
        `}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={18}
          className={`text-[var(--text-tertiary)] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute z-50 mt-2 w-full origin-top rounded-xl glass border border-white/20 dark:border-white/5 shadow-2xl overflow-hidden shadow-black/10"
          >
            <div className="py-1 max-h-60 overflow-auto scrollbar-thin">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`
                    flex items-center justify-between w-full px-4 py-2.5 text-sm font-medium
                    transition-colors hover:bg-[var(--state-hover)]
                    ${value === option.value ? "text-[var(--color-primary-500)] bg-[var(--color-primary-50)] dark:bg-primary-900/20" : "text-[var(--text-secondary)]"}
                  `}
                >
                  <span className="truncate">{option.label}</span>
                  {value === option.value && <Check size={16} />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer info: Error or Helper */}
      {(error || helperText) && (
        <div className="flex items-center gap-1.5 px-1 min-h-[16px] mt-2">
          {error ? (
            <>
              <AlertCircle size={12} className="text-error-500" />
              <Text className="text-[10px] font-medium text-error-500">{error}</Text>
            </>
          ) : (
            <>
              <Info size={12} className="text-neutral-400" />
              <Text variant="muted" className="text-[10px] font-medium">{helperText}</Text>
            </>
          )}
        </div>
      )}
    </div>
  );
}
