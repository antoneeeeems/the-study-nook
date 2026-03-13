"use client";

import { useEffect, useMemo, useState } from "react";
import { useDataset } from "@/context/DatasetContext";
import { useCart } from "@/context/CartContext";
import { useRecommendationSource } from "@/context/RecommendationSourceContext";
import { useToast } from "@/context/ToastContext";
import { api } from "@/lib/api";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import Button from "@/components/shared/Button";
import Input from "@/components/shared/Input";
import Select from "@/components/shared/Select";
import EmptyState from "@/components/shared/EmptyState";
import {
  BookOpen, Pen, Ruler, Calculator, Scissors, Palette, PencilLine, Eraser,
  StickyNote, Paperclip, FolderOpen, FileText, Highlighter, GraduationCap,
  Compass, Triangle, Package, ShoppingCart, Check, Sparkles,
  Brain, Star, Search, SlidersHorizontal, Minus, Plus,
} from "lucide-react";
import type { HomepageItem, FBTItem } from "@/lib/types";

type QuickFilter = "all" | "top-10" | "frequent" | "budget";

const ITEM_ICONS: Record<string, React.ElementType> = {
  Notebook: BookOpen, Pen: Pen, Pencil: PencilLine, Ruler: Ruler,
  Calculator: Calculator, Scissors: Scissors, Crayons: Palette,
  "Colored Pencils": Palette, Eraser: Eraser, "Sticky Notes": StickyNote,
  Paperclips: Paperclip, Folder: FolderOpen, "Bond Paper": FileText,
  Paper: FileText, Highlighter: Highlighter, "Art Paper": Palette,
  Compass: Compass, Protractor: Triangle, "Index Cards": StickyNote,
  "Pencil Case": Package, Glue: Package, Tape: Package,
  "Glue Stick": Package, Sharpener: PencilLine, Backpack: GraduationCap,
  Binder: FolderOpen, Ballpen: Pen, "Sign Pen": Pen,
  Marker: Highlighter, "Water Bottle": Package, Stapler: Paperclip,
};

const RANK_COLORS = [
  "from-amber-400 to-yellow-500",
  "from-zinc-300 to-zinc-400",
  "from-amber-600 to-orange-700",
];

const QUICK_FILTER_OPTIONS: ReadonlyArray<{ value: QuickFilter; label: string; toneClass: string }> = [
  { value: "all", label: "All", toneClass: "metric-moderate" },
  { value: "top-10", label: "Top 10", toneClass: "metric-strong" },
  { value: "frequent", label: "High Frequency", toneClass: "metric-strong" },
  { value: "budget", label: "Budget <= P50", toneClass: "metric-moderate" },
];

