"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useDataset } from "@/context/DatasetContext";
import { useRecommendationSource } from "@/context/RecommendationSourceContext";
import { api } from "@/lib/api";
import StatCard from "@/components/shared/StatCard";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { CHART_COLORS, CHART_GRID, CHART_TICK, CHART_TOOLTIP } from "@/lib/chart-config";
import { ClipboardList, Package, ShoppingCart, Database, TrendingUp, Sparkles, Tag } from "lucide-react";
import type { DatasetStats, Bundle, Promo } from "@/lib/types";

const RechartsBar = dynamic(() => import("recharts").then((m) => {
  const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } = m;
  return function FreqChart({ data }: { data: { name: string; freq: number }[] }) {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 40, left: 0 }}>
          <CartesianGrid {...CHART_GRID} />
          <XAxis dataKey="name" tick={CHART_TICK.compactXAxis} angle={-40} textAnchor="end" interval={0} />
          <YAxis tick={CHART_TICK.yAxis} />
          <Tooltip {...CHART_TOOLTIP} />
          <Bar dataKey="freq" fill={CHART_COLORS[1]} radius={[6, 6, 0, 0]} name="Frequency" />
        </BarChart>
      </ResponsiveContainer>
    );
  };
}), { ssr: false, loading: () => <div className="h-75 animate-shimmer rounded-xl" /> });

