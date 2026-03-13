"use client";

import { Fragment, useEffect, useState } from "react";
import { useDataset } from "@/context/DatasetContext";
import { useRecommendationSource } from "@/context/RecommendationSourceContext";
import { api } from "@/lib/api";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import MetricBadge from "@/components/shared/MetricBadge";
import Button from "@/components/shared/Button";
import { ArrowRight, Filter } from "lucide-react";
import type { Rule } from "@/lib/types";

type Strength = "all" | "Strong" | "Moderate" | "Weak";
type SortColumn = "support" | "confidence" | "lift" | "leverage" | "conviction" | "score";

interface SortHeaderProps {
  col: SortColumn;
  label: string;
  sortBy: SortColumn;
  sortDir: "asc" | "desc";
  onSort: (col: SortColumn) => void;
}

const sortValue = (rule: Rule, column: SortColumn): number => {
  const map: Record<SortColumn, number> = {
    support: rule.support,
    confidence: rule.confidence,
    lift: rule.lift,
    leverage: rule.leverage,
    conviction: rule.conviction,
    score: rule.score,
  };
  return map[column] ?? 0;
};

function getStrengthClass(strength: string) {
  if (strength === "Strong") return "metric-strong";
  if (strength === "Moderate") return "metric-moderate";
  if (strength === "Weak") return "metric-weak";
  return "bg-[color:var(--color-surface-2)] text-[color:var(--color-text)]";
}

function getRuleKey(rule: Rule) {
  return `${rule.antecedent}-${rule.consequent}-${rule.support.toFixed(4)}-${rule.confidence.toFixed(4)}`;
}

function SortHeader({ col, label, sortBy, sortDir, onSort }: Readonly<SortHeaderProps>) {
  return (
    <th className="whitespace-nowrap px-3 py-3 text-xs font-semibold text-[color:var(--color-text-muted)] transition-colors">
      <button
        type="button"
        className="rounded-full px-1.5 py-0.5 hover:bg-[color:var(--color-surface-2)] hover:text-[color:var(--color-text)]"
        onClick={() => onSort(col)}
        aria-label={`Sort by ${label}`}
      >
        {label} {sortBy === col && (sortDir === "desc" ? "â†“" : "â†‘")}
      </button>
    </th>
  );
}

