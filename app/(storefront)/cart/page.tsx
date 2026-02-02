"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useCartStore } from "@/lib/store/cart";
import { createClient } from "@/lib/supabase/client";
import { calculateOrderTotals } from "@/lib/pricing/calc";
import DateRangePicker from "@/components/DateRangePicker";
import QuantitySelector from "@/components/QuantitySelector";
import { formatCents } from "@/lib/utils";

export default function CartPage() {
  const router = useRouter();
  const {
    items, dates, deliveryRequired, deliveryAddress,
    removeItem, updateQty, setDates, setDelivery,
  } = useCartStore();
  const [loading, setLoading] = useState(false);

  // Hydration guard
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const hasDates = !!dates.startDate && !!dates.endDate;
  const totals = hasDates
    ? calculateOrderTotals(
        items.map((i) => ({
          productId: i.productId,
          qty: i.qty,
          pricingModel: i.pricingModel,
          basePriceCents: i.basePriceCents,
          securityDepositCents: i.securityDepositCents,
          name: i.name,
        })),
        new Date(dates.startDate!),
        new Date(dates.endDate!),
        deliveryRequired
      )
    : null;

  const handleCheckout = async () => {
    if (!hasDates) {
      toast.error("Please select rental dates");
      return;
    }
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login?redirect=/cart");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_date_start: dates.startDate,
          event_date_end: dates.endDate,
          delivery_required: deliveryRequired,
          delivery_address: deliveryRequired ? { raw: deliveryAddress } : null,
          items: items.map((i) => ({ product_id: i.productId, qty: i.qty })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Checkout failed");
        return;
      }

      window.location.href = data.url;
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Hero strip */}
      <section className="bg-charcoal px-6 py-10 text-center text-white">
        <h1 className="text-3xl font-light sm:text-4xl">Your Cart</h1>
      </section>

      <div className="mx-auto max-w-3xl px-6 py-12">
        {/* Date picker */}
        <div className="mb-6 border border-ivory-dark bg-white p-6">
          <h2 className="mb-3 font-body text-xs font-semibold uppercase tracking-[0.15em] text-charcoal-light">
            Rental Dates
          </h2>
          <DateRangePicker
            startDate={dates.startDate || ""}
            endDate={dates.endDate || ""}
            onChange={(s, e) => setDates(s, e)}
          />
        </div>

        {/* Items */}
        {items.length === 0 ? (
          <p className="py-16 text-center font-body text-warm-gray">Your cart is empty.</p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const lineItem = totals?.lineItems.find((l) => l.productId === item.productId);
              return (
                <div
                  key={item.productId}
                  className="flex flex-col gap-3 border border-ivory-dark bg-white p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex-1">
                    <p className="font-heading text-lg font-normal text-charcoal">{item.name}</p>
                    <p className="font-body text-sm text-warm-gray">
                      {formatCents(item.basePriceCents)}/{item.pricingModel === "flat" ? "event" : "day"}
                    </p>
                  </div>
                  <QuantitySelector qty={item.qty} onChange={(q) => updateQty(item.productId, q)} />
                  <div className="text-right">
                    {lineItem && (
                      <p className="font-body text-base font-medium text-charcoal">
                        {formatCents(lineItem.lineTotalCents)}
                      </p>
                    )}
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="mt-1 font-body text-xs text-warm-gray transition-colors hover:text-red-500"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Delivery */}
        <div className="mt-6 border border-ivory-dark bg-white p-6">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={deliveryRequired}
              onChange={(e) => setDelivery(e.target.checked, deliveryAddress)}
              className="h-4 w-4 rounded border-warm-gray-light text-champagne accent-champagne"
            />
            <span className="font-body text-sm font-medium text-charcoal">
              Delivery required (+{formatCents(7500)})
            </span>
          </label>
          {deliveryRequired && (
            <textarea
              value={deliveryAddress}
              onChange={(e) => setDelivery(true, e.target.value)}
              placeholder="Enter delivery address..."
              className="mt-3 w-full border border-ivory-dark px-4 py-3 font-body text-sm text-charcoal placeholder:text-warm-gray-light focus:border-champagne focus:outline-none focus:ring-1 focus:ring-champagne"
              rows={2}
            />
          )}
        </div>

        {/* Totals */}
        {totals && items.length > 0 && (
          <div className="mt-6 border border-ivory-dark bg-white p-6">
            <div className="space-y-3 font-body text-sm">
              <div className="flex justify-between">
                <span className="text-warm-gray">Subtotal</span>
                <span className="text-charcoal">{formatCents(totals.subtotalCents)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-warm-gray">Tax (8%)</span>
                <span className="text-charcoal">{formatCents(totals.taxCents)}</span>
              </div>
              {deliveryRequired && (
                <div className="flex justify-between">
                  <span className="text-warm-gray">Delivery Fee</span>
                  <span className="text-charcoal">{formatCents(totals.deliveryFeeCents)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-warm-gray">Security Deposit (refundable)</span>
                <span className="text-charcoal">{formatCents(totals.depositCents)}</span>
              </div>
              <div className="border-t border-ivory-dark pt-3" />
              <div className="flex justify-between font-heading text-xl font-normal">
                <span className="text-charcoal">Total</span>
                <span className="text-charcoal">{formatCents(totals.totalCents)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Checkout button */}
        {items.length > 0 && (
          <button
            onClick={handleCheckout}
            disabled={loading || !hasDates}
            className="mt-6 w-full bg-champagne py-4 font-body text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-champagne-dark disabled:opacity-40"
          >
            {loading ? "Redirecting to payment..." : "Proceed to Checkout"}
          </button>
        )}
      </div>
    </div>
  );
}
