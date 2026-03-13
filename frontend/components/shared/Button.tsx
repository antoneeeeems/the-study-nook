import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-[color:var(--color-text)] text-white shadow-sm hover:opacity-95",
  secondary: "border border-[color:var(--color-border)] bg-[color:var(--color-surface-1)] text-[color:var(--color-text)] hover:bg-[color:var(--color-surface-2)]",
  ghost: "bg-transparent text-[color:var(--color-text-muted)] hover:bg-[color:var(--color-surface-2)] hover:text-[color:var(--color-text)]",
  danger: "bg-rose-600 text-white shadow-sm hover:bg-rose-700",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs rounded-full",
  md: "px-4 py-2.5 text-sm rounded-full",
  lg: "px-5 py-3 text-base rounded-full",
};

export default function Button({
  children,
  className = "",
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  icon,
  type = "button",
  ...props
}: Readonly<ButtonProps>) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-100 disabled:bg-[color:var(--color-surface-3)] disabled:text-[color:var(--color-text-muted)] disabled:border disabled:border-[color:var(--color-border-strong)] disabled:shadow-none ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : icon}
      {children}
    </button>
  );
}

