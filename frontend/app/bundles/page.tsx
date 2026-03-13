"use client";

import { useEffect, useState } from "react";
import { useDataset } from "@/context/DatasetContext";
import { api } from "@/lib/api";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import MetricBadge from "@/components/shared/MetricBadge";
import { Package, Link2 } from "lucide-react";
import type { Bundle } from "@/lib/types";

export default function BundlesPage() {
  const { activeDataset } = useDataset();
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.recommendations
      .topBundles(activeDataset, 10)
      .then(setBundles)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeDataset]);

  if (loading) return <LoadingSpinner text="Finding bundles..." />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[color:var(--color-text)]">Recommended Product Bundles</h2>
        <p className="text-sm text-[color:var(--color-text-muted)]">High-performing item pairs from Dataset {activeDataset} for upsell, cross-sell, and shelf placement planning</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bundles.map((b, i) => {
          const [itemA, itemB] = b.bundle.split("  +  ");
          return (
            <div
              key={`${b.bundle}-${b.score.toFixed(4)}`}
              className="card p-5 animate-fade-in-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[color:var(--color-surface-2)] border border-[color:var(--color-border)]">
                  <Package size={18} className="text-[color:var(--color-text)]" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[color:var(--color-surface-2)] border border-[color:var(--color-border)] px-3 py-1.5 text-sm font-semibold text-[color:var(--color-text)]">
                    {itemA?.trim()}
                  </span>
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--color-surface-2)] border border-[color:var(--color-border)]">
                    <Link2 size={12} className="text-[color:var(--color-text-muted)]" />
                  </div>
                  <span className="rounded-full bg-[color:var(--color-surface-2)] border border-[color:var(--color-border)] px-3 py-1.5 text-sm font-semibold text-[color:var(--color-text)]">
                    {itemB?.trim()}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                <MetricBadge label="Support" value={b.support} type="support" />
                <MetricBadge label="Conf" value={b.confidence} type="confidence" />
                <MetricBadge label="Lift" value={b.lift} type="lift" />
                <MetricBadge label="Score" value={b.score} type="score" />
              </div>

              <p className="text-xs text-[color:var(--color-text-muted)] leading-relaxed">{b.explanation}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
