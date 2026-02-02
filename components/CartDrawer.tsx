"use client";

import { useCartStore } from "@/lib/store/cart";
import { formatCents } from "@/lib/utils";
import Link from "next/link";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQty, dates } = useCartStore();

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-charcoal/40"
        onClick={onClose}
      />
      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md border-l border-ivory-dark bg-ivory shadow-2xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-ivory-dark px-6 py-5">
            <h2 className="font-heading text-xl font-normal text-charcoal">Your Cart</h2>
            <button onClick={onClose} className="text-warm-gray transition-colors hover:text-charcoal">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Dates */}
          {dates.startDate && dates.endDate && (
            <div className="border-b border-ivory-dark bg-white px-6 py-3 font-body text-sm text-champagne">
              {dates.startDate} &rarr; {dates.endDate}
            </div>
          )}

          {/* Items */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {items.length === 0 ? (
              <p className="py-8 text-center font-body text-sm text-warm-gray">Your cart is empty</p>
            ) : (
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.productId} className="flex items-center gap-4 border border-ivory-dark bg-white p-4">
                    <div className="flex-1">
                      <p className="font-heading text-base font-normal text-charcoal">{item.name}</p>
                      <p className="font-body text-xs text-warm-gray">
                        {formatCents(item.basePriceCents)} &times; {item.qty}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateQty(item.productId, item.qty - 1)}
                        className="flex h-7 w-7 items-center justify-center border border-ivory-dark font-body text-sm text-charcoal-light hover:border-champagne"
                      >
                        &minus;
                      </button>
                      <span className="w-6 text-center font-body text-sm text-charcoal">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.productId, item.qty + 1)}
                        className="flex h-7 w-7 items-center justify-center border border-ivory-dark font-body text-sm text-charcoal-light hover:border-champagne"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="text-warm-gray-light transition-colors hover:text-red-400"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-ivory-dark px-6 py-5">
              <Link
                href="/cart"
                onClick={onClose}
                className="block w-full bg-champagne py-3.5 text-center font-body text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-champagne-dark"
              >
                View Cart &amp; Checkout
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
