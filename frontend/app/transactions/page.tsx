"use client";

import { useEffect, useState, useCallback } from "react";
import { useDataset } from "@/context/DatasetContext";
import { useToast } from "@/context/ToastContext";
import { api } from "@/lib/api";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import Button from "@/components/shared/Button";
import Input from "@/components/shared/Input";
import { Upload, FileUp, Search, ChevronLeft, ChevronRight, FileText, AlertCircle } from "lucide-react";
import type { DatasetStats, Transaction } from "@/lib/types";

export default function TransactionsPage() {
  const { activeDataset } = useDataset();
  const { addToast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [stats, setStats] = useState<DatasetStats | null>(null);

  const perPage = 50;

  const fetchData = useCallback(() => {
    setLoading(true);
    api.datasets
      .transactions(activeDataset, page, perPage, search || undefined)
      .then((res) => {
        setTransactions(res.data);
        setTotal(res.total);
        setTotalPages(res.total_pages);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeDataset, page, search]);

  useEffect(() => { setPage(1); }, [activeDataset, search]);
  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    api.datasets.stats(activeDataset).then(setStats).catch(() => setStats(null));
  }, [activeDataset]);

  const doUpload = async (file: File) => {
    if (!file.name.endsWith(".csv")) {
      addToast("Only CSV files are supported", "error");
      return;
    }
    setUploading(true);
    setFileName(file.name);
    try {
      const res = await api.datasets.upload(file);
      addToast(`Uploaded! Dataset ${res.dataset_id} — ${res.stats.total_transactions} transactions`, "success");
      setStats(res.stats);
      setFileName(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      addToast(`Upload failed: ${message}`, "error");
    } finally {
      setUploading(false);
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) doUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) doUpload(file);
  };

  const startRow = (page - 1) * perPage + 1;
  const endRow = Math.min(page * perPage, total);

  const renderTableContent = () => {
    if (loading) {
      return <LoadingSpinner />;
    }

    if (transactions.length === 0) {
      return (
        <div className="card p-8 text-center">
          <AlertCircle size={32} className="mx-auto mb-2 text-[color:var(--color-text-muted)]" />
          <p className="text-sm text-[color:var(--color-text-muted)]">No transactions found</p>
        </div>
      );
    }

    return (
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[color:var(--color-border)] bg-[color:var(--color-surface-2)]">
              <th className="w-36 px-4 py-3 text-left text-xs font-semibold text-[color:var(--color-text-muted)]">Transaction ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[color:var(--color-text-muted)]">Items</th>
              <th className="w-20 px-4 py-3 text-center text-xs font-semibold text-[color:var(--color-text-muted)]">Count</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t, idx) => (
              <tr key={t.transaction_id} className={`border-b border-[color:var(--color-border)] transition-colors hover:bg-[color:var(--color-surface-2)] ${idx % 2 === 1 ? "bg-[color:var(--color-surface-2)]" : ""}`}>
                <td className="px-4 py-2.5 font-mono text-xs text-[color:var(--color-text-muted)]">{t.transaction_id}</td>
                <td className="px-4 py-2.5">
                  <div className="flex flex-wrap gap-1">
                    {t.items.map((item) => (
                      <span key={item} className="rounded-full bg-[color:var(--color-surface-2)] border border-[color:var(--color-border)] px-2.5 py-0.5 text-xs font-medium text-[color:var(--color-text)]">
                        {item}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-2.5 text-center font-mono text-xs text-[color:var(--color-text-muted)]">{t.item_count}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex items-center justify-between border-t border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] px-4 py-3">
          <Button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            variant="secondary"
            size="sm"
            icon={<ChevronLeft size={14} />}
          >
            Previous
          </Button>
          <span className="text-xs font-medium text-[color:var(--color-text-muted)]">
            Page {page} of {totalPages}
          </span>
          <Button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            variant="secondary"
            size="sm"
            icon={<ChevronRight size={14} />}
            className="flex-row-reverse"
          >
            Next
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[color:var(--color-text)]">Transactions</h2>
        <p className="text-sm text-[color:var(--color-text-muted)]">Upload sales data to unlock stronger bundles, cross-sell, and promo recommendations</p>
        {stats && (
          <div className="card mt-3 space-y-1 p-3 text-xs">
            <p className="text-[color:var(--color-text)]">
              Raw items: {stats.raw_unique_items ?? stats.unique_items}{" -> "}Normalized items: {stats.normalized_unique_items ?? stats.unique_items}
            </p>
            {!!stats.unmapped_items?.length && (
              <p className="font-semibold text-amber-700">
                {stats.unmapped_items.length} item(s) using fallback price ₱{stats.fallback_price ?? 50}: {stats.unmapped_items.slice(0, 6).join(", ")}
              </p>
            )}
          </div>
        )}
      </div>

      {/* CSV Upload Zone */}
      <label
        htmlFor="csv-upload-input"
        className={`card block p-8 text-center transition-all duration-300 border-2 border-dashed cursor-pointer ${
          dragOver
            ? "scale-[1.01] border-[color:var(--color-text-muted)] bg-[color:var(--color-surface-2)]"
            : "border-[color:var(--color-border)] hover:border-[color:var(--color-text-muted)] hover:bg-[color:var(--color-surface-2)]"
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <div className={`mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-colors ${
          dragOver ? "bg-[color:var(--color-surface-2)] text-[color:var(--color-text)]" : "bg-[color:var(--color-surface-2)] text-[color:var(--color-text-muted)]"
        }`}>
          {dragOver ? <FileUp size={24} /> : <Upload size={24} />}
        </div>
        <p className="mb-1 text-sm font-medium text-[color:var(--color-text)]">
          {dragOver ? "Drop your CSV here" : "Drag & drop a CSV file here, or click to browse"}
        </p>
        <p className="mb-3 text-xs text-[color:var(--color-text-muted)]">CSV format: TransactionID, Item (one item per row, example: TXN-001,Notebook)</p>

        {fileName && (
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[color:var(--color-surface-2)] px-3 py-1.5 text-xs text-[color:var(--color-text-muted)]">
            <FileText size={14} /> {fileName}
          </div>
        )}

        {uploading && (
          <div className="mx-auto mb-3 w-48">
            <div className="h-1.5 overflow-hidden rounded-full bg-[color:var(--color-border)]">
              <div className="h-full rounded-full bg-[color:var(--color-indigo-700)] animate-shimmer" style={{ width: "70%" }} />
            </div>
          </div>
        )}

        <span className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-text)] px-4 py-2 text-xs font-semibold text-white transition-colors hover:opacity-90">
          <Upload size={14} />
          {uploading ? "Uploading..." : "Choose File"}
        </span>
        <input id="csv-upload-input" type="file" accept=".csv" className="hidden" onChange={handleUpload} disabled={uploading} />
      </label>

      {/* Search & Info */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <Input
            type="text"
            placeholder="Search by Transaction ID or item..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search size={16} />}
          />
        </div>
        <span className="text-xs font-medium text-[color:var(--color-text-muted)]">
          {total > 0 ? `Showing ${startRow}-${endRow} of ${total.toLocaleString()}` : `${total.toLocaleString()} transactions`}
        </span>
      </div>

      {/* Table */}
      {renderTableContent()}
    </div>
  );
}
