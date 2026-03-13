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
  PaginatedResponse,
  PipelineResult,
  Promo,
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
    topBundles: (id: string, topN = 5) =>
      fetchApi<Bundle[]>(`/api/recommendations/${id}/top-bundles?top_n=${topN}`),
    topRules: (id: string, topN = 10) =>
      fetchApi<Rule[]>(`/api/recommendations/${id}/top-rules?top_n=${topN}`),
    homepageRanking: (id: string, topN = 10) =>
      fetchApi<HomepageItem[]>(`/api/recommendations/${id}/homepage-ranking?top_n=${topN}`),
    fbt: (id: string, item: string, topN = 5) =>
      fetchApi<FBTItem[]>(`/api/recommendations/${id}/frequently-bought-together?item=${encodeURIComponent(item)}&top_n=${topN}`),
    crossSell: (id: string, cartItems: string[], topN = 5) =>
      fetchApi<CrossSellItem[]>(`/api/recommendations/${id}/cross-sell`, {
        method: "POST",
        body: JSON.stringify({ cart_items: cartItems, top_n: topN }),
      }),
    promos: (id: string, topN = 5) =>
      fetchApi<Promo[]>(`/api/recommendations/${id}/promos?top_n=${topN}`),
    cartPromos: (id: string, cartItems: Array<{ name: string; qty: number }>) =>
      fetchApi<CartPromoCalculation>(`/api/recommendations/${id}/cart-promos`, {
        method: "POST",
        body: JSON.stringify({ cart_items: cartItems }),
      }),
    insights: () =>
      fetchApi<BusinessInsights>("/api/recommendations/compare/insights"),
  },

  pipeline: {
    run: (seed = 42) =>
      fetchApi<PipelineResult>("/api/pipeline/run", {
        method: "POST",
        body: JSON.stringify({ seed }),
      }),
    iterations: () => fetchApi<PipelineResult>("/api/pipeline/iterations"),
    history: (limit = 20) => fetchApi<PipelineHistoryResponse>(`/api/pipeline/history?limit=${limit}`),
    comparison: () => fetchApi<AlgoComparison>("/api/pipeline/comparison"),
  },
};
