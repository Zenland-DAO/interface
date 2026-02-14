"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { Info, AlertCircle } from "lucide-react";
import { Text } from "./Text";

/**
 * NumberInput Component
 *
 * A premium, controlled number input component.
 * Features:
 * - Prevents negative values (configurable)
 * - Support for prefixes (e.g. $) and suffixes (e.g. ZEN)
 * - Integrated error and helper messages
 * - "Max" button support
 */

interface NumberInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "prefix"> {
  label?: string;
  hideLabel?: boolean;
  error?: string;
  helperText?: string | React.ReactNode;
  prefix?: string | React.ReactNode;
  suffix?: string;
  allowNegative?: boolean;
  allowDecimals?: boolean;
  onMax?: () => void;
  onChange?: (value: string) => void;
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      label,
      hideLabel = false,
      error,
      helperText,
      prefix,
      suffix,
      allowDecimals = true,
      onMax,
      onChange,
      className = "",
      disabled,
      value,
      ...props
    },
    ref
  ) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let val = e.target.value;

      // Only allow digits and at most one decimal point
      const regex = allowDecimals ? /[^0-9.]/g : /[^0-9]/g;
      val = val.replace(regex, "");

      if (allowDecimals) {
        const parts = val.split(".");
        if (parts.length > 2) {
          val = parts[0] + "." + parts.slice(1).join("");
        }
      }

      // Handle leading zeros: "01" -> "1", "00" -> "0", but "0.1" stays "0.1"
      if (val.length > 1 && val.startsWith("0") && val[1] !== ".") {
        val = val.replace(/^0+/, "");
        if (val === "") val = "0";
        if (val.startsWith(".")) val = "0" + val;
      }

      onChange?.(val);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Prevent non-numeric keys except control keys
      const charRegex = allowDecimals ? /[0-9.]/ : /[0-9]/;
      if (
        !charRegex.test(e.key) &&
        !["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Enter", "Home", "End"].includes(e.key) &&
        !(e.ctrlKey || e.metaKey)
      ) {
        e.preventDefault();
      }
    };

    return (
      <div className={`space-y-2 ${className}`}>
        {label && !hideLabel && (
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] ml-1">
            {label}
          </label>
        )}

        <div className="relative group">
          {/* Prefix */}
          {prefix && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center h-full text-sm font-bold text-neutral-400 z-10">
              {prefix}
            </div>
          )}

          <input
            ref={ref}
            type="text"
            inputMode="decimal"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            className={`
              w-full h-12
              ${prefix ? "pl-40" : "pl-4"}
              ${(suffix || onMax) ? "pr-20" : "pr-4"}
              rounded-xl border
              ${error ? "border-error-500 ring-1 ring-error-500/20" : "border-[var(--border-secondary)]"}
              bg-[var(--bg-primary)]
              text-sm font-medium
              outline-none
              transition-all duration-200
              focus:ring-2
              focus:ring-primary-500/20
              focus:border-primary-500
              hover:border-neutral-300 dark:hover:border-neutral-700
              disabled:opacity-50 disabled:cursor-not-allowed
            `.trim()}
            {...props}
          />

          {/* Suffix / Max Button Container */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {onMax && !disabled && (
              <button
                type="button"
                onClick={onMax}
                className="px-2 py-1 text-[10px] font-black uppercase tracking-tighter rounded bg-primary-100 dark:bg-primary-900/30 text-primary-600 hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors"
              >
                Max
              </button>
            )}
            {suffix && (
              <span className="text-[10px] font-bold text-neutral-400 mr-1">
                {suffix}
              </span>
            )}
          </div>
        </div>

        {/* Footer info: Error or Helper */}
        {(error || helperText) && (
          <div className="flex items-center gap-1.5 px-1 min-h-[16px]">
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
);

NumberInput.displayName = "NumberInput";
