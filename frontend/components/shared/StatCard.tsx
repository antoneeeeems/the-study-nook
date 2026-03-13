import type { StatCardProps } from "@/lib/types";

const colorMap = {
  teal: "bg-[color:var(--color-surface-2)] text-emerald-600",
  amber: "bg-[color:var(--color-surface-2)] text-amber-600",
  rose: "bg-[color:var(--color-surface-2)] text-rose-600",
  indigo: "bg-[color:var(--color-surface-2)] text-[color:var(--color-text-muted)]",
};

export default function StatCard({ label, value, icon, subtitle, color = "teal" }: Readonly<StatCardProps>) {
  return (
    <div className="card soft-shell p-5 animate-fade-in-up">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-text-muted)]">{label}</p>
          <p className="mt-2 font-mono text-3xl font-bold leading-none text-[color:var(--color-text)]">{value}</p>
          {subtitle && <p className="mt-2 text-xs text-[color:var(--color-text-muted)]">{subtitle}</p>}
        </div>
        <div className={`soft-pressed flex h-10 w-10 items-center justify-center rounded-2xl ${colorMap[color]}`} aria-hidden="true">
          {icon}
        </div>
      </div>
    </div>
  );
}

