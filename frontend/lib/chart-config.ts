import { tokens } from "@/lib/design-tokens";

export const CHART_COLORS = tokens.color.chart;

export const CHART_GRID = {
  strokeDasharray: "3 3",
  stroke: "var(--color-chart-grid)",
  vertical: false,
} as const;

export const CHART_TICK = {
  xAxis: { fontSize: 12 },
  yAxis: { fontSize: 11 },
  compactXAxis: { fontSize: 10 },
  compactYAxis: { fontSize: 9 },
} as const;

export const CHART_TOOLTIP = {
  contentStyle: {
    fontSize: 12,
    borderRadius: 12,
    border: "none",
    boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
  },
} as const;

export const CHART_LEGEND = {
  wrapperStyle: { fontSize: 12 },
} as const;
