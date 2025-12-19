"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  children: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", className = "", children, ...props }, ref) => {
    const baseClasses =
      "ui-label px-6 py-3 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-[var(--color-background)]";

    const variantClasses =
      variant === "primary"
        ? "bg-[var(--color-accent)] text-[var(--color-background)] hover:bg-opacity-90 active:bg-opacity-80"
        : "border border-[var(--color-hairline)] text-[var(--color-text-primary)] hover:border-[var(--color-text-primary)] hover:bg-[var(--color-hairline)] active:bg-opacity-50";

    return (
      <button
        ref={ref}
        className={`${baseClasses} ${variantClasses} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;

