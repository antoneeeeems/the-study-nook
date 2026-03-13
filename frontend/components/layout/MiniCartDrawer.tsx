"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useDataset } from "@/context/DatasetContext";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { api } from "@/lib/api";
import type { CrossSellItem } from "@/lib/types";
import Button from "@/components/shared/Button";
import { Brain, Minus, Plus, ShoppingCart, Sparkles, Trash2, X } from "lucide-react";

export default function MiniCartDrawer() {
  const { activeDataset } = useDataset();
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
    totalQuantity,
    isMiniCartOpen,
    closeMiniCart,
  } = useCart();

  const [crossSell, setCrossSell] = useState<CrossSellItem[]>([]);

  useEffect(() => {
    if (!isMiniCartOpen) return;

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMiniCart();
    };

    globalThis.addEventListener("keydown", onEscape);
    return () => globalThis.removeEventListener("keydown", onEscape);
  }, [isMiniCartOpen, closeMiniCart]);

  useEffect(() => {
    if (!isMiniCartOpen || items.length === 0) return;

    api.recommendations
      .crossSell(activeDataset, [...new Set(items.map((item) => item.name))], 3)
      .then(setCrossSell)
      .catch(() => setCrossSell([]));
  }, [activeDataset, isMiniCartOpen, items]);

  if (!isMiniCartOpen) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Close mini cart"
        className="fixed inset-0 bg-black/20 z-40"
        onClick={closeMiniCart}
      />

      <dialog
        open
        aria-labelledby="mini-cart-title"
        className="fixed right-0 top-14 bottom-0 z-50 flex w-96 max-w-[90vw] flex-col border-l border-[color:var(--color-border)] bg-[color:var(--color-surface-1)] shadow-2xl animate-slide-in-right"
      >
        <div className="flex items-center justify-between border-b border-[color:var(--color-border)] p-4">
          <h2 id="mini-cart-title" className="text-sm font-semibold text-[color:var(--color-text)] flex items-center gap-2">
            <ShoppingCart size={16} className="text-[color:var(--color-text)]" />
            Mini Cart ({totalQuantity})
          </h2>
          <button
            type="button"
            onClick={closeMiniCart}
            aria-label="Close mini cart"
            className="p-1 rounded-lg text-[color:var(--color-text-muted)] hover:bg-[color:var(--color-surface-2)] hover:text-[color:var(--color-text)]"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <p className="text-sm text-[color:var(--color-text-muted)] text-center py-8">
              Your cart is empty. Add items from the Store to see recommendations.
            </p>
          ) : (
            <>
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.name} className="soft-pressed flex items-center justify-between rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] p-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[color:var(--color-text)]">{item.name}</p>
                      <p className="text-xs text-[color:var(--color-text-muted)]">₱{item.price} each</p>
                      {item.mappedPrice === false && (
                        <p className="text-[10px] text-amber-700 font-semibold mt-0.5">Fallback price applied</p>
                      )}
                      <p className="text-xs text-[color:var(--color-text-muted)] mt-1">Line total: ₱{item.price * item.qty}</p>
                    </div>
                    <div className="flex items-center gap-1.5 ml-2">
                      <button
                        type="button"
                        onClick={() => decrementItem(item.name)}
                        aria-label={`Decrease quantity for ${item.name}`}
                        className="soft-pressed p-1 rounded-md text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)] hover:bg-[color:var(--color-surface-1)]"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-6 text-center text-xs font-semibold text-[color:var(--color-text)]">{item.qty}</span>
                      <button
                        type="button"
                        onClick={() => incrementItem(item.name)}
                        aria-label={`Increase quantity for ${item.name}`}
                        className="soft-pressed p-1 rounded-md text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)] hover:bg-[color:var(--color-surface-1)]"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.name)}
                      aria-label={`Remove ${item.name} from cart`}
                      className="p-1 rounded-md text-rose/70 hover:text-rose hover:bg-rose/10"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="border-t border-[color:var(--color-border)] pt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-[color:var(--color-text)]">Subtotal</span>
                  <span className="font-mono text-lg font-bold text-[color:var(--color-text)]">₱{subtotal}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-[color:var(--color-text-muted)]">Promo Discount</span>
                  <span className="font-mono text-xs font-semibold text-emerald-700">-₱{totalDiscount}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-[color:var(--color-text)]">Final Total</span>
                  <span className="font-mono text-lg font-bold text-[color:var(--color-text)]">₱{finalTotal}</span>
                </div>
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-xs text-rose font-semibold hover:underline flex items-center gap-1"
                >
                  <Trash2 size={12} /> Clear Cart
                </button>
              </div>

              {crossSell.length > 0 && (
                <section className="border-t border-[color:var(--color-border)] pt-4">
                  <p className="mb-2 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-text-muted)]">
                    <Sparkles size={10} className="text-[color:var(--color-text)]" /> You might also like
                  </p>
                  <div className="space-y-2">
                    {crossSell.map((suggestion) => (
                      <article key={suggestion.suggested_item} className="soft-pressed rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] p-3">
                        <p className="text-xs font-semibold text-[color:var(--color-text)]">{suggestion.suggested_item}</p>
                        <p className="text-[10px] text-[color:var(--color-text-muted)] mt-1 flex items-start gap-1">
                          <Brain size={10} className="mt-0.5 shrink-0 text-[color:var(--color-text-muted)]" />
                          {Math.round(suggestion.confidence * 100)}% of customers who buy {suggestion.because_you_have} also pick {suggestion.suggested_item}.
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
            </>
          )}
        </div>

        <div className="p-4 border-t border-[color:var(--color-border)] space-y-2">
          <Link href="/cart" onClick={closeMiniCart} className="block">
            <Button className="w-full" icon={<ShoppingCart size={16} />}>
              Go to Main Cart
            </Button>
          </Link>
          <Link href="/shop" onClick={closeMiniCart} className="block">
            <Button variant="secondary" className="w-full">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </dialog>
    </>
  );
}

