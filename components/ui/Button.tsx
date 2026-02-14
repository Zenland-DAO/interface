import { forwardRef, type ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    bg-primary-500 text-white
    hover:bg-white hover:text-primary-600
    hover:scale-[1.02] hover:shadow-lg
    active:scale-[0.98]
    dark:bg-primary-500 dark:hover:bg-white dark:hover:text-primary-600
    shadow-sm transition-all duration-300 ease-out
  `,
  secondary: `
    bg-neutral-100 text-neutral-900
    hover:bg-white hover:scale-[1.02]
    active:scale-[0.98]
    dark:bg-neutral-800 dark:text-neutral-100
    dark:hover:bg-neutral-700
    transition-all duration-300 ease-out
  `,
  outline: `
    bg-transparent border border-primary-500 text-primary-500
    hover:bg-white hover:text-primary-600 hover:border-white
    hover:scale-[1.02]
    active:scale-[0.98]
    dark:border-primary-400 dark:text-primary-400
    dark:hover:bg-white dark:hover:text-primary-600 dark:hover:border-white
    transition-all duration-300 ease-out
  `,
  ghost: `
    bg-transparent text-neutral-700
    hover:bg-neutral-100 hover:scale-[1.02]
    active:scale-[0.98]
    dark:text-neutral-300
    dark:hover:bg-neutral-800
    transition-all duration-300 ease-out
  `,
  danger: `
    bg-error-500 text-white
    hover:bg-white hover:text-error-600
    hover:scale-[1.02]
    active:scale-[0.98]
    dark:bg-error-500 dark:hover:bg-white dark:hover:text-error-600
    shadow-sm transition-all duration-300 ease-out
  `,
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm rounded-md gap-1.5",
  md: "px-4 py-2 text-base rounded-lg gap-2",
  lg: "px-6 py-3 text-lg rounded-xl gap-2.5",
};

/**
 * Button Component
 *
 * A versatile button component with multiple variants and sizes.
 * Supports loading state, icons, and all standard button attributes.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`
          inline-flex items-center justify-center
          font-medium cursor-pointer
          focus-visible:outline-none focus-visible:ring-2
          focus-visible:ring-primary-500 focus-visible:ring-offset-2
          dark:focus-visible:ring-offset-neutral-900
          disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!isLoading && leftIcon}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";
