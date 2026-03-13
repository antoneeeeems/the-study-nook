"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { api } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import EmptyState from "@/components/shared/EmptyState";
import Button from "@/components/shared/Button";
import { CHART_GRID, CHART_TICK, CHART_TOOLTIP, CHART_LEGEND, CHART_COLORS } from "@/lib/chart-config";
import {
  FileText, RefreshCw, BarChart3, TreePine, GitBranch, Zap, Search,
  Database, Target, Play, ArrowRight, CheckCircle2, XCircle,
  TrendingUp, TrendingDown, Activity, Workflow, Shield, AlertTriangle, Trash2,
} from "lucide-react";
import type { PipelineResult, AlgoComparison } from "@/lib/types";

type ThresholdDatum = {
  name: string;
  minsup: number;
  minconf: number;
  avg_lift: number;
  rules: number;
  itemsets: number;
};

const LazyLineChart = dynamic(() => import("recharts").then((m) => {
  const { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } = m;
  return function ThresholdChart({ data }: { data: ThresholdDatum[] }) {
    return (
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data}>
          <CartesianGrid {...CHART_GRID} />
          <XAxis dataKey="name" tick={CHART_TICK.xAxis} />
          <YAxis yAxisId="left" tick={CHART_TICK.yAxis} />
          <YAxis yAxisId="right" orientation="right" tick={CHART_TICK.yAxis} />
          <Tooltip {...CHART_TOOLTIP} />
          <Legend {...CHART_LEGEND} />
          <Line yAxisId="left" type="monotone" dataKey="minsup" stroke={CHART_COLORS[0]} strokeWidth={2.5} name="Min Support" dot={{ r: 5, fill: CHART_COLORS[0] }} />
          <Line yAxisId="left" type="monotone" dataKey="minconf" stroke={CHART_COLORS[3]} strokeWidth={2.5} name="Min Confidence" dot={{ r: 5, fill: CHART_COLORS[3] }} />
          <Line yAxisId="right" type="monotone" dataKey="avg_lift" stroke={CHART_COLORS[1]} strokeWidth={2.5} name="Avg Lift" dot={{ r: 5, fill: CHART_COLORS[1] }} />
        </LineChart>
      </ResponsiveContainer>
    );
  };
}), { ssr: false, loading: () => <div className="h-70 animate-shimmer rounded-xl" /> });

const LazyBarChart = dynamic(() => import("recharts").then((m) => {
  const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } = m;
  return function RuleCountChart({ data }: { data: ThresholdDatum[] }) {
    return (
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <CartesianGrid {...CHART_GRID} />
          <XAxis dataKey="name" tick={CHART_TICK.xAxis} />
          <YAxis tick={CHART_TICK.yAxis} />
          <Tooltip {...CHART_TOOLTIP} />
          <Bar dataKey="rules" fill={CHART_COLORS[0]} radius={[6, 6, 0, 0]} name="Rules" />
          <Bar dataKey="itemsets" fill={CHART_COLORS[1]} radius={[6, 6, 0, 0]} name="Itemsets" />
        </BarChart>
      </ResponsiveContainer>
    );
  };
}), { ssr: false, loading: () => <div className="h-50 animate-shimmer rounded-xl" /> });

const PIPELINE_STEPS = [
  { icon: FileText, label: "CSV Data", color: "text-[color:var(--color-text)]" },
  { icon: RefreshCw, label: "Parsing", color: "text-[color:var(--color-text)]" },
  { icon: BarChart3, label: "Adaptive\nThreshold", color: "text-[color:var(--color-text)]" },
  { icon: TreePine, label: "FP-Growth\nMining", color: "text-[color:var(--color-text)]" },
  { icon: GitBranch, label: "Rule\nDerivation", color: "text-[color:var(--color-text)]" },
  { icon: Zap, label: "Rule\nScoring", color: "text-[color:var(--color-text)]" },
  { icon: Search, label: "Drift\nDetection", color: "text-[color:var(--color-text)]" },
  { icon: Database, label: "Version\nLog", color: "text-[color:var(--color-text)]" },
  { icon: Target, label: "Recommend-\nations", color: "text-[color:var(--color-text)]" },
];

