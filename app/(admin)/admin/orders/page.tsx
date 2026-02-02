"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatCents } from "@/lib/utils";

interface Order {
  id: string;
  customer_id: string;
  status: string;
  event_date_start: string;
  event_date_end: string;
  subtotal_cents: number;
  tax_cents: number;
  delivery_fee_cents: number;
  deposit_cents: number;
  total_cents: number;
  delivery_required: boolean;
  delivery_address: Record<string, string> | null;
  created_at: string;
  stripe_payment_intent_id: string | null;
}

interface OrderItem {
  id: string;
  product_id: string;
  qty: number;
  unit_price_cents: number;
  line_total_cents: number;
  products: { name: string } | null;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selected, setSelected] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const supabase = createClient();

  const fetchOrders = useCallback(async () => {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    setOrders(data || []);
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleSelect = async (order: Order) => {
    setSelected(order);
    const { data } = await supabase
      .from("order_items")
      .select("*, products(name)")
      .eq("order_id", order.id);
    setOrderItems((data as OrderItem[]) || []);
  };

  const handleStatusUpdate = async (orderId: string, status: string) => {
    await supabase.from("orders").update({ status }).eq("id", orderId);
    fetchOrders();
    if (selected?.id === orderId) {
      setSelected({ ...selected, status });
    }
  };

  const statusColors: Record<string, string> = {
    pending_payment: "bg-yellow-100 text-yellow-700",
    paid: "bg-green-100 text-green-700",
    scheduled: "bg-blue-100 text-blue-700",
    out_for_delivery: "bg-purple-100 text-purple-700",
    completed: "bg-gray-100 text-gray-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Orders</h1>

      <div className="flex gap-6">
        {/* List */}
        <div className="flex-1 overflow-x-auto rounded-lg border bg-white">
          <table className="min-w-full divide-y">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">Order</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">Dates</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((o) => (
                <tr
                  key={o.id}
                  onClick={() => handleSelect(o)}
                  className={`cursor-pointer hover:bg-gray-50 ${selected?.id === o.id ? "bg-indigo-50" : ""}`}
                >
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-sm">{o.id.slice(0, 8)}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[o.status] || "bg-gray-100"}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">{o.event_date_start}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium">{formatCents(o.total_cents)}</td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">No orders</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Detail drawer */}
        {selected && (
          <div className="w-96 shrink-0 rounded-xl border bg-white p-5">
            <h2 className="mb-4 text-lg font-bold">Order Detail</h2>
            <div className="space-y-3 text-sm">
              <p><span className="text-gray-500">ID:</span> <span className="font-mono">{selected.id}</span></p>
              <p><span className="text-gray-500">Status:</span>{" "}
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[selected.status]}`}>
                  {selected.status}
                </span>
              </p>
              <p><span className="text-gray-500">Event:</span> {selected.event_date_start} &rarr; {selected.event_date_end}</p>
              <p><span className="text-gray-500">Delivery:</span> {selected.delivery_required ? "Yes" : "No"}</p>

              {/* Status actions */}
              <div className="flex flex-wrap gap-2">
                {["paid", "scheduled", "out_for_delivery", "completed", "cancelled"].map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusUpdate(selected.id, s)}
                    disabled={selected.status === s}
                    className="rounded border px-2 py-1 text-xs hover:bg-gray-50 disabled:opacity-30"
                  >
                    {s}
                  </button>
                ))}
              </div>

              <hr />
              <h3 className="font-semibold">Items</h3>
              {orderItems.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span>{item.products?.name || item.product_id.slice(0, 8)} &times; {item.qty}</span>
                  <span className="font-medium">{formatCents(item.line_total_cents)}</span>
                </div>
              ))}

              <hr />
              <div className="space-y-1">
                <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatCents(selected.subtotal_cents)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Tax</span><span>{formatCents(selected.tax_cents)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Delivery</span><span>{formatCents(selected.delivery_fee_cents)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Deposit</span><span>{formatCents(selected.deposit_cents)}</span></div>
                <div className="flex justify-between font-bold"><span>Total</span><span>{formatCents(selected.total_cents)}</span></div>
              </div>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="mt-4 text-sm text-gray-500 hover:underline"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
