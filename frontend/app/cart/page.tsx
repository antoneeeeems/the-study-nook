"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useDataset } from "@/context/DatasetContext";
import { useCart } from "@/context/CartContext";
import { useRecommendationSource } from "@/context/RecommendationSourceContext";
import { useToast } from "@/context/ToastContext";
import { api } from "@/lib/api";
import type { CrossSellItem } from "@/lib/types";
import Button from "@/components/shared/Button";
import EmptyState from "@/components/shared/EmptyState";
import { ArrowRight, Brain, Check, Minus, Plus, ShoppingCart, Sparkles, Trash2, X } from "lucide-react";

export default function CartPage() {
  const { activeDataset } = useDataset();
  const { sourceSelector, sourceLabel } = useRecommendationSource();
  const { addToast } = useToast();
  const {
    items,
    addItem,
    incrementItem,
    decrementItem,
    removeItem,
    clearCart,
    subtotal,
    totalDiscount,
    finalTotal,
    appliedPromos,
    totalQuantity,
  } = useCart();

  const [crossSell, setCrossSell] = useState<CrossSellItem[]>([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    if (items.length === 0) return;

    api.recommendations
      .crossSell(activeDataset, [...new Set(items.map((item) => item.name))], 4, sourceSelector)
      .then(setCrossSell)
      .catch(() => setCrossSell([]));
  }, [activeDataset, items, sourceSelector]);

  const handleCheckout = () => {
    setIsCheckingOut(true);
    setTimeout(() => {
      setIsCheckingOut(false);
      clearCart();
      addToast("Order placed successfully!", "success");
    }, 2000);
  };

  if (items.length === 0) {
    return (
      <div className="space-y-6 max-w-5xl">
        <div>
          <h2 className="text-xl font-bold text-[color:var(--color-text)]">Main Cart</h2>
          <p className="text-sm text-[color:var(--color-text-muted)]">
            Review your selected products before checkout and discover smart add-ons.
          </p>
        </div>
        <EmptyState
          icon={<ShoppingCart size={40} />}
          title="Your cart is empty"
          description="Add products from the Store to build your order and unlock AI recommendations."
          action={
            <Link href="/shop">
              <Button icon={<ArrowRight size={16} />}>Go to Shop</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h2 className="text-xl font-bold text-[color:var(--color-text)]">Main Cart</h2>
        <p className="text-sm text-[color:var(--color-text-muted)]">
          Complete your order with confidence using data-backed product suggestions.
        </p>
        <p className="mt-1 text-xs text-[color:var(--color-text-muted)]">Recommendation source: {sourceLabel}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 card soft-shell p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[color:var(--color-text)] flex items-center gap-2">
              <ShoppingCart size={16} className="text-[color:var(--color-text)]" />
              Items ({totalQuantity})
            </h3>
            <button type="button" onClick={clearCart} className="text-xs text-rose font-semibold hover:underline flex items-center gap-1">
              <Trash2 size={12} /> Clear
            </button>
          </div>

          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.name} className="soft-pressed flex items-center justify-between rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] p-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[color:var(--color-text)]">{item.name}</p>
                  <p className="text-xs text-[color:var(--color-text-muted)]">₱{item.price} each</p>
                  {item.mappedPrice === false && (
                    <p className="text-[10px] text-amber-700 font-semibold mt-0.5">Fallback price applied</p>
                  )}
                  <p className="text-xs text-[color:var(--color-text-muted)] mt-1">Line total: ₱{item.price * item.qty}</p>
                </div>
                <div className="flex items-center gap-2 ml-3">
                  <button
                    type="button"
                    onClick={() => decrementItem(item.name)}
                    aria-label={`Decrease quantity for ${item.name}`}
                    className="soft-pressed p-1 rounded-md text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)] hover:bg-[color:var(--color-surface-1)]"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-6 text-center text-sm font-semibold text-[color:var(--color-text)]">{item.qty}</span>
                  <button
                    type="button"
                    onClick={() => incrementItem(item.name)}
                    aria-label={`Increase quantity for ${item.name}`}
                    className="soft-pressed p-1 rounded-md text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)] hover:bg-[color:var(--color-surface-1)]"
                  >
                    <Plus size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(item.name)}
                    aria-label={`Remove ${item.name}`}
                    className="p-1 rounded-md text-rose/70 hover:text-rose hover:bg-rose/10"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {crossSell.length > 0 && (
            <section className="mt-5 border-t border-[color:var(--color-border)] pt-4">
              <p className="mb-2 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-text-muted)]">
                <Sparkles size={10} className="text-[color:var(--color-text)]" /> Recommended Add-ons
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {crossSell.map((suggestion) => (
                  <article key={suggestion.suggested_item} className="soft-pressed rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] p-3">
                    <p className="text-xs font-semibold text-[color:var(--color-text)]">{suggestion.suggested_item}</p>
                    <p className="text-[10px] text-[color:var(--color-text-muted)] mt-1 flex items-start gap-1">
                      <Brain size={10} className="mt-0.5 shrink-0 text-[color:var(--color-text-muted)]" />
                      {Math.round(suggestion.confidence * 100)}% of customers who buy {suggestion.because_you_have} also buy this item.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        addItem({
                          name: suggestion.suggested_item,
                          price: suggestion.price,
                          qty: 1,
                          mappedPrice: suggestion.mapped_price,
                        });
                        addToast(`${suggestion.suggested_item} added to cart`, "success");
                      }}
                      className="mt-2 w-full rounded-full bg-[color:var(--color-text)] py-1.5 text-[11px] font-semibold text-white hover:opacity-90"
                    >
                      Add ₱{suggestion.price}
                    </button>
                  </article>
                ))}
              </div>
            </section>
          )}
        </section>

        <aside className="card soft-shell p-5 h-fit">
          <h3 className="text-sm font-semibold text-[color:var(--color-text)] mb-4">Order Summary</h3>
          <div className="space-y-2 mb-4 border-b border-[color:var(--color-border)] pb-4">
            <div className="flex items-center justify-between text-xs text-[color:var(--color-text-muted)]">
              <span>Items</span>
              <span>{totalQuantity}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-[color:var(--color-text-muted)]">
              <span>Subtotal</span>
              <span className="font-mono">₱{subtotal}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-[color:var(--color-text-muted)]">
              <span>Promo Discount</span>
              <span className="font-mono text-emerald-700">-₱{totalDiscount}</span>
            </div>
          </div>
          {appliedPromos.length > 0 && (
            <div className="mb-4 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[color:var(--color-text-muted)] mb-2">Applied Promos</p>
              <div className="space-y-1.5">
                {appliedPromos.map((promo) => (
                  <div key={`${promo.tag}-${promo.bundle}`} className="flex items-start justify-between gap-2 text-xs">
                    <div className="text-[color:var(--color-text-muted)]">
                      <p className="font-semibold text-[color:var(--color-text)]">{promo.tag}</p>
                      <p>{promo.bundle} x{promo.applications}</p>
                    </div>
                    <span className="font-mono text-emerald-700">-₱{promo.savings}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-[color:var(--color-text)]">Total</span>
            <span className="font-mono text-2xl font-bold text-[color:var(--color-text)]">₱{finalTotal}</span>
          </div>
          <Button onClick={handleCheckout} className="w-full" icon={<ShoppingCart size={16} />}>
            Checkout
          </Button>
          <Link href="/shop" className="block mt-2">
            <Button variant="secondary" className="w-full" icon={<ArrowRight size={16} />}>
              Continue Shopping
            </Button>
          </Link>
          <p className="mt-3 text-[10px] text-[color:var(--color-text-muted)] text-center">
            Secure demo checkout for assignment simulation.
          </p>
        </aside>
      </div>

      {isCheckingOut && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="card-elevated soft-shell p-8 text-center animate-scale-in max-w-sm mx-4">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[color:var(--color-surface-2)]">
              <Check size={32} className="text-[color:var(--color-text)]" />
            </div>
            <h3 className="text-xl font-bold text-[color:var(--color-text)] mb-1">Order Placed!</h3>
            <p className="mb-2 text-sm text-[color:var(--color-text-muted)]">Thank you for your purchase</p>
            <p className="font-mono text-2xl font-bold text-[color:var(--color-text)]">₱{finalTotal}</p>
          </div>
        </div>
      )}
    </div>
  );
}
