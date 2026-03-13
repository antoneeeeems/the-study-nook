import type { InputHTMLAttributes, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: ReactNode;
}

export default function Input({ leftIcon, className = "", ...props }: Readonly<InputProps>) {
  if (!leftIcon) {
    return (
      <input
        className={`w-full rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-1)] px-4 py-2.5 text-sm text-[color:var(--color-text)] shadow-xs transition-all placeholder:text-[color:var(--color-text-muted)] focus:border-[color:var(--color-focus)] focus:outline-none focus:ring-4 focus:ring-[color:var(--color-focus)]/15 ${className}`}
        {...props}
      />
    );
  }

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--color-text-muted)]" aria-hidden="true">
        {leftIcon}
      </span>
      <input
        className={`w-full rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-1)] py-2.5 pl-9 pr-4 text-sm text-[color:var(--color-text)] shadow-xs transition-all placeholder:text-[color:var(--color-text-muted)] focus:border-[color:var(--color-focus)] focus:outline-none focus:ring-4 focus:ring-[color:var(--color-focus)]/15 ${className}`}
        {...props}
      />
    </div>
  );
}

