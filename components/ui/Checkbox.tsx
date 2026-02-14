import { forwardRef, type InputHTMLAttributes } from "react";
import { Check } from "lucide-react";

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  checked: boolean;
  onChange?: (checked: boolean) => void;
}

/**
 * Checkbox Component
 *
 * A premium custom checkbox that maintains the native accessibility
 * but provides consistent branding.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ checked, onChange, className = "", disabled, ...props }, ref) => {
    return (
      <div className={`relative inline-flex items-center group ${className}`}>
        <input
          ref={ref}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.checked)}
          className="sr-only"
          {...props}
        />
        <div
          onClick={() => !disabled && onChange?.(!checked)}
          className={`
            w-5 h-5 rounded-md border-2 transition-all duration-200 flex items-center justify-center cursor-pointer
            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            ${
              checked
                ? "bg-primary-500 border-primary-500 shadow-sm"
                : "border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 group-hover:border-primary-400"
            }
          `}
        >
          {checked && (
            <Check
              size={12}
              className="text-white stroke-[4]"
            />
          )}
        </div>
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

