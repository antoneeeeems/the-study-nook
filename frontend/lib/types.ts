import type { ReactNode } from "react";

export interface DatasetInfo {
  id: string;
  name: string;
  path: string;
}

export type ThemeName = "light" | "dark";
export type ComponentSize = "sm" | "md" | "lg";
export type MetricType = "lift" | "confidence" | "support" | "score";
export type StatCardColor = "teal" | "amber" | "rose" | "indigo";

export interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  subtitle?: string;
  color?: StatCardColor;
}

export interface MetricBadgeProps {
  label: string;
  value: number;
  type?: MetricType;
  className?: string;
}

export interface DatasetStats {
  dataset_id: string;
  total_transactions: number;
  total_rows: number;
  unique_items: number;
  raw_unique_items?: number;
  normalized_unique_items?: number;
  unmapped_items?: string[];
  fallback_price?: number;
  avg_basket_size: number;
  min_basket_size: number;
  max_basket_size: number;
  items: string[];
  item_frequencies: Record<string, number>;
}

export interface CartItem {
  name: string;
  price: number;
  qty: number;
  mappedPrice?: boolean;
}

export interface Transaction {
  transaction_id: string;
  items: string[];
  item_count: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface DatasetUploadResponse {
  dataset_id: string;
  stats: DatasetStats;
  quality: UploadQualityReport;
}

export interface UploadQualityReport {
  total_rows: number;
  total_transactions: number;
  unique_items: number;
  duplicate_transaction_item_rows: number;
  empty_value_rows: number;
  min_basket_size: number;
  max_basket_size: number;
  avg_basket_size: number;
  warnings: string[];
}

export interface Rule {
  antecedent: string;
  consequent: string;
  support: number;
  confidence: number;
  lift: number;
  leverage: number;
  conviction: number;
  score: number;
  strength: string;
  explanation: string;
}

export interface Bundle {
  bundle: string;
  support: number;
  confidence: number;
  lift: number;
  score: number;
  explanation: string;
}

export interface HomepageItem {
  rank: number;
  item: string;
  total_score: number;
  rule_appearances: number;
  price: number;
  mapped_price?: boolean;
}

export interface FBTItem {
  item: string;
  confidence: number;
  lift: number;
  strength: string;
  price: number;
  mapped_price?: boolean;
}

export interface CrossSellItem {
  suggested_item: string;
  because_you_have: string;
  confidence: number;
  lift: number;
  score: number;
  price: number;
  mapped_price?: boolean;
}

export interface Promo {
  tag: string;
  bundle: string;
  regular_price: number;
  discount: string;
  savings: number;
  promo_price: number;
  lift: number;
  mapped_price?: boolean;
}

export interface AppliedPromo {
  tag: string;
  bundle: string;
  applications: number;
  discount: string;
  regular_price: number;
  savings: number;
  promo_price: number;
  lift: number;
  mapped_price?: boolean;
}

export interface CartPromoCalculation {
  subtotal: number;
  total_discount: number;
  final_total: number;
  applied_promos: AppliedPromo[];
}

export interface DriftReport {
  jaccard: number;
  drift_detected: boolean;
  stability_score: number;
  lift_delta: number;
  avg_lift_prev: number;
  avg_lift_curr: number;
  rule_count_prev: number;
  rule_count_curr: number;
  new_rules: number;
  dropped_rules: number;
}

export interface IterationResult {
  iteration: number;
  timestamp: string;
  dataset_label: string;
  n_transactions: number;
  minsup: number;
  minconf: number;
  adaptation_msg: string;
  n_frequent_itemsets: number;
  n_rules: number;
  avg_support: number;
  avg_confidence: number;
  avg_lift: number;
  top_rule: string;
  drift: DriftReport | null;
  k_max: number;
  rules: Rule[];
}

export interface StabilityResult {
  top_rule_antecedent: string;
  top_rule_consequent: string;
  survived_v2: boolean;
  survived_v3: boolean;
  verdict: string;
}

export interface PipelineResult {
  run_id?: string;
  created_at?: string;
  dataset_id?: string;
  dataset_b_id?: string | null;
  seed?: number;
  iterations: IterationResult[];
  stability: StabilityResult | null;
}

export interface PipelineHistoryItem {
  run_id: string;
  created_at: string;
  dataset_id: string;
  dataset_b_id?: string | null;
  seed: number;
  iterations: number;
}

export interface PipelineHistoryResponse {
  runs: PipelineHistoryItem[];
}

export interface AlgoComparison {
  fpgrowth: {
    algorithm: string;
    frequent_itemsets: number;
    rules_generated: number;
    avg_lift: number;
    runtime_seconds: number;
  };
  apriori: {
    algorithm: string;
    frequent_itemsets: number;
    rules_generated: number;
    avg_lift: number;
    runtime_seconds: number;
  };
}

export interface BusinessInsights {
  rule_volume: { dataset_a: number; dataset_b: number; richer: string };
  avg_lift: { dataset_a: number; dataset_b: number; stronger: string };
  strongest_rule: {
    dataset_a: { antecedent: string; consequent: string; confidence: number; lift: number; score: number } | null;
    dataset_b: { antecedent: string; consequent: string; confidence: number; lift: number; score: number } | null;
  };
  hub_products: {
    dataset_a: { item: string; rule_count: number }[];
    dataset_b: { item: string; rule_count: number }[];
  };
  cross_dataset_overlap: { jaccard: number; shared: number; only_a: number; only_b: number };
  recommendations: string[];
}
