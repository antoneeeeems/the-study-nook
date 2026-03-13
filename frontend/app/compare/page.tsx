"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { api } from "@/lib/api";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { CHART_TICK, CHART_TOOLTIP, CHART_LEGEND, CHART_COLORS } from "@/lib/chart-config";
import { Scale, TrendingUp, TrendingDown, Minus, ArrowRight, CircleDot } from "lucide-react";
import type { DatasetStats, Rule } from "@/lib/types";

interface MetricRow {
  label: string;
  a: number;
  b: number;
}

type RadarDatum = { metric: string; a: number; b: number };

function formatMetricValue(value: number) {
  return Number.isInteger(value) ? value.toLocaleString() : value.toFixed(2);
}

function getStrengthClass(strength: string) {
  if (strength === "Strong") return "metric-strong";
  if (strength === "Moderate") return "metric-moderate";
  return "metric-weak";
}

const LazyRadarChart = dynamic(() => import("recharts").then((m) => {
  const { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } = m;
  return function CompareRadar({ data }: { data: RadarDatum[] }) {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={data}>
          <PolarGrid stroke="#dee4ea" />
          <PolarAngleAxis dataKey="metric" tick={CHART_TICK.yAxis} />
          <PolarRadiusAxis tick={CHART_TICK.compactYAxis} />
          <Tooltip {...CHART_TOOLTIP} />
          <Radar name="Dataset A" dataKey="a" stroke={CHART_COLORS[0]} fill={CHART_COLORS[0]} fillOpacity={0.2} strokeWidth={2} />
          <Radar name="Dataset B" dataKey="b" stroke={CHART_COLORS[1]} fill={CHART_COLORS[1]} fillOpacity={0.2} strokeWidth={2} />
          <Legend {...CHART_LEGEND} />
        </RadarChart>
      </ResponsiveContainer>
    );
  };
}), { ssr: false, loading: () => <div className="h-75 animate-shimmer rounded-xl" /> });