export default function ShopPage() {
  const { activeDataset } = useDataset();
  const { sourceSelector, sourceLabel } = useRecommendationSource();
  const { items: cartItems, addItem, incrementItem, decrementItem } = useCart();
  const { addToast } = useToast();
  const [products, setProducts] = useState<HomepageItem[]>([]);
  const [fbtItems, setFbtItems] = useState<FBTItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [addedItem, setAddedItem] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("rank");
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.recommendations
      .homepageRanking(activeDataset, 20, sourceSelector)
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeDataset, sourceSelector]);

  useEffect(() => {
    if (selectedProduct) {
      api.recommendations.fbt(activeDataset, selectedProduct, 5, sourceSelector).then(setFbtItems).catch(console.error);
    }
  }, [selectedProduct, activeDataset, sourceSelector]);

  const productControls = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filteredByQuickFilter = products.filter((product) => {
      if (quickFilter === "top-10") return product.rank <= 10;
      if (quickFilter === "frequent") return product.rule_appearances >= 3;
      if (quickFilter === "budget") return product.price <= 50;
      return true;
    });
    const filtered = normalizedQuery
      ? filteredByQuickFilter.filter((product) => product.item.toLowerCase().includes(normalizedQuery))
      : filteredByQuickFilter;

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "score") return b.total_score - a.total_score;
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "name") return a.item.localeCompare(b.item);
      return a.rank - b.rank;
    });

    return {
      total: products.length,
      filtered: sorted,
    };
  }, [products, query, sortBy, quickFilter]);

  const handleAddToCart = (product: HomepageItem) => {
    const existingQty = cartItems.find((item) => item.name === product.item)?.qty ?? 0;
    addItem({ name: product.item, price: product.price, qty: 1, mappedPrice: product.mapped_price });
    setAddedItem(product.item);
    setTimeout(() => setAddedItem(null), 1200);
    addToast(`${product.item} quantity: ${existingQty + 1}`, "success");
  };

  if (loading) return <LoadingSpinner text="Loading shop..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-[color:var(--color-text)]">Smart Shop: Ranked by Customer Affinity</h2>
          <p className="flex items-center gap-1.5 text-sm text-[color:var(--color-text-muted)]">
            <Brain size={14} className="text-[color:var(--color-text-muted)]" />
            {productControls.filtered.length} of {productControls.total} products shown, based on what customers frequently buy together
          </p>
          <p className="mt-1 text-xs text-[color:var(--color-text-muted)]">Recommendation source: {sourceLabel}</p>
        </div>
      </div>

      <div className="card soft-shell p-4 flex flex-col lg:flex-row gap-3 lg:items-center">
        <div className="flex-1 min-w-0">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search products by name..."
            leftIcon={<Search size={16} />}
            aria-label="Search products"
          />
        </div>
        <div className="w-full lg:w-56">
          <Select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            aria-label="Sort products"
            options={[
              { value: "rank", label: "Sort: MBA Rank" },
              { value: "score", label: "Sort: Score" },
              { value: "price-asc", label: "Sort: Price Low to High" },
              { value: "price-desc", label: "Sort: Price High to Low" },
              { value: "name", label: "Sort: Name A-Z" },
            ]}
          />
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setQuery("");
            setSortBy("rank");
            setQuickFilter("all");
          }}
          className="self-start lg:self-auto"
        >
          Reset Search & Filters
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-[color:var(--color-text-muted)]">Quick filters</span>
        {QUICK_FILTER_OPTIONS.map((filterOption) => (
          <Button
            key={filterOption.value}
            size="sm"
            variant={quickFilter === filterOption.value ? "secondary" : "ghost"}
            onClick={() => setQuickFilter(filterOption.value)}
            className={quickFilter === filterOption.value ? filterOption.toneClass : "text-[color:var(--color-text-muted)]"}
          >
            {filterOption.label}
          </Button>
        ))}
      </div>

      <div className="md:hidden sticky top-16 z-20">
        <div className="card soft-shell px-3 py-2 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max">
            <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-[color:var(--color-text-muted)]">
              <SlidersHorizontal size={12} />
              Filters
            </span>
            {QUICK_FILTER_OPTIONS.map((filterOption) => (
              <Button
                key={`mobile-${filterOption.value}`}
                size="sm"
                variant={quickFilter === filterOption.value ? "secondary" : "ghost"}
                onClick={() => setQuickFilter(filterOption.value)}
                className={`h-7! px-2.5! text-[11px]! ${quickFilter === filterOption.value ? filterOption.toneClass : "text-[color:var(--color-text-muted)]"}`}
              >
                {filterOption.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <div className="flex-1">
          {productControls.filtered.length === 0 ? (
            <EmptyState
              icon={<Search size={42} />}
              title="No Products Match"
              description="Try another keyword or reset filters to view all recommended products."
              action={
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setQuery("");
                    setSortBy("rank");
                    setQuickFilter("all");
                  }}
                >
                  Clear Filters
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {productControls.filtered.map((p, i) => {
              const Icon = ITEM_ICONS[p.item] || Package;
              const cartEntry = cartItems.find((c) => c.name === p.item);
              const inCart = Boolean(cartEntry);
              const justAdded = addedItem === p.item;
              const getAddButtonClass = () => {
                if (justAdded) return "scale-95 bg-emerald-600 text-white";
                if (inCart) return "bg-[color:var(--color-surface-2)] text-[color:var(--color-text)]";
                return "bg-[color:var(--color-text)] text-white hover:opacity-90 active:scale-95";
              };

              const getAddButtonContent = () => {
                if (justAdded) return <><Check size={14} /> Added!</>;
                if (inCart) return <><Check size={14} /> Qty {cartEntry?.qty ?? 1}</>;
                return <><ShoppingCart size={14} /> Add to Cart</>;
              };

              const toggleSelected = () => {
                setSelectedProduct(selectedProduct === p.item ? null : p.item);
              };

              return (
                <div
                  key={p.item}
                  className={`card soft-shell animate-fade-in-up p-4 transition-all duration-200 ${
                    selectedProduct === p.item ? "ring-2 ring-[color:var(--color-text-muted)]" : ""
                  } ${inCart ? "ring-2 ring-[color:var(--color-divider)]" : ""}`}
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  {i < 3 ? (
                    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold text-white bg-linear-to-r ${RANK_COLORS[i]} mb-2`}>
                      <Star size={10} /> #{p.rank}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] text-[color:var(--color-text-muted)] font-mono">#{p.rank}</span>
                      <span className="soft-pressed rounded-md bg-[color:var(--color-surface-2)] px-1.5 py-0.5 text-[10px] text-[color:var(--color-text-muted)]">{p.rule_appearances} rules</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-2">
                    <div className="soft-pressed flex h-8 w-8 items-center justify-center rounded-lg bg-[color:var(--color-surface-2)]">
                      <Icon size={16} className="text-[color:var(--color-text-muted)]" />
                    </div>
                    <p className="text-sm font-semibold text-[color:var(--color-text)] leading-tight">{p.item}</p>
                  </div>

                  <p className="mb-1 font-mono text-lg font-bold text-[color:var(--color-text)]">₱{p.price}</p>
                  <p className="mb-3 text-[10px] text-[color:var(--color-text-muted)]">Score: {p.total_score.toFixed(2)}</p>

                  <button
                    type="button"
                    onClick={toggleSelected}
                    className="soft-pressed mb-2 w-full rounded-full bg-[color:var(--color-surface-2)] py-1.5 text-[11px] font-semibold text-[color:var(--color-text)] transition-colors hover:opacity-90"
                  >
                    {selectedProduct === p.item ? "Hide FBT" : "Show FBT"}
                  </button>

                  <div className="grid grid-cols-[1fr_auto] gap-2">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleAddToCart(p); }}
                      className={`py-2 rounded-xl text-xs font-semibold transition-all duration-300 flex items-center justify-center gap-1.5 ${getAddButtonClass()}`}
                    >
                      {getAddButtonContent()}
                    </button>
                    <div className="soft-pressed rounded-xl bg-[color:var(--color-surface-2)] px-1.5 py-1 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (inCart) decrementItem(p.item);
                        }}
                        disabled={!inCart}
                        aria-label={`Decrease quantity for ${p.item}`}
                        className="rounded-md p-1 text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)] disabled:text-[color:var(--color-divider)] disabled:cursor-not-allowed"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-5 text-center text-[11px] font-semibold text-[color:var(--color-text)]">{cartEntry?.qty ?? 0}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (inCart) {
                            incrementItem(p.item);
                          } else {
                            handleAddToCart(p);
                          }
                        }}
                        aria-label={`Increase quantity for ${p.item}`}
                        className="rounded-md p-1 text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)]"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              );
              })}
            </div>
          )}

          {/* FBT Widget */}
          {selectedProduct && fbtItems.length > 0 && (
            <div className="mt-6 card soft-shell p-5 animate-fade-in-up">
              <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold text-[color:var(--color-text)]">
                <Sparkles size={16} className="text-[color:var(--color-text)]" />
                Frequently Bought With: <span className="text-[color:var(--color-text)]">{selectedProduct}</span>
              </h3>
              <p className="mb-3 flex items-center gap-1 text-[10px] text-[color:var(--color-text-muted)]">
                <Brain size={10} /> Based on MBA Analysis
              </p>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {fbtItems.map((f) => {
                  const FIcon = ITEM_ICONS[f.item] || Package;
                  return (
                    <div key={f.item} className="soft-pressed flex w-44 shrink-0 flex-col gap-2 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] p-3 transition-all">
                      <div className="flex items-center gap-2">
                        <div className="soft-pressed flex h-7 w-7 items-center justify-center rounded-lg bg-[color:var(--color-surface-1)]">
                          <FIcon size={14} className="text-[color:var(--color-text)]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[color:var(--color-text)] truncate">{f.item}</p>
                          <p className="text-[10px] text-[color:var(--color-text-muted)]">{(f.confidence * 100).toFixed(0)}% conf · {f.lift.toFixed(2)}x</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-auto">
                        <span className="font-mono text-sm font-bold text-[color:var(--color-text)]">₱{f.price}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const existingQty = cartItems.find((c) => c.name === f.item)?.qty ?? 0;
                            addItem({ name: f.item, price: f.price, qty: 1, mappedPrice: f.mapped_price });
                            addToast(`${f.item} quantity: ${existingQty + 1}`, "success");
                          }}
                          className="rounded-full bg-[color:var(--color-text)] px-2.5 py-1 text-[10px] font-semibold text-white"
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
