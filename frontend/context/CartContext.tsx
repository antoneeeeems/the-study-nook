"use client";

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { useDataset } from "@/context/DatasetContext";
import { api } from "@/lib/api";
import type { AppliedPromo, CartItem } from "@/lib/types";

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  incrementItem: (name: string) => void;
  decrementItem: (name: string) => void;
  setItemQty: (name: string, qty: number) => void;
  removeItem: (name: string) => void;
  clearCart: () => void;
  total: number;
  subtotal: number;
  totalDiscount: number;
  finalTotal: number;
  appliedPromos: AppliedPromo[];
  totalQuantity: number;
  isMiniCartOpen: boolean;
  openMiniCart: () => void;
  closeMiniCart: () => void;
}

const STORAGE_KEY = "schoolmart-cart-items";

const CartContext = createContext<CartContextType>({
  items: [],
  addItem: () => {},
  incrementItem: () => {},
  decrementItem: () => {},
  setItemQty: () => {},
  removeItem: () => {},
  clearCart: () => {},
  total: 0,
  subtotal: 0,
  totalDiscount: 0,
  finalTotal: 0,
  appliedPromos: [],
  totalQuantity: 0,
  isMiniCartOpen: false,
  openMiniCart: () => {},
  closeMiniCart: () => {},
});

export function CartProvider({ children }: Readonly<{ children: ReactNode }>) {
  const { activeDataset } = useDataset();
  const [items, setItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);
  const [appliedPromos, setAppliedPromos] = useState<AppliedPromo[]>([]);
  const [isMiniCartOpen, setIsMiniCartOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Array<CartItem | { name: string; price: number }>;
        if (Array.isArray(parsed)) {
          const migrated = parsed
            .map((item) => {
              const maybeQty = (item as CartItem).qty;
              return {
                name: item.name,
                price: item.price,
                qty: typeof maybeQty === "number" && maybeQty > 0 ? Math.floor(maybeQty) : 1,
                mappedPrice: (item as CartItem).mappedPrice,
              };
            })
            .filter((item) => item.name && Number.isFinite(item.price));
          setItems(migrated);
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, isHydrated]);

  useEffect(() => {
    if (items.length === 0) {
      setSubtotal(0);
      setTotalDiscount(0);
      setFinalTotal(0);
      setAppliedPromos([]);
      return;
    }

    let cancelled = false;
    const cartPayload = items.map((item) => ({ name: item.name, qty: item.qty }));

    api.recommendations
      .cartPromos(activeDataset, cartPayload)
      .then((result) => {
        if (cancelled) return;
        setSubtotal(result.subtotal);
        setTotalDiscount(result.total_discount);
        setFinalTotal(result.final_total);
        setAppliedPromos(result.applied_promos);
      })
      .catch(() => {
        if (cancelled) return;
        const fallbackSubtotal = items.reduce((sum, i) => sum + (i.price * i.qty), 0);
        setSubtotal(fallbackSubtotal);
        setTotalDiscount(0);
        setFinalTotal(fallbackSubtotal);
        setAppliedPromos([]);
      });

    return () => {
      cancelled = true;
    };
  }, [activeDataset, items]);

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.name === item.name);
      if (existing) {
        return prev.map((i) => (i.name === item.name ? { ...i, qty: i.qty + 1 } : i));
      }
      return [
        ...prev,
        {
          name: item.name,
          price: item.price,
          qty: item.qty && item.qty > 0 ? Math.floor(item.qty) : 1,
          mappedPrice: item.mappedPrice,
        },
      ];
    });
  };

  const incrementItem = (name: string) => {
    setItems((prev) => prev.map((item) => (item.name === name ? { ...item, qty: item.qty + 1 } : item)));
  };

  const decrementItem = (name: string) => {
    setItems((prev) => prev.flatMap((item) => {
      if (item.name !== name) return [item];
      if (item.qty <= 1) return [];
      return [{ ...item, qty: item.qty - 1 }];
    }));
  };

  const setItemQty = (name: string, qty: number) => {
    if (!Number.isFinite(qty)) return;
    const nextQty = Math.max(1, Math.floor(qty));
    setItems((prev) => prev.map((item) => (item.name === name ? { ...item, qty: nextQty } : item)));
  };

  const removeItem = (name: string) => {
    setItems((prev) => prev.filter((i) => i.name !== name));
  };

  const clearCart = () => setItems([]);

  const total = finalTotal;
  const totalQuantity = items.reduce((sum, i) => sum + i.qty, 0);
  const openMiniCart = () => setIsMiniCartOpen(true);
  const closeMiniCart = () => setIsMiniCartOpen(false);
  const contextValue = useMemo(() => ({
    items,
    addItem,
    incrementItem,
    decrementItem,
    setItemQty,
    removeItem,
    clearCart,
    total,
    subtotal,
    totalDiscount,
    finalTotal,
    appliedPromos,
    totalQuantity,
    isMiniCartOpen,
    openMiniCart,
    closeMiniCart,
  }), [
    items,
    total,
    subtotal,
    totalDiscount,
    finalTotal,
    appliedPromos,
    totalQuantity,
    isMiniCartOpen,
  ]);

  return (
    <CartContext.Provider
      value={contextValue}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
