"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { api } from "@/lib/api";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { CHART_GRID, CHART_TICK, CHART_TOOLTIP, CHART_LEGEND, CHART_COLORS } from "@/lib/chart-config";
import StatCard from "@/components/shared/StatCard";
import { ClipboardList, TrendingUp, Crown, CircleDot, Lightbulb, CheckCircle2 } from "lucide-react";
import type { BusinessInsights } from "@/lib/types";

type CompareChartDatum = { name: string; a: number; b: number };

const LazyBarChart = dynamic(() => import("recharts").then((m) => {
  const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } = m;
  return function CompareChart({ data }: { data: CompareChartDatum[] }) {
    return (
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <CartesianGrid {...CHART_GRID} />
          <XAxis dataKey="name" tick={CHART_TICK.xAxis} />
          <YAxis tick={CHART_TICK.yAxis} />
          <Tooltip {...CHART_TOOLTIP} />
          <Legend {...CHART_LEGEND} />
          <Bar dataKey="a" fill={CHART_COLORS[0]} radius={[6, 6, 0, 0]} name="Dataset A" />
          <Bar dataKey="b" fill={CHART_COLORS[1]} radius={[6, 6, 0, 0]} name="Dataset B" />
        </BarChart>
      </ResponsiveContainer>
    );
  };
}), { ssr: false, loading: () => <div className="h-55 animate-shimmer rounded-xl" /> });

