import { forwardRef, type InputHTMLAttributes } from "react";

import { Text } from "./Text";

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Optional error message displayed under the input */
  error?: string;
}

/**
 * Input Component
 *
 * Basic text input with theme-aware styling and optional error message.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", error, disabled, ...props }, ref) => {
    const baseBorder = error
      ? "border-error-300 dark:border-error-700 focus:ring-error-500 focus:border-error-500"
      : "border-neutral-200 dark:border-neutral-800 focus:ring-primary-500 focus:border-primary-500";

    return (
      <div className="w-full">
        <input
          ref={ref}
          disabled={disabled}
          className={
            [
              "w-full",
              "px-4 py-2",
              "rounded-lg",
              "border",
              "bg-white dark:bg-neutral-900",
              "text-[var(--text-primary)]",
              "placeholder:text-[var(--text-tertiary)]",
              "focus:outline-none focus:ring-2",
              "transition-colors",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              baseBorder,
              className,
            ].join(" ")
          }
          {...props}
        />

        {error ? (
          <Text className="mt-1 text-xs text-error-500">{error}</Text>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";