export default function RulesPage() {
  const { activeDataset } = useDataset();
  const { sourceSelector, sourceLabel } = useRecommendationSource();
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortColumn>("score");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [filterStrength, setFilterStrength] = useState<Strength>("all");

  useEffect(() => {
    api.recommendations
      .topRules(activeDataset, 30, sourceSelector)
      .then(setRules)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeDataset, sourceSelector]);

  const filtered = filterStrength === "all" ? rules : rules.filter((r) => r.strength === filterStrength);
  const sorted = [...filtered].sort((a, b) => {
    const va = sortValue(a, sortBy);
    const vb = sortValue(b, sortBy);
    return sortDir === "desc" ? vb - va : va - vb;
  });

  const handleSort = (col: SortColumn) => {
    if (sortBy === col) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else { setSortBy(col); setSortDir("desc"); }
  };

  const getRowClass = (isExpanded: boolean, idx: number) => {
    if (isExpanded) return "bg-[color:var(--color-surface-2)]";
    if (idx % 2 === 1) return "bg-[color:var(--color-surface-2)]";
    return "hover:bg-[color:var(--color-surface-2)]";
  };

  if (loading) return <LoadingSpinner text="Mining rules..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-[color:var(--color-text)]">Association Rules</h2>
          <p className="text-sm text-[color:var(--color-text-muted)]">
            {sorted.length} rules from {sourceLabel} that explain which items drive add-on purchases
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="card flex flex-wrap items-center gap-2 p-3">
        <Filter size={14} className="text-[color:var(--color-text-muted)]" />
        <span className="mr-1 text-xs font-medium text-[color:var(--color-text-muted)]">Strength:</span>
        {(["all", "Strong", "Moderate", "Weak"] as Strength[]).map((s) => (
          <Button
            key={s}
            onClick={() => setFilterStrength(s)}
            variant="secondary"
            size="sm"
            className={filterStrength === s ? getStrengthClass(s) : "bg-transparent"}
          >
            {s === "all" ? "All" : s}
          </Button>
        ))}
      </div>

      <p className="text-xs text-[color:var(--color-text-muted)]">
        Tip: Confidence estimates how often the next item is chosen, while Lift shows how much stronger the pair is than chance.
      </p>

      <div className="md:hidden space-y-3">
        {sorted.map((r) => {
          const ruleKey = getRuleKey(r);
          const isExpanded = expanded === ruleKey;
          return (
            <article key={`mobile-${ruleKey}`} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="wrap-break-word text-sm font-semibold text-[color:var(--color-text)]">{r.antecedent}</p>
                  <p className="mt-1 text-xs text-[color:var(--color-text-muted)]">Leads to</p>
                  <p className="wrap-break-word text-sm font-semibold text-[color:var(--color-text)]">{r.consequent}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${getStrengthClass(r.strength)}`}>
                  {r.strength}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <MetricBadge label="Support" value={r.support} type="support" />
                <MetricBadge label="Conf" value={r.confidence} type="confidence" />
                <MetricBadge label="Lift" value={r.lift} type="lift" />
              </div>
              <button
                type="button"
                className="mt-3 text-xs font-semibold text-[color:var(--color-text)] hover:opacity-80"
                aria-expanded={isExpanded}
                onClick={() => setExpanded(isExpanded ? null : ruleKey)}
              >
                {isExpanded ? "Hide details" : "View details"}
              </button>
              {isExpanded && (
                <p className="mt-2 text-xs text-[color:var(--color-text-muted)]">{r.explanation}</p>
              )}
            </article>
          );
        })}
      </div>

      <div className="card overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">Association rules table with sortable metrics and expandable details</caption>
            <thead>
              <tr className="border-b border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] text-left text-xs">
                <th className="px-3 py-3 font-semibold text-[color:var(--color-text-muted)]">#</th>
                <th className="px-3 py-3 font-semibold text-[color:var(--color-text-muted)]">Antecedent</th>
                <th className="px-3 py-3 font-semibold text-[color:var(--color-text-muted)]"></th>
                <th className="px-3 py-3 font-semibold text-[color:var(--color-text-muted)]">Consequent</th>
                <SortHeader col="support" label="Support" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                <SortHeader col="confidence" label="Confidence" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                <SortHeader col="lift" label="Lift" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                <SortHeader col="leverage" label="Leverage" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                <SortHeader col="conviction" label="Conviction" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                <SortHeader col="score" label="Score" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                <th className="px-3 py-3 font-semibold text-[color:var(--color-text-muted)]">Strength</th>
                <th className="px-3 py-3 font-semibold text-[color:var(--color-text-muted)]">Details</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r, i) => (
                <Fragment key={getRuleKey(r)}>
                  <tr
                    className={`border-b border-[color:var(--color-border)] transition-colors ${getRowClass(expanded === getRuleKey(r), i)}`}
                  >
                    <td className="px-3 py-2.5 font-mono text-xs text-[color:var(--color-text-muted)]">{i + 1}</td>
                    <td className="px-3 py-2.5 font-semibold text-[color:var(--color-text)]">{r.antecedent}</td>
                    <td className="px-3 py-2.5"><ArrowRight size={14} className="text-[color:var(--color-text-muted)]" /></td>
                    <td className="px-3 py-2.5 font-semibold text-[color:var(--color-text)]">{r.consequent}</td>
                    <td className="px-3 py-2.5 font-mono text-xs text-[color:var(--color-text)]">{r.support.toFixed(4)}</td>
                    <td className="px-3 py-2.5 font-mono text-xs text-[color:var(--color-text)]">{(r.confidence * 100).toFixed(1)}%</td>
                    <td className="px-3 py-2.5"><MetricBadge label="" value={r.lift} type="lift" /></td>
                    <td className="px-3 py-2.5 font-mono text-xs text-[color:var(--color-text)]">{r.leverage.toFixed(4)}</td>
                    <td className="px-3 py-2.5 font-mono text-xs text-[color:var(--color-text)]">{r.conviction >= 999 ? "Infinity" : r.conviction.toFixed(2)}</td>
                    <td className="px-3 py-2.5"><MetricBadge label="" value={r.score} type="score" /></td>
                    <td className="px-3 py-2.5">
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${getStrengthClass(r.strength)}`}>
                        {r.strength}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <button
                        type="button"
                        className="text-xs font-semibold text-[color:var(--color-text)] hover:opacity-80"
                        aria-expanded={expanded === getRuleKey(r)}
                        onClick={() => setExpanded(expanded === getRuleKey(r) ? null : getRuleKey(r))}
                      >
                        {expanded === getRuleKey(r) ? "Hide" : "View"}
                      </button>
                    </td>
                  </tr>
                  {expanded === getRuleKey(r) && (
                    <tr className="bg-[color:var(--color-surface-2)]">
                      <td colSpan={12} className="px-6 py-4">
                        <p className="text-xs text-[color:var(--color-text-muted)] mb-3">{r.explanation}</p>
                        {/* Mini metric bars */}
                        <div className="flex gap-6">
                          {[
                            { label: "Support", value: r.support, max: 0.1, color: "bg-[color:var(--color-indigo-700)]" },
                            { label: "Confidence", value: r.confidence, max: 1, color: "bg-[color:var(--color-text-muted)]" },
                            { label: "Lift", value: Math.min(r.lift / 2, 1), max: 1, color: "bg-[color:var(--color-emerald)]" },
                          ].map(({ label, value, max, color }) => (
                            <div key={label} className="flex-1">
                              <div className="flex justify-between text-[10px] text-[color:var(--color-text-muted)] mb-1">
                                <span>{label}</span>
                                <span className="font-mono">{label === "Lift" ? r.lift.toFixed(2) : (value * 100).toFixed(1) + "%"}</span>
                              </div>
                              <div className="h-1.5 bg-[color:var(--color-border)] rounded-full overflow-hidden">
                                <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${(value / max) * 100}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

