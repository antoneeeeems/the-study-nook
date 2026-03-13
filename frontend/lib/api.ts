import type {
  AlgoComparison,
  BusinessInsights,
  Bundle,
  CartPromoCalculation,
  CrossSellItem,
  DatasetInfo,
  DatasetStats,
  DatasetUploadResponse,
  FBTItem,
  HomepageItem,
  PipelineHistoryResponse,
  PipelineRunOptions,
  PaginatedResponse,
  PipelineResult,
  Promo,
  RecommendationSourceSelector,
  Rule,
  Transaction,
} from "@/lib/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface ApiErrorPayload {
  detail?: string;
}

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const error = (await res.json().catch(() => ({ detail: res.statusText }))) as ApiErrorPayload;
    throw new Error(error.detail || "API request failed");
  }
  return res.json();
}

function withRecommendationSource(path: string, source?: RecommendationSourceSelector): string {
  if (!source) return path;
  const joiner = path.includes("?") ? "&" : "?";
  return `${path}${joiner}run_id=${encodeURIComponent(source.run_id)}&iteration=${source.iteration}`;
}

// Datasets
export const api = {
  datasets: {
    list: () => fetchApi<DatasetInfo[]>("/api/datasets"),
    remove: (id: string) => fetchApi<{ deleted: boolean; dataset_id: string }>(`/api/datasets/${id}`, { method: "DELETE" }),
    stats: (id: string) => fetchApi<DatasetStats>(`/api/datasets/${id}/stats`),
    transactions: (id: string, page = 1, perPage = 50, search?: string) => {
      const params = new URLSearchParams({ page: String(page), per_page: String(perPage) });
      if (search) params.set("search", search);
      return fetchApi<PaginatedResponse<Transaction>>(`/api/datasets/${id}/transactions?${params}`);
    },
    upload: async (file: File): Promise<DatasetUploadResponse> => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${API_BASE}/api/datasets/upload`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const error = (await res.json().catch(() => ({ detail: res.statusText }))) as ApiErrorPayload;
        throw new Error(error.detail || "Upload failed");
      }
      return res.json() as Promise<DatasetUploadResponse>;
    },
  },

  recommendations: {
    topBundles: (id: string, topN = 5, source?: RecommendationSourceSelector) =>
      fetchApi<Bundle[]>(withRecommendationSource(`/api/recommendations/${id}/top-bundles?top_n=${topN}`, source)),
    topRules: (id: string, topN = 10, source?: RecommendationSourceSelector) =>
      fetchApi<Rule[]>(withRecommendationSource(`/api/recommendations/${id}/top-rules?top_n=${topN}`, source)),
    homepageRanking: (id: string, topN = 10, source?: RecommendationSourceSelector) =>
      fetchApi<HomepageItem[]>(withRecommendationSource(`/api/recommendations/${id}/homepage-ranking?top_n=${topN}`, source)),
    fbt: (id: string, item: string, topN = 5, source?: RecommendationSourceSelector) =>
      fetchApi<FBTItem[]>(withRecommendationSource(`/api/recommendations/${id}/frequently-bought-together?item=${encodeURIComponent(item)}&top_n=${topN}`, source)),
    crossSell: (id: string, cartItems: string[], topN = 5, source?: RecommendationSourceSelector) =>
      fetchApi<CrossSellItem[]>(withRecommendationSource(`/api/recommendations/${id}/cross-sell`, source), {
        method: "POST",
        body: JSON.stringify({ cart_items: cartItems, top_n: topN }),
      }),
    promos: (id: string, topN = 5, source?: RecommendationSourceSelector) =>
      fetchApi<Promo[]>(withRecommendationSource(`/api/recommendations/${id}/promos?top_n=${topN}`, source)),
    cartPromos: (id: string, cartItems: Array<{ name: string; qty: number }>, source?: RecommendationSourceSelector) =>
      fetchApi<CartPromoCalculation>(withRecommendationSource(`/api/recommendations/${id}/cart-promos`, source), {
        method: "POST",
        body: JSON.stringify({ cart_items: cartItems }),
      }),
    insights: () =>
      fetchApi<BusinessInsights>("/api/recommendations/compare/insights"),
  },

  pipeline: {
    run: (options: PipelineRunOptions = {}) =>
      fetchApi<PipelineResult>("/api/pipeline/run", {
        method: "POST",
        body: JSON.stringify({
          seed: options.seed ?? 42,
          include_dataset_ids: options.include_dataset_ids,
          exclude_dataset_ids: options.exclude_dataset_ids,
        }),
      }),
    iterations: () => fetchApi<PipelineResult>("/api/pipeline/iterations"),
    history: (limit = 20) => fetchApi<PipelineHistoryResponse>(`/api/pipeline/history?limit=${limit}`),
    comparison: () => fetchApi<AlgoComparison>("/api/pipeline/comparison"),
  },
};
