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
    removeItem, updateQty, setDates, setDelivery, clearCart,
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

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-3xl font-bold">Your Cart</h1>

      {/* Date picker */}
      <div className="mb-6 rounded-xl border bg-white p-5">
        <h2 className="mb-3 font-semibold">Rental Dates</h2>
        <DateRangePicker
          startDate={dates.startDate || ""}
          endDate={dates.endDate || ""}
          onChange={(s, e) => setDates(s, e)}
        />
      </div>

      {/* Items */}
      {items.length === 0 ? (
        <p className="py-12 text-center text-gray-500">Your cart is empty.</p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const lineItem = totals?.lineItems.find((l) => l.productId === item.productId);
            return (
              <div
                key={item.productId}
                className="flex flex-col gap-3 rounded-xl border bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex-1">
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-gray-500">
                    {formatCents(item.basePriceCents)}/{item.pricingModel === "flat" ? "event" : "day"}
                  </p>
                </div>
                <QuantitySelector qty={item.qty} onChange={(q) => updateQty(item.productId, q)} />
                <div className="text-right">
                  {lineItem && (
                    <p className="font-semibold">{formatCents(lineItem.lineTotalCents)}</p>
                  )}
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="mt-1 text-sm text-red-500 hover:underline"
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
      <div className="mt-6 rounded-xl border bg-white p-5">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={deliveryRequired}
            onChange={(e) => setDelivery(e.target.checked, deliveryAddress)}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600"
          />
          <span className="font-medium">Delivery required (+{formatCents(7500)})</span>
        </label>
        {deliveryRequired && (
          <textarea
            value={deliveryAddress}
            onChange={(e) => setDelivery(true, e.target.value)}
            placeholder="Enter delivery address..."
            className="mt-3 w-full rounded-lg border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            rows={2}
          />
        )}
      </div>

      {/* Totals */}
      {totals && items.length > 0 && (
        <div className="mt-6 rounded-xl border bg-white p-5">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">{formatCents(totals.subtotalCents)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax (8%)</span>
              <span className="font-medium">{formatCents(totals.taxCents)}</span>
            </div>
            {deliveryRequired && (
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Fee</span>
                <span className="font-medium">{formatCents(totals.deliveryFeeCents)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Security Deposit (refundable)</span>
              <span className="font-medium">{formatCents(totals.depositCents)}</span>
            </div>
            <hr />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{formatCents(totals.totalCents)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Checkout button */}
      {items.length > 0 && (
        <button
          onClick={handleCheckout}
          disabled={loading || !hasDates}
          className="mt-6 w-full rounded-lg bg-indigo-600 py-3 text-lg font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Redirecting to payment..." : "Proceed to Checkout"}
        </button>
      )}
    </div>
  );
}