function getDriftBarClass(jaccard: number) {
  if (jaccard < 0.5) return "bg-rose";
  if (jaccard < 0.75) return "bg-amber";
  return "bg-emerald-500";
}

function getVerdictClass(verdict: string) {
  if (verdict === "FULL") return "metric-strong";
  if (verdict === "PARTIAL") return "metric-moderate";
  return "metric-weak";
}

export default function PipelinePage() {
  const [pipeline, setPipeline] = useState<PipelineResult | null>(null);
  const [comparison, setComparison] = useState<AlgoComparison | null>(null);
  const [activeIter, setActiveIter] = useState(0);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [deletingDatasetId, setDeletingDatasetId] = useState<string | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    Promise.all([
      api.pipeline.iterations().catch(() => null),
      api.pipeline.comparison().catch(() => null),
    ])
      .then(([p, c]) => { setPipeline(p); setComparison(c); })
      .finally(() => setLoading(false));
  }, []);

  const handleRun = async () => {
    setRunning(true);
    try {
      const result = await api.pipeline.run();
      setPipeline(result);
      addToast("Pipeline completed — chronological datasets processed into iterations.", "success");
    } catch {
      addToast("Pipeline failed to run", "error");
    } finally {
      setRunning(false);
    }
  };

  const handleRemoveSource = async (datasetId: string) => {
    if (datasetId === "A" || datasetId === "B") {
      addToast("Built-in datasets cannot be removed.", "error");
      return;
    }

    setDeletingDatasetId(datasetId);
    try {
      await api.datasets.remove(datasetId);
      addToast(`Removed dataset '${datasetId}'. Rebuilding iterations...`, "success");
      const result = await api.pipeline.run();
      setPipeline(result);
      setActiveIter(0);
    } catch {
      addToast(`Failed to remove dataset '${datasetId}'.`, "error");
    } finally {
      setDeletingDatasetId(null);
    }
  };

  if (loading) return <LoadingSpinner text="Loading pipeline..." />;

  const iterations = pipeline?.iterations || [];
  const sourceDatasetIds = pipeline?.dataset_ids || [];
  const selected = iterations[activeIter];

  const thresholdData = iterations.map((it) => ({
    name: `v${it.iteration}`,
    minsup: it.minsup,
    minconf: it.minconf,
    avg_lift: it.avg_lift,
    rules: it.n_rules,
    itemsets: it.n_frequent_itemsets,
  }));

  const runButtonIcon = running ? undefined : <Play size={16} />;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-[color:var(--color-text)]">Self-Learning Pipeline</h2>
          <p className="text-sm text-[color:var(--color-text-muted)]">Chronological FP-Growth pipeline that auto-builds iterations from Dataset A, Dataset B, and uploaded CSVs</p>
          <p className="text-xs text-[color:var(--color-text-muted)] mt-1">
            Source datasets: {sourceDatasetIds.length ? sourceDatasetIds.join(", ") : "Run pipeline to resolve current dataset order"}
          </p>
        </div>
        <Button
          onClick={handleRun}
          loading={running}
          icon={runButtonIcon}
          className="px-5"
        >
          {running ? "Running..." : "Run Pipeline"}
        </Button>
      </div>

      {sourceDatasetIds.length > 0 && (
        <div className="card soft-shell p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-[color:var(--color-text-muted)]">
              Remove accidental uploaded datasets from iteration sources. Built-ins (A, B) are protected.
            </p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {sourceDatasetIds.map((datasetId) => {
              const isBuiltin = datasetId === "A" || datasetId === "B";
              const isDeleting = deletingDatasetId === datasetId;
              return (
                <div
                  key={datasetId}
                  className="soft-pressed flex items-center gap-2 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] px-3 py-1.5"
                >
                  <span className="text-xs font-semibold text-[color:var(--color-text)]">{datasetId}</span>
                  {isBuiltin ? (
                    <span className="text-[10px] text-[color:var(--color-text-muted)]">locked</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleRemoveSource(datasetId)}
                      disabled={isDeleting || running}
                      className="inline-flex h-5 w-5 items-center justify-center rounded-full text-rose-500 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                      aria-label={`Remove dataset ${datasetId} from iteration sources`}
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pipeline Architecture Diagram */}
      <div className="card soft-shell p-6">
        <h3 className="mb-5 flex items-center gap-2 text-sm font-semibold text-[color:var(--color-text)]">
          <Workflow size={16} className="text-[color:var(--color-text)]" />
          Pipeline Architecture
        </h3>
        <div className="flex items-center justify-between gap-1 overflow-x-auto pb-2">
          {PIPELINE_STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.label} className="flex items-center">
                <div className="flex flex-col items-center min-w-19 group">
                  <div className={`soft-pressed mb-1.5 flex h-12 w-12 items-center justify-center rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] transition-all group-hover:shadow-md ${step.color}`}>
                    <Icon size={20} />
                  </div>
                  <span className="text-[10px] text-[color:var(--color-text-muted)] text-center whitespace-pre-line leading-tight font-medium">
                    {step.label}
                  </span>
                </div>
                {i < PIPELINE_STEPS.length - 1 && (
                  <ArrowRight size={14} className="text-[color:var(--color-divider)] mx-0.5 shrink-0" aria-hidden="true" />
                )}
              </div>
            );
          })}
        </div>
        {/* Self-learning loop indicator */}
        <div className="mt-4 flex items-center justify-center">
          <div className="soft-pressed flex items-center gap-2 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] px-4 py-2">
            <RefreshCw size={12} className="text-[color:var(--color-text)]" />
            <span className="text-xs font-medium text-[color:var(--color-text)]">
              Self-learning loop: Drift Detection to Adaptive Threshold adjustment
            </span>
          </div>
        </div>
      </div>

      {/* Iteration Timeline */}
      {iterations.length > 0 && (
        <>
          <div className="card soft-shell p-6">
            <h3 className="mb-5 flex items-center gap-2 text-sm font-semibold text-[color:var(--color-text)]">
              <Activity size={16} className="text-[color:var(--color-text)]" />
              Iteration Timeline
            </h3>
            <div className="flex items-center justify-center gap-0">
              {iterations.map((it, i) => {
                const isActive = i === activeIter;
                return (
                  <div key={it.iteration} className="flex items-center">
                    <button
                      onClick={() => setActiveIter(i)}
                      aria-current={isActive ? "step" : undefined}
                      aria-label={`View iteration v${it.iteration} (${it.dataset_label})`}
                      className={`flex flex-col items-center px-6 py-4 rounded-2xl transition-all duration-300 ${
                        isActive ? "soft-pressed border-2 border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] shadow-sm" : "border-2 border-transparent hover:bg-[color:var(--color-surface-2)]"
                      }`}
                    >
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold mb-2 transition-all ${
                        isActive ? "bg-[color:var(--color-text)] text-white" : "soft-pressed bg-[color:var(--color-surface-2)] text-[color:var(--color-text-muted)]"
                      }`}>
                        v{it.iteration}
                      </div>
                      <span className="text-xs font-semibold text-[color:var(--color-text)]">{it.dataset_label}</span>
                      <span className="text-[10px] text-[color:var(--color-text-muted)]">{it.n_transactions.toLocaleString()} txns</span>
                      <span className="text-[10px] text-[color:var(--color-text-muted)]">{it.n_rules} rules</span>
                    </button>
                    {i < iterations.length - 1 && (
                      <div className="flex flex-col items-center mx-2">
                        <ArrowRight size={16} className="text-[color:var(--color-divider)]" aria-hidden="true" />
                        {iterations[i + 1]?.drift && (
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold mt-1 ${
                            iterations[i + 1].drift!.drift_detected ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-700"
                          }`}>
                            J={iterations[i + 1].drift!.jaccard.toFixed(2)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Iteration Details */}
          {selected && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card soft-shell p-5">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-[color:var(--color-text)]">
                  <BarChart3 size={16} className="text-[color:var(--color-text)]" />
                  Iteration {selected.iteration} Details
                </h3>
                <div className="space-y-3">
                  {[
                    { label: "Dataset", value: selected.dataset_label },
                    { label: "Transactions", value: selected.n_transactions.toLocaleString() },
                    { label: "Min Support", value: selected.minsup.toFixed(3) },
                    { label: "Min Confidence", value: selected.minconf.toFixed(3) },
                    { label: "Frequent Itemsets", value: selected.n_frequent_itemsets },
                    { label: "Rules Generated", value: selected.n_rules },
                    { label: "Avg Lift", value: selected.avg_lift.toFixed(4) },
                    { label: "Avg Confidence", value: selected.avg_confidence.toFixed(4) },
                    { label: "Max Itemset Size", value: `k=${selected.k_max}` },
                    { label: "Top Rule", value: selected.top_rule },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span className="text-[color:var(--color-text-muted)]">{label}</span>
                      <span className="font-mono text-xs text-[color:var(--color-text)]">{value}</span>
                    </div>
                  ))}
                  <div className="pt-3 border-t border-[color:var(--color-border)]">
                    <p className="text-xs text-[color:var(--color-text-muted)] italic">{selected.adaptation_msg}</p>
                  </div>
                </div>
              </div>

              {/* Drift Detection */}
              <div className="card soft-shell p-5">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-[color:var(--color-text)]">
                  <Search size={16} className="text-[color:var(--color-text)]" />
                  Drift Detection
                </h3>
                {selected.drift ? (
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium text-[color:var(--color-text-muted)]">Jaccard Similarity</span>
                        <span className={`text-sm font-bold font-mono ${
                          selected.drift.drift_detected ? "text-rose-500" : "text-emerald-600"
                        }`}>
                          {selected.drift.jaccard.toFixed(3)}
                        </span>
                      </div>
                      <div className="soft-pressed w-full bg-[color:var(--color-surface-2)] rounded-full h-7 overflow-hidden relative">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${getDriftBarClass(selected.drift.jaccard)}`}
                          style={{ width: `${selected.drift.jaccard * 100}%` }}
                        />
                        <div className="absolute inset-0 flex items-center px-3">
                          <span className="text-[10px] font-bold text-white drop-shadow flex items-center gap-1">
                            {selected.drift.drift_detected
                              ? <><AlertTriangle size={10} /> DRIFT DETECTED</>
                              : <><Shield size={10} /> STABLE</>
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="soft-pressed rounded-xl bg-[color:var(--color-surface-2)] p-3 text-center">
                        <p className="font-mono text-lg font-bold text-[color:var(--color-text)]">+{selected.drift.new_rules}</p>
                        <p className="text-[10px] text-[color:var(--color-text-muted)] font-medium">New Rules</p>
                      </div>
                      <div className="soft-pressed rounded-xl bg-[color:var(--color-surface-2)] p-3 text-center">
                        <p className="font-mono text-lg font-bold text-[color:var(--color-text)]">-{selected.drift.dropped_rules}</p>
                        <p className="text-[10px] text-[color:var(--color-text-muted)] font-medium">Dropped Rules</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-[color:var(--color-text-muted)]">Stability Score</span>
                        <span className="font-mono">{selected.drift.stability_score.toFixed(4)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[color:var(--color-text-muted)]">Lift Delta</span>
                        <span className={`flex items-center gap-1 font-mono ${selected.drift.lift_delta >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
                          {selected.drift.lift_delta >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                          {selected.drift.lift_delta >= 0 ? "+" : ""}{selected.drift.lift_delta.toFixed(4)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[color:var(--color-text-muted)]">Avg Lift</span>
                        <span className="font-mono text-xs">
                          {selected.drift.avg_lift_prev.toFixed(4)} → {selected.drift.avg_lift_curr.toFixed(4)}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="py-8 text-center text-sm text-[color:var(--color-text-muted)]">
                    No drift data (first iteration — baseline)
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card soft-shell p-5">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-[color:var(--color-text)]">
                <TrendingUp size={16} className="text-[color:var(--color-text)]" />
                Threshold & Metric Evolution
              </h3>
              <LazyLineChart data={thresholdData} />
            </div>
            <div className="card soft-shell p-5">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-[color:var(--color-text)]">
                <BarChart3 size={16} className="text-[color:var(--color-text)]" />
                Rules & Itemsets per Iteration
              </h3>
              <LazyBarChart data={thresholdData} />
            </div>
          </div>

          {/* Rule Stability */}
          {pipeline?.stability && (
            <div className="card soft-shell p-5">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-[color:var(--color-text)]">
                <Shield size={16} className="text-[color:var(--color-text)]" />
                Rule Stability Test
              </h3>
              <p className="text-sm text-[color:var(--color-text-muted)] mb-4">
                Top rule from v1: <b className="text-[color:var(--color-text)]">{pipeline.stability.top_rule_antecedent}</b>{" "}
                <ArrowRight size={12} className="inline text-[color:var(--color-text-muted)]" />{" "}
                <b className="text-[color:var(--color-text)]">{pipeline.stability.top_rule_consequent}</b>
              </p>
              <div className="flex gap-4">
                {[
                  { label: "Iteration 2", survived: pipeline.stability.survived_v2 },
                  { label: "Iteration 3", survived: pipeline.stability.survived_v3 },
                ].map(({ label, survived }) => (
                  <div key={label} className={`flex-1 rounded-xl border p-4 text-center ${survived ? "soft-pressed border-[color:var(--color-border)] bg-[color:var(--color-surface-2)]" : "border-rose-200 bg-rose-50"}`}>
                    {survived ? <CheckCircle2 size={28} className="mx-auto mb-1 text-[color:var(--color-text)]" /> : <XCircle size={28} className="mx-auto mb-1 text-rose-500" />}
                    <p className="text-xs font-semibold text-[color:var(--color-text)]">{label}</p>
                    <p className="text-[10px] text-[color:var(--color-text-muted)]">{survived ? "SURVIVED" : "DROPPED"}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <span className={`rounded-full px-4 py-1.5 text-xs font-bold ${getVerdictClass(pipeline.stability.verdict)}`}>
                  Verdict: {pipeline.stability.verdict}
                </span>
              </div>
            </div>
          )}
        </>
      )}

      {/* Algorithm Comparison */}
      {comparison && (
        <div className="card soft-shell p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-[color:var(--color-text)]">
            <Zap size={16} className="text-[color:var(--color-text)]" />
            FP-Growth vs Apriori Comparison
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[color:var(--color-border)] text-left">
                  <th className="px-4 py-2.5 text-xs font-semibold text-[color:var(--color-text-muted)]">Metric</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-[color:var(--color-text)]">FP-Growth</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-[color:var(--color-text-muted)]">Apriori</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "Frequent Itemsets", fp: comparison.fpgrowth.frequent_itemsets, ap: comparison.apriori.frequent_itemsets },
                  { label: "Rules Generated", fp: comparison.fpgrowth.rules_generated, ap: comparison.apriori.rules_generated },
                  { label: "Avg Lift", fp: comparison.fpgrowth.avg_lift.toFixed(4), ap: comparison.apriori.avg_lift.toFixed(4) },
                  { label: "Runtime (s)", fp: comparison.fpgrowth.runtime_seconds.toFixed(4), ap: comparison.apriori.runtime_seconds.toFixed(4) },
                ].map(({ label, fp, ap }) => (
                  <tr key={label} className="border-b border-[color:var(--color-border)]">
                    <td className="px-4 py-2.5 text-[color:var(--color-text-muted)]">{label}</td>
                    <td className="px-4 py-2.5 font-mono font-semibold text-[color:var(--color-text)]">{fp}</td>
                    <td className="px-4 py-2.5 font-mono text-[color:var(--color-text-muted)]">{ap}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs italic text-[color:var(--color-text-muted)]">
            FP-Growth is selected as primary engine: faster, no candidate generation, scales to larger datasets.
          </p>
        </div>
      )}

      {!iterations.length && (
        <EmptyState
          icon={<Workflow size={48} />}
          title="No Pipeline Results"
          description='Click "Run Pipeline" to start the chronological self-learning loop with automatic dataset inclusion and drift detection.'
          action={
            <Button
              onClick={handleRun}
              loading={running}
              variant="primary"
            >
              Run Pipeline
            </Button>
          }
        />
      )}
    </div>
  );
}