export default function InsightsPage() {
  const [insights, setInsights] = useState<BusinessInsights | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.recommendations
      .insights()
      .then(setInsights)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Analyzing insights..." />;
  if (!insights) return <p className="text-[color:var(--color-text-muted)]">No insights available.</p>;

  const overlap = insights.cross_dataset_overlap.jaccard;

  const chartData = [
    { name: "Rules", a: insights.rule_volume.dataset_a, b: insights.rule_volume.dataset_b },
    {
      name: "Avg Lift",
      a: Number.parseFloat(insights.avg_lift.dataset_a.toFixed(2)),
      b: Number.parseFloat(insights.avg_lift.dataset_b.toFixed(2)),
    },
  ];

  const getOverlapBarClass = (value: number) => {
    if (value < 0.3) return "bg-rose-500";
    if (value < 0.6) return "bg-amber-500";
    return "bg-emerald-500";
  };

  const getOverlapMessage = (value: number) => {
    if (value < 0.3) {
      return "LOW overlap — maintain separate recommendation engines per segment.";
    }
    if (value < 0.6) {
      return "MODERATE overlap — some patterns transfer but segment-specific rules matter.";
    }
    return "HIGH overlap — a unified recommendation model is viable.";
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[color:var(--color-text)]">Business Insights</h2>
        <p className="text-sm text-[color:var(--color-text-muted)]">Comparison of Dataset A (Elementary) vs Dataset B (HS/College)</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Rules (A)" value={insights.rule_volume.dataset_a} icon={<ClipboardList size={20} />} color="indigo" subtitle={insights.rule_volume.richer === "A" ? "Richer dataset" : ""} />
        <StatCard label="Rules (B)" value={insights.rule_volume.dataset_b} icon={<ClipboardList size={20} />} color="amber" subtitle={insights.rule_volume.richer === "B" ? "Richer dataset" : ""} />
        <StatCard label="Avg Lift (A)" value={insights.avg_lift.dataset_a.toFixed(4)} icon={<TrendingUp size={20} />} color="teal" subtitle={insights.avg_lift.stronger === "A" ? "Stronger associations" : ""} />
        <StatCard label="Avg Lift (B)" value={insights.avg_lift.dataset_b.toFixed(4)} icon={<TrendingUp size={20} />} color="rose" subtitle={insights.avg_lift.stronger === "B" ? "Stronger associations" : ""} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="card soft-shell p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-[color:var(--color-text)]">
            <TrendingUp size={16} className="text-[color:var(--color-text)]" />
            Dataset Comparison
          </h3>
          <LazyBarChart data={chartData} />
        </div>

        {/* Strongest Rules */}
        <div className="card soft-shell p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-[color:var(--color-text)]">
            <Crown size={16} className="text-[color:var(--color-text)]" />
            Strongest Rule Per Dataset
          </h3>
          {[
            { label: "Dataset A", rule: insights.strongest_rule.dataset_a, bg: "bg-[color:var(--color-surface-2)] border-[color:var(--color-border)]" },
            { label: "Dataset B", rule: insights.strongest_rule.dataset_b, bg: "bg-[color:var(--color-surface-2)] border-[color:var(--color-border)]" },
          ].map(({ label, rule, bg }) => (
            <div key={label} className={`soft-pressed p-4 rounded-xl border mb-3 ${bg}`}>
              <p className="mb-1 text-xs font-semibold text-[color:var(--color-text-muted)]">{label}</p>
              {rule ? (
                <>
                  <p className="text-sm font-bold text-[color:var(--color-text)]">
                    [{rule.antecedent}] → [{rule.consequent}]
                  </p>
                  <p className="mt-1 font-mono text-xs text-[color:var(--color-text-muted)]">
                    Conf: {(rule.confidence * 100).toFixed(1)}% · Lift: {rule.lift.toFixed(2)}x · Score: {rule.score.toFixed(4)}
                  </p>
                </>
              ) : (
                <p className="text-xs text-[color:var(--color-text-muted)]">No rules available</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Hub Products */}
      <div className="card soft-shell p-5">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-[color:var(--color-text)]">
          <CircleDot size={16} className="text-[color:var(--color-text)]" />
          Hub Products (Most Connected)
        </h3>
        <div className="grid grid-cols-2 gap-6">
          {[
            { label: "Dataset A", hubs: insights.hub_products.dataset_a },
            { label: "Dataset B", hubs: insights.hub_products.dataset_b },
          ].map(({ label, hubs }) => (
            <div key={label}>
              <p className="mb-3 text-xs font-semibold text-[color:var(--color-text-muted)]">{label}</p>
              <div className="space-y-2">
                {hubs.map((h, i) => {
                  const maxRules = hubs[0]?.rule_count || 1;
                  return (
                    <div key={h.item} className="flex items-center gap-3">
                      <span className="w-5 text-center text-sm font-bold text-[color:var(--color-text-muted)]">{i + 1}</span>
                      <div className="flex-1">
                        <div className="mb-1 flex justify-between text-sm">
                          <span className="font-medium text-[color:var(--color-text)]">{h.item}</span>
                          <span className="font-mono text-xs text-[color:var(--color-text-muted)]">{h.rule_count} rules</span>
                        </div>
                        <div className="soft-pressed h-1.5 overflow-hidden rounded-full bg-[color:var(--color-border)]">
                          <div
                            className="h-full rounded-full bg-[color:var(--color-indigo-700)] transition-all duration-500"
                            style={{ width: `${(h.rule_count / maxRules) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cross-Dataset Overlap — Venn Diagram */}
      <div className="card soft-shell p-5">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-[color:var(--color-text)]">
          <CircleDot size={16} className="text-[color:var(--color-text)]" />
          Cross-Dataset Overlap
        </h3>
        <div className="flex items-center gap-8">
          {/* Venn diagram */}
          <div className="relative w-64 h-40 shrink-0 mx-auto">
            <div className="soft-pressed absolute left-2 top-4 flex h-32 w-32 items-center justify-start rounded-full border-2 border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] pl-5">
              <div className="text-center">
                <p className="text-lg font-bold text-[color:var(--color-text)]">{insights.cross_dataset_overlap.only_a}</p>
                <p className="text-[9px] font-medium text-[color:var(--color-text-muted)]">Only A</p>
              </div>
            </div>
            <div className="soft-pressed absolute right-2 top-4 flex h-32 w-32 items-center justify-end rounded-full border-2 border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] pr-5">
              <div className="text-center">
                <p className="text-lg font-bold text-[color:var(--color-text)]">{insights.cross_dataset_overlap.only_b}</p>
                <p className="text-[9px] font-medium text-[color:var(--color-text-muted)]">Only B</p>
              </div>
            </div>
            {/* Overlap center */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-center">
              <p className="text-lg font-bold text-[color:var(--color-text)]">{insights.cross_dataset_overlap.shared}</p>
              <p className="text-[9px] font-medium text-[color:var(--color-text-muted)]">Shared</p>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[color:var(--color-text-muted)]">Jaccard Similarity</span>
              <span className="text-sm font-bold font-mono text-[color:var(--color-text)]">{overlap.toFixed(4)}</span>
            </div>
            <div className="soft-pressed mb-3 h-5 w-full overflow-hidden rounded-full bg-[color:var(--color-border)]">
              <div
                className={`h-full rounded-full transition-all duration-700 ${getOverlapBarClass(overlap)}`}
                style={{ width: `${overlap * 100}%` }}
              />
            </div>
            <p className="text-xs text-[color:var(--color-text-muted)]">{getOverlapMessage(overlap)}</p>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="card soft-shell p-5">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-[color:var(--color-text)]">
          <Lightbulb size={16} className="text-[color:var(--color-text)]" />
          Actionable Recommendations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {insights.recommendations.map((rec) => (
            <div key={rec} className="soft-pressed flex items-start gap-3 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] p-4 transition-all">
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-border)]">
                <CheckCircle2 size={14} className="text-[color:var(--color-text)]" />
              </div>
              <p className="text-sm text-[color:var(--color-text-muted)]">{rec}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
