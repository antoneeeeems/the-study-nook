import type { SelectHTMLAttributes } from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  options: SelectOption[];
}

export default function Select({ options, className = "", ...props }: Readonly<SelectProps>) {
  return (
    <select
      className={`w-full rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-1)] px-3.5 py-2.5 text-sm text-[color:var(--color-text)] shadow-xs transition-all focus:border-[color:var(--color-focus)] focus:outline-none focus:ring-4 focus:ring-[color:var(--color-focus)]/15 ${className}`}
      {...props}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

