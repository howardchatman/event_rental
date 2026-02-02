import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PricingModel } from "@/lib/pricing/calc";

export interface CartProduct {
  productId: string;
  name: string;
  slug: string;
  imageUrl: string;
  pricingModel: PricingModel;
  basePriceCents: number;
  securityDepositCents: number;
  qty: number;
}

interface DateRange {
  startDate: string | null; // ISO date string YYYY-MM-DD
  endDate: string | null;
}

interface CartState {
  items: CartProduct[];
  dates: DateRange;
  deliveryRequired: boolean;
  deliveryAddress: string;

  addItem: (product: Omit<CartProduct, "qty">, qty: number) => void;
  updateQty: (productId: string, qty: number) => void;
  removeItem: (productId: string) => void;
  setDates: (start: string, end: string) => void;
  setDelivery: (required: boolean, address?: string) => void;
  clearCart: () => void;
  itemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      dates: { startDate: null, endDate: null },
      deliveryRequired: false,
      deliveryAddress: "",

      addItem: (product, qty) => {
        set((state) => {
          const existing = state.items.find((i) => i.productId === product.productId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === product.productId ? { ...i, qty: i.qty + qty } : i
              ),
            };
          }
          return { items: [...state.items, { ...product, qty }] };
        });
      },

      updateQty: (productId, qty) => {
        set((state) => ({
          items: qty <= 0
            ? state.items.filter((i) => i.productId !== productId)
            : state.items.map((i) => (i.productId === productId ? { ...i, qty } : i)),
        }));
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }));
      },

      setDates: (start, end) => {
        set({ dates: { startDate: start, endDate: end } });
      },

      setDelivery: (required, address) => {
        set({ deliveryRequired: required, deliveryAddress: address || "" });
      },

      clearCart: () => {
        set({
          items: [],
          dates: { startDate: null, endDate: null },
          deliveryRequired: false,
          deliveryAddress: "",
        });
      },

      itemCount: () => get().items.reduce((sum, i) => sum + i.qty, 0),
    }),
    { name: "event-rental-cart" }
  )
);
