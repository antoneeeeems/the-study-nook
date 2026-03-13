"use client";

import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useTheme } from "@/context/ThemeContext";
import { useRecommendationSource } from "@/context/RecommendationSourceContext";
import { ShoppingCart, ChevronRight, Moon, Sun } from "lucide-react";

const PAGE_NAMES: Record<string, string> = {
  "/": "Dashboard",
  "/transactions": "Transactions",
  "/rules": "Association Rules",
  "/bundles": "Product Bundles",
  "/shop": "Store",
  "/cart": "Shopping Cart",
  "/promos": "Promotions",
  "/pipeline": "Self-Learning Pipeline",
  "/insights": "Business Insights",
};

export default function Header() {
  const { totalQuantity, openMiniCart } = useCart();
  const { theme, toggleTheme } = useTheme();
  const { mode, setMode, pipelineResult, selectedIteration, setSelectedIteration, hasIterationSource } = useRecommendationSource();
  const pathname = usePathname();
  const pageName = PAGE_NAMES[pathname] || "Page";

  const iterationOptions = (pipelineResult?.iterations ?? []).map((iteration) => ({
    value: iteration.iteration,
    label: `v${iteration.iteration}`,
  }));

  return (
    <header className="h-14 bg-[color:var(--color-surface-2)]/92 backdrop-blur-md border-b border-[color:var(--color-border)] flex items-center justify-between px-4 md:px-6 sticky top-0 z-20">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
        <span className="text-[color:var(--color-text-muted)] font-medium">The Study Nook</span>
        <ChevronRight size={14} className="text-[color:var(--color-divider)]" aria-hidden="true" />
        <span className="text-[color:var(--color-text)] font-semibold">{pageName}</span>
      </nav>

      <div className="hidden lg:flex items-center gap-2">
        <button
          type="button"
          onClick={() => setMode("dataset")}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
            mode === "dataset"
              ? "bg-[color:var(--color-text)] text-white"
              : "bg-[color:var(--color-surface-1)] text-[color:var(--color-text-muted)]"
          }`}
        >
          Dataset
        </button>
        <button
          type="button"
          onClick={() => setMode("iteration")}
          disabled={!hasIterationSource}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors disabled:opacity-45 ${
            mode === "iteration"
              ? "bg-[color:var(--color-text)] text-white"
              : "bg-[color:var(--color-surface-1)] text-[color:var(--color-text-muted)]"
          }`}
        >
          Iteration
        </button>
        {mode === "iteration" && iterationOptions.length > 0 && (
          <select
            aria-label="Select recommendation iteration"
            value={selectedIteration ?? iterationOptions[0].value}
            onChange={(event) => setSelectedIteration(Number(event.target.value))}
            className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-1)] px-2 py-1 text-xs text-[color:var(--color-text)]"
          >
            {iterationOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          className="relative p-2 rounded-lg soft-chip text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)] transition-colors"
        >
          {theme === "dark" ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
        </button>

        <button
          type="button"
          onClick={openMiniCart}
          aria-label={`Open mini cart with ${totalQuantity} item${totalQuantity === 1 ? "" : "s"}`}
          className="relative p-2 rounded-lg soft-chip text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)] transition-colors"
        >
          <ShoppingCart size={18} aria-hidden="true" />
          {totalQuantity > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-coral text-white text-[10px] font-bold rounded-full flex items-center justify-center" aria-hidden="true">
              {totalQuantity}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
