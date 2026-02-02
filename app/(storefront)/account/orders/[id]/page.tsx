"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { formatCents } from "@/lib/utils";

interface OrderDetail {
  id: string;
  status: string;
  event_date_start: string;
  event_date_end: string;
  delivery_required: boolean;
  delivery_address: Record<string, string> | null;
  subtotal_cents: number;
  tax_cents: number;
  delivery_fee_cents: number;
  deposit_cents: number;
  total_cents: number;
  created_at: string;
}

interface OrderItem {
  id: string;
  qty: number;
  unit_price_cents: number;
  line_total_cents: number;
  products: { name: string; slug: string } | null;
}

const statusSteps = [
  { key: "paid", label: "Paid" },
  { key: "scheduled", label: "Scheduled" },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "completed", label: "Completed" },
];

const statusColors: Record<string, string> = {
  pending_payment: "bg-yellow-100 text-yellow-700",
  paid: "bg-green-100 text-green-700",
  scheduled: "bg-blue-100 text-blue-700",
  out_for_delivery: "bg-purple-100 text-purple-700",
  completed: "bg-gray-100 text-gray-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);

  const fetchOrder = useCallback(async () => {
    const supabase = createClient();
    const [{ data: orderData }, { data: itemsData }] = await Promise.all([
      supabase.from("orders").select("*").eq("id", id).single(),
      supabase.from("order_items").select("*, products(name, slug)").eq("order_id", id),
    ]);
    if (orderData) setOrder(orderData);
    setItems((itemsData as OrderItem[]) || []);
  }, [id]);

  useEffect(() => { fetchOrder(); }, [fetchOrder]);

  if (!order) {
    return <div className="py-16 text-center text-gray-500">Loading order...</div>;
  }

  const activeStep = statusSteps.findIndex((s) => s.key === order.status);
  const isCancelled = order.status === "cancelled";

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/account" className="mb-4 inline-block text-sm text-indigo-600 hover:underline">
        &larr; Back to My Account
      </Link>

      <div className="mb-6 flex items-center gap-4">
        <h1 className="text-2xl font-bold">Order #{order.id.slice(0, 8)}</h1>
        <span className={`rounded-full px-3 py-1 text-sm font-medium ${statusColors[order.status]}`}>
          {order.status.replace(/_/g, " ")}
        </span>
      </div>

      {/* Progress tracker */}
      {!isCancelled && order.status !== "pending_payment" && (
        <div className="mb-8 rounded-xl border bg-white p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">Order Progress</h2>
          <div className="flex items-center justify-between">
            {statusSteps.map((step, i) => {
              const isActive = i <= activeStep;
              const isCurrent = i === activeStep;
              return (
                <div key={step.key} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition ${
                        isCurrent
                          ? "border-indigo-600 bg-indigo-600 text-white"
                          : isActive
                            ? "border-green-500 bg-green-500 text-white"
                            : "border-gray-300 bg-white text-gray-400"
                      }`}
                    >
                      {isActive && !isCurrent ? (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        i + 1
                      )}
                    </div>
                    <span className={`mt-2 text-xs font-medium ${isCurrent ? "text-indigo-600" : isActive ? "text-green-600" : "text-gray-400"}`}>
                      {step.label}
                    </span>
                  </div>
                  {i < statusSteps.length - 1 && (
                    <div className={`mx-2 h-0.5 flex-1 ${i < activeStep ? "bg-green-500" : "bg-gray-200"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Order details */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Event Info */}
        <div className="rounded-xl border bg-white p-5">
          <h2 className="mb-3 font-semibold">Event Details</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Dates</span>
              <span className="font-medium">{order.event_date_start} &rarr; {order.event_date_end}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Delivery</span>
              <span className="font-medium">{order.delivery_required ? "Yes" : "Pickup"}</span>
            </div>
            {order.delivery_address && (
              <div className="flex justify-between">
                <span className="text-gray-500">Address</span>
                <span className="text-right font-medium">{(order.delivery_address as Record<string, string>).raw || "On file"}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Placed</span>
              <span className="font-medium">{new Date(order.created_at).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="rounded-xl border bg-white p-5">
          <h2 className="mb-3 font-semibold">Payment Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span>{formatCents(order.subtotal_cents)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Tax</span>
              <span>{formatCents(order.tax_cents)}</span>
            </div>
            {order.delivery_fee_cents > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500">Delivery</span>
                <span>{formatCents(order.delivery_fee_cents)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Deposit (refundable)</span>
              <span>{formatCents(order.deposit_cents)}</span>
            </div>
            <hr />
            <div className="flex justify-between text-base font-bold">
              <span>Total</span>
              <span>{formatCents(order.total_cents)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="mt-6 rounded-xl border bg-white p-5">
        <h2 className="mb-3 font-semibold">Items</h2>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Link
                  href={`/products/${item.products?.slug || ""}`}
                  className="font-medium text-indigo-600 hover:underline"
                >
                  {item.products?.name || "Product"}
                </Link>
                <p className="text-sm text-gray-500">
                  {formatCents(item.unit_price_cents)} &times; {item.qty}
                </p>
              </div>
              <span className="font-semibold">{formatCents(item.line_total_cents)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
