"use client";

import { useEffect, useState } from "react";
import { useDataset } from "@/context/DatasetContext";
import { useRecommendationSource } from "@/context/RecommendationSourceContext";
import { useToast } from "@/context/ToastContext";
import { api } from "@/lib/api";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import Button from "@/components/shared/Button";
import { Tag, Flame, Percent, Copy } from "lucide-react";
import type { Promo } from "@/lib/types";

const CUTOUT_IDS = ["a", "b", "c", "d", "e", "f"] as const;

function getPromoDiscount(tag: Promo["tag"]) {
  if (tag === "Hot Deal") return "15%";
  if (tag === "Bundle Saver") return "10%";
  return "5%";
}

function getPromoTagClass(tag: Promo["tag"]) {
  if (tag === "Hot Deal") return "tag-hot-deal";
  if (tag === "Bundle Saver") return "tag-bundle-saver";
  return "tag-starter-bundle";
}

function getPromoIcon(tag: Promo["tag"]) {
  if (tag === "Hot Deal") return <Flame size={12} />;
  if (tag === "Bundle Saver") return <Percent size={12} />;
  return <Tag size={12} />;
}

export default function PromosPage() {
  const { activeDataset } = useDataset();
  const { sourceSelector, sourceLabel } = useRecommendationSource();
  const { addToast } = useToast();
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.recommendations
      .promos(activeDataset, 10, sourceSelector)
      .then(setPromos)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeDataset, sourceSelector]);

  if (loading) return <LoadingSpinner text="Generating promos..." />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[color:var(--color-text)]">Promo Recommendations</h2>
        <p className="text-sm text-[color:var(--color-text-muted)]">Tiered discount recommendations from {sourceLabel}, prioritized by lift and confidence for manager review</p>
      </div>

      {/* Tier Legend */}
      <div className="card soft-shell p-4 flex flex-wrap gap-6">
        <div className="flex items-center gap-2">
          <span className="tag-hot-deal flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase"><Flame size={10} /> Hot Deal</span>
          <span className="text-xs text-[color:var(--color-text-muted)]">Lift &gt;= 1.3 and Conf &gt;= 45% -&gt; 15% off</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="tag-bundle-saver flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase"><Percent size={10} /> Bundle Saver</span>
          <span className="text-xs text-[color:var(--color-text-muted)]">Lift &gt;= 1.1 and Conf &gt;= 35% -&gt; 10% off</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="tag-starter-bundle flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase"><Tag size={10} /> Starter</span>
          <span className="text-xs text-[color:var(--color-text-muted)]">Default -&gt; 5% off</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {promos.map((p, i) => {
          const discountPct = getPromoDiscount(p.tag);
          const promoTagClass = getPromoTagClass(p.tag);
          const promoIcon = getPromoIcon(p.tag);
          return (
            <div
              key={`${p.tag}-${p.bundle}-${p.lift.toFixed(3)}`}
              className="group relative card soft-shell overflow-hidden animate-fade-in-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {/* Coupon cut edge */}
              <div className="absolute right-0 top-0 bottom-0 w-4 flex flex-col justify-around">
                {CUTOUT_IDS.map((id) => (
                  <div key={`${p.bundle}-${id}`} className="soft-pressed w-4 h-4 rounded-full bg-surface -mr-2" />
                ))}
              </div>

              {/* Discount sticker */}
              <div className="absolute top-3 right-6 flex h-12 w-12 rotate-12 items-center justify-center rounded-full bg-linear-to-br from-[color:var(--color-indigo-700)] to-[color:var(--color-indigo-900)] shadow-lg">
                <span className="text-white text-[10px] font-black leading-none text-center">
                  {discountPct}<br />OFF
                </span>
              </div>

              {/* Tag header */}
              <div className={`soft-pressed px-5 py-2 ${promoTagClass}`}>
                <span className="text-xs font-bold uppercase flex items-center gap-1.5">
                  {promoIcon}
                  {p.tag}
                </span>
              </div>

              {/* Content */}
              <div className="p-5 pr-8">
                <p className="text-base font-bold text-[color:var(--color-text)] mb-3">{p.bundle}</p>

                {/* Dashed divider */}
                <div className="border-t-2 border-dashed border-[color:var(--color-border)] my-3 relative">
                  <div className="soft-pressed absolute -left-7 -top-2 w-4 h-4 rounded-full bg-surface" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[color:var(--color-text-muted)]">Regular Price</span>
                    <span className="line-through text-[color:var(--color-text-muted)] opacity-70 font-mono">â‚±{p.regular_price}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[color:var(--color-text-muted)]">Discount</span>
                    <span className="font-semibold text-[color:var(--color-text)]">{p.discount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[color:var(--color-text-muted)]">You Save</span>
                    <span className="font-mono font-semibold text-[color:var(--color-emerald)]">â‚±{p.savings}</span>
                  </div>
                  <div className="border-t border-[color:var(--color-border)] pt-2 flex justify-between items-center">
                    <span className="font-semibold text-[color:var(--color-text)]">Promo Price</span>
                    <span className="font-mono text-xl font-black text-[color:var(--color-text)]">â‚±{p.promo_price}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <span className="text-[10px] font-mono text-[color:var(--color-text-muted)]">Lift: {p.lift.toFixed(3)}</span>
                  <Button
                    onClick={() => addToast(`Promo "${p.bundle}" copied!`, "info")}
                    variant="ghost"
                    size="sm"
                    icon={<Copy size={10} />}
                    className="px-2! py-1! text-[10px]"
                  >
                    Copy
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

