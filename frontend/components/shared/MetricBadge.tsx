import { metricThresholds } from "@/lib/design-tokens";
import type { MetricBadgeProps } from "@/lib/types";

export default function MetricBadge({ label, value, type = "lift", className = "" }: Readonly<MetricBadgeProps>) {
  let stateClass = "metric-moderate";
  if (type === "lift") {
    if (value >= metricThresholds.lift.strong) stateClass = "metric-strong";
    else if (value < metricThresholds.lift.weak) stateClass = "metric-weak";
  } else if (type === "confidence") {
    if (value >= metricThresholds.confidence.strong) stateClass = "metric-strong";
    else if (value < metricThresholds.confidence.weak) stateClass = "metric-weak";
  } else if (type === "score") {
    if (value >= metricThresholds.score.strong) stateClass = "metric-strong";
    else if (value < metricThresholds.score.weak) stateClass = "metric-weak";
  }

  return (
    <span
      aria-label={`${label}: ${value.toFixed(2)}`}
      className={`inline-flex items-center gap-1 rounded-full border border-(--color-border-strong) px-2.5 py-1 text-xs font-medium ${stateClass} ${className}`}
    >
      <span className="text-[10px] text-(--color-text)">{label}</span>
      <span className="font-mono">{value.toFixed(2)}</span>
    </span>
  );
}