export default function ComparePage() {
  const [statsA, setStatsA] = useState<DatasetStats | null>(null);
  const [statsB, setStatsB] = useState<DatasetStats | null>(null);
  const [rulesA, setRulesA] = useState<Rule[]>([]);
  const [rulesB, setRulesB] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.datasets.stats("A"),
      api.datasets.stats("B"),
      api.recommendations.topRules("A", 20),
      api.recommendations.topRules("B", 20),
    ])
      .then(([sa, sb, ra, rb]) => { setStatsA(sa); setStatsB(sb); setRulesA(ra); setRulesB(rb); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Comparing datasets..." />;
  if (!statsA || !statsB) return <p className="text-[color:var(--color-text-muted)]">No data available.</p>;

  const metrics: MetricRow[] = [
    { label: "Transactions", a: statsA.total_transactions, b: statsB.total_transactions },
    { label: "Unique Items", a: statsA.unique_items, b: statsB.unique_items },
    { label: "Avg Basket Size", a: statsA.avg_basket_size, b: statsB.avg_basket_size },
    { label: "Min Basket", a: statsA.min_basket_size, b: statsB.min_basket_size },
    { label: "Max Basket", a: statsA.max_basket_size, b: statsB.max_basket_size },
    { label: "Total Rows", a: statsA.total_rows, b: statsB.total_rows },
    { label: "Rules Mined", a: rulesA.length, b: rulesB.length },
  ];

  // Radar chart data (normalized 0-100)
  const maxTxn = Math.max(statsA.total_transactions, statsB.total_transactions);
  const maxItems = Math.max(statsA.unique_items, statsB.unique_items);
  const maxBasket = Math.max(statsA.avg_basket_size, statsB.avg_basket_size);
  const maxRules = Math.max(rulesA.length, rulesB.length) || 1;
  const radarData = [
    { metric: "Transactions", a: (statsA.total_transactions / maxTxn) * 100, b: (statsB.total_transactions / maxTxn) * 100 },
    { metric: "Items", a: (statsA.unique_items / maxItems) * 100, b: (statsB.unique_items / maxItems) * 100 },
    { metric: "Basket Size", a: (statsA.avg_basket_size / maxBasket) * 100, b: (statsB.avg_basket_size / maxBasket) * 100 },
    { metric: "Rules", a: (rulesA.length / maxRules) * 100, b: (rulesB.length / maxRules) * 100 },
    { metric: "Max Basket", a: (statsA.max_basket_size / Math.max(statsA.max_basket_size, statsB.max_basket_size)) * 100, b: (statsB.max_basket_size / Math.max(statsA.max_basket_size, statsB.max_basket_size)) * 100 },
  ];

  const itemsA = new Set(statsA.items);
  const itemsB = new Set(statsB.items);
  const onlyA = statsA.items.filter((i) => !itemsB.has(i));
  const onlyB = statsB.items.filter((i) => !itemsA.has(i));
  const shared = statsA.items.filter((i) => itemsB.has(i));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-bold text-[color:var(--color-text)]">
          <Scale size={20} className="text-[color:var(--color-text)]" />
          Dataset Comparison
        </h2>
        <p className="text-sm text-[color:var(--color-text-muted)]">Side-by-side analysis of Dataset A (Elementary) vs Dataset B (HS/College)</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <div className="card soft-shell p-5">
          <h3 className="mb-2 text-sm font-semibold text-[color:var(--color-text)]">Metric Comparison</h3>
          <LazyRadarChart data={radarData} />
        </div>

        {/* Metrics Table */}
        <div className="card soft-shell overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[color:var(--color-border)] bg-[color:var(--color-surface-2)]">
                <th className="px-4 py-3 text-left text-xs font-semibold text-[color:var(--color-text-muted)]">Metric</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-[color:var(--color-text)]">Dataset A</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-[color:var(--color-text)]">Dataset B</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-[color:var(--color-text-muted)]">Diff</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map(({ label, a, b }, idx) => {
                const numA = a;
                const numB = b;
                const diff = numA === 0 ? 0 : ((numB - numA) / numA) * 100;
                const hasDiff = diff > 0 || diff < 0;
                return (
                  <tr key={label} className={`border-b border-[color:var(--color-border)] ${idx % 2 === 1 ? "bg-[color:var(--color-surface-2)]" : ""}`}>
                    <td className="px-4 py-2.5 text-[color:var(--color-text-muted)] font-medium">{label}</td>
                    <td className="px-4 py-2.5 text-center font-mono">
                      <span className={numA > numB ? "font-semibold text-[color:var(--color-text)]" : "text-[color:var(--color-text-muted)]"}>
                        {formatMetricValue(a)}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-center font-mono">
                      <span className={numB > numA ? "font-semibold text-[color:var(--color-text)]" : "text-[color:var(--color-text-muted)]"}>
                        {formatMetricValue(b)}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      {hasDiff ? (
                        <span className={`inline-flex items-center gap-0.5 text-xs font-mono font-semibold ${diff > 0 ? "text-[color:var(--color-emerald)]" : "text-[color:var(--color-rose)]"}`}>
                          {diff > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                          {Math.abs(diff).toFixed(0)}%
                        </span>
                      ) : (
                        <Minus size={12} className="mx-auto text-[color:var(--color-text-muted)]" />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Item Vocabulary — Venn */}
      <div className="card soft-shell p-5">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-[color:var(--color-text)]">
          <CircleDot size={16} className="text-[color:var(--color-text)]" />
          Item Vocabulary
        </h3>

        {/* Venn diagram */}
        <div className="relative w-72 h-40 mx-auto mb-6">
          <div className="soft-pressed absolute left-2 top-4 flex h-32 w-32 items-center justify-start rounded-full border-2 border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] pl-4">
            <div className="text-center">
              <p className="text-lg font-bold text-[color:var(--color-text)]">{onlyA.length}</p>
              <p className="text-[9px] font-semibold text-[color:var(--color-text-muted)]">Only A</p>
            </div>
          </div>
          <div className="soft-pressed absolute right-2 top-4 flex h-32 w-32 items-center justify-end rounded-full border-2 border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] pr-4">
            <div className="text-center">
              <p className="text-lg font-bold text-[color:var(--color-text)]">{onlyB.length}</p>
              <p className="text-[9px] font-semibold text-[color:var(--color-text-muted)]">Only B</p>
            </div>
          </div>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-center">
            <p className="text-lg font-bold text-[color:var(--color-text)]">{shared.length}</p>
            <p className="text-[9px] font-semibold text-[color:var(--color-text-muted)]">Shared</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="mb-2 text-xs font-semibold text-[color:var(--color-text)]">Only in Dataset A ({onlyA.length})</p>
            <div className="flex flex-wrap gap-1">
              {onlyA.map((item) => (
                <span key={item} className="soft-pressed rounded-full bg-[color:var(--color-surface-2)] border border-[color:var(--color-border)] px-2.5 py-1 text-xs font-medium text-[color:var(--color-text)]">{item}</span>
              ))}
              {onlyA.length === 0 && <span className="text-xs text-[color:var(--color-text-muted)]">None</span>}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold text-[color:var(--color-text)]">Shared ({shared.length})</p>
            <div className="flex flex-wrap gap-1">
              {shared.map((item) => (
                <span key={item} className="soft-pressed rounded-full bg-[color:var(--color-surface-2)] border border-[color:var(--color-border)] px-2.5 py-1 text-xs font-medium text-[color:var(--color-text)]">{item}</span>
              ))}
              {shared.length === 0 && <span className="text-xs text-[color:var(--color-text-muted)]">None</span>}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold text-[color:var(--color-text)]">Only in Dataset B ({onlyB.length})</p>
            <div className="flex flex-wrap gap-1">
              {onlyB.map((item) => (
                <span key={item} className="soft-pressed rounded-full bg-[color:var(--color-surface-2)] border border-[color:var(--color-border)] px-2.5 py-1 text-xs font-medium text-[color:var(--color-text)]">{item}</span>
              ))}
              {onlyB.length === 0 && <span className="text-xs text-[color:var(--color-text-muted)]">None</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Top Rules Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[
          { label: "Dataset A", rules: rulesA },
          { label: "Dataset B", rules: rulesB },
        ].map(({ label, rules }) => (
          <div key={label} className="card soft-shell p-5">
            <h3 className="mb-4 text-sm font-semibold text-[color:var(--color-text)]">
              Top Rules — {label}
            </h3>
            <div className="space-y-2">
              {rules.slice(0, 8).map((r, i) => (
                <div key={`${r.antecedent}-${r.consequent}-${r.score}`} className="soft-pressed animate-fade-in-up rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] p-3" style={{ animationDelay: `${i * 60}ms` }}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-[color:var(--color-text)]">
                      <span className="font-semibold">{r.antecedent}</span>
                      <ArrowRight size={12} className="mx-1 inline text-[color:var(--color-text-muted)]" />
                      <span className="font-semibold">{r.consequent}</span>
                    </p>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${getStrengthClass(r.strength)}`}>
                      {r.strength}
                    </span>
                  </div>
                  <p className="mt-1 font-mono text-[10px] text-[color:var(--color-text-muted)]">
                    sup={r.support.toFixed(3)} · conf={(r.confidence * 100).toFixed(1)}% · lift={r.lift.toFixed(2)} · score={r.score.toFixed(3)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