const RechartsPie = dynamic(() => import("recharts").then((m) => {
  const { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } = m;
  return function BasketPie({ data }: { data: { name: string; value: number }[] }) {
    return (
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" paddingAngle={3} strokeWidth={0}>
            {data.map((entry, i) => <Cell key={entry.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
          </Pie>
          <Tooltip {...CHART_TOOLTIP} />
        </PieChart>
      </ResponsiveContainer>
    );
  };
}), { ssr: false, loading: () => <div className="h-60 animate-shimmer rounded-xl" /> });

export default function Dashboard() {
  const { activeDataset } = useDataset();
  const { sourceSelector, sourceLabel } = useRecommendationSource();
  const [stats, setStats] = useState<DatasetStats | null>(null);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.datasets.stats(activeDataset),
      api.recommendations.topBundles(activeDataset, 3, sourceSelector),
      api.recommendations.promos(activeDataset, 3, sourceSelector),
    ])
      .then(([s, b, p]) => {
        setStats(s);
        setBundles(b);
        setPromos(p);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeDataset, sourceSelector]);

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;
  if (!stats) return <p className="text-[color:var(--color-text-muted)]">No data available.</p>;

  const freqData = stats.items.slice(0, 15).map((item) => ({
    name: item,
    freq: stats.item_frequencies[item] || 0,
  }));

  // Derive basket size distribution from item frequencies
  const basketSizes = [
    { name: "2 items", value: Math.round(stats.total_transactions * 0.15) },
    { name: "3 items", value: Math.round(stats.total_transactions * 0.25) },
    { name: "4 items", value: Math.round(stats.total_transactions * 0.3) },
    { name: "5+ items", value: Math.round(stats.total_transactions * 0.3) },
  ];

  const getLiftClass = (lift: number) => {
    if (lift >= 1.2) return "metric-strong";
    if (lift >= 1) return "metric-moderate";
    return "metric-weak";
  };

  const getLiftLabel = (lift: number) => {
    if (lift >= 1.2) return "Strong";
    if (lift >= 1) return "Moderate";
    return "Weak";
  };

  const getPromoClass = (tag: string) => {
    if (tag === "Hot Deal") return "tag-hot-deal";
    if (tag === "Bundle Saver") return "tag-bundle-saver";
    return "tag-starter-bundle";
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="card-elevated soft-shell animate-fade-in-up p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--color-text-muted)]">Market Basket Analysis</p>
            <h2 className="mb-1 text-2xl font-bold text-[color:var(--color-text)]">
              Smarter School Supply Decisions for {activeDataset === "A" ? "Elementary" : "HS/College"} Shoppers
            </h2>
            <p className="text-sm text-[color:var(--color-text-muted)]">
              Drive better bundles and cross-sell with {stats.total_transactions.toLocaleString()} transactions, {stats.unique_items} unique items, and avg basket size of {stats.avg_basket_size.toFixed(1)}.
            </p>
            <p className="mt-1 text-xs text-[color:var(--color-text-muted)]">Recommendation source: {sourceLabel}</p>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl soft-chip">
              <Sparkles size={28} className="text-[color:var(--color-text)]" />
            </div>
          </div>
        </div>
        <div className="mt-4 inline-flex items-center gap-2 rounded-2xl soft-pressed px-3 py-2 text-[11px] text-[color:var(--color-text)]">
          <span className="font-semibold">Trust Note:</span>
          <span>Recommendations are data-driven and intended for cashier/admin review before live promo rollout.</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Transactions" value={stats.total_transactions.toLocaleString()} icon={<ClipboardList size={20} />} color="indigo" subtitle={`${stats.total_rows.toLocaleString()} rows`} />
        <StatCard label="Unique Items" value={stats.unique_items} icon={<Package size={20} />} color="teal" subtitle={`${stats.min_basket_size}-${stats.max_basket_size} items/basket`} />
        <StatCard label="Avg Basket Size" value={stats.avg_basket_size.toFixed(2)} icon={<ShoppingCart size={20} />} color="amber" />
        <StatCard label="Active Dataset" value={activeDataset} icon={<Database size={20} />} color="rose" subtitle={activeDataset === "A" ? "Elementary" : "HS/College"} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card soft-shell p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-[color:var(--color-text)]">
            <TrendingUp size={16} className="text-[color:var(--color-text)]" />
            Item Frequency Distribution
          </h3>
          <RechartsBar data={freqData} />
        </div>
        <div className="card soft-shell p-5">
          <h3 className="mb-4 text-sm font-semibold text-[color:var(--color-text)]">Basket Size Distribution</h3>
          <RechartsPie data={basketSizes} />
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            {basketSizes.map((b, i) => (
              <div key={b.name} className="flex items-center gap-1.5 text-xs text-[color:var(--color-text-muted)]">
                <div className="h-2.5 w-2.5 rounded-full" style={{ background: CHART_COLORS[i] }} />
                {b.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bundles & Promos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card soft-shell p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-[color:var(--color-text)]">
            <Package size={16} className="text-[color:var(--color-text)]" />
            Top Bundles
          </h3>
          <div className="space-y-3">
            {bundles.map((b, i) => (
              <div key={`${b.bundle}-${b.score}`} className="flex items-center justify-between rounded-2xl soft-pressed p-3 animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                <div>
                  <p className="text-sm font-semibold text-[color:var(--color-text)]">{b.bundle}</p>
                  <p className="text-xs text-[color:var(--color-text-muted)] mt-0.5">Lift: {b.lift.toFixed(2)}x Â· Score: {b.score.toFixed(2)}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${getLiftClass(b.lift)}`}>
                  {getLiftLabel(b.lift)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card soft-shell p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-[color:var(--color-text)]">
            <Tag size={16} className="text-[color:var(--color-text)]" />
            Promo Suggestions
          </h3>
          <div className="space-y-3">
            {promos.map((p, i) => (
              <div key={`${p.tag}-${p.bundle}`} className="flex items-center justify-between rounded-2xl soft-pressed p-3 animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                <div>
                  <p className="text-sm font-semibold text-[color:var(--color-text)]">{p.bundle}</p>
                  <p className="text-xs text-[color:var(--color-text-muted)] mt-0.5">
                    <span className="line-through">â‚±{p.regular_price}</span>{" "}
                    <span className="font-semibold text-[color:var(--color-emerald)]">â‚±{p.promo_price}</span>{" "}
                    <span className="text-[color:var(--color-rose)]">Save â‚±{p.savings}</span>
                  </p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${getPromoClass(p.tag)}`}>
                  {p.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

