"use client";

import { useState } from "react";
import { formatCents } from "@/lib/utils";
import Link from "next/link";

// ─── Mock data ────────────────────────────────────────────────
const MOCK_PRODUCTS = [
  { id: "p1", name: "20x40 White Tent", slug: "20x40-tent", category: "Tents & Canopies", pricing_model: "per_day", base_price_cents: 45000, total_qty: 8, active: true },
  { id: "p2", name: "Round Table (60\")", slug: "round-table-60", category: "Tables & Chairs", pricing_model: "per_day", base_price_cents: 1500, total_qty: 50, active: true },
  { id: "p3", name: "Chiavari Chair (Gold)", slug: "chiavari-gold", category: "Tables & Chairs", pricing_model: "per_day", base_price_cents: 800, total_qty: 200, active: true },
  { id: "p4", name: "String Light Set (100ft)", slug: "string-lights", category: "Lighting", pricing_model: "flat", base_price_cents: 7500, total_qty: 20, active: true },
  { id: "p5", name: "PA System w/ 2 Speakers", slug: "pa-system", category: "Audio & Visual", pricing_model: "per_day", base_price_cents: 25000, total_qty: 5, active: true },
  { id: "p6", name: "LED Uplighting (Set of 10)", slug: "led-uplight", category: "Lighting", pricing_model: "flat", base_price_cents: 15000, total_qty: 10, active: false },
];

const MOCK_ORDERS = [
  { id: "ord-a1b2c3d4", customer: "sarah@example.com", status: "paid", event_date_start: "2026-03-15", event_date_end: "2026-03-16", total_cents: 127800, items_count: 3 },
  { id: "ord-e5f6g7h8", customer: "mike@example.com", status: "scheduled", event_date_start: "2026-03-20", event_date_end: "2026-03-22", total_cents: 235000, items_count: 5 },
  { id: "ord-i9j0k1l2", customer: "jess@example.com", status: "completed", event_date_start: "2026-02-01", event_date_end: "2026-02-02", total_cents: 52500, items_count: 2 },
  { id: "ord-m3n4o5p6", customer: "tom@example.com", status: "pending_payment", event_date_start: "2026-04-10", event_date_end: "2026-04-12", total_cents: 89000, items_count: 4 },
  { id: "ord-q7r8s9t0", customer: "anna@example.com", status: "cancelled", event_date_start: "2026-03-01", event_date_end: "2026-03-01", total_cents: 32500, items_count: 1 },
];

type AdminTab = "dashboard" | "products" | "orders" | "calendar";

const statusColors: Record<string, string> = {
  pending_payment: "bg-yellow-100 text-yellow-700",
  paid: "bg-green-100 text-green-700",
  scheduled: "bg-blue-100 text-blue-700",
  out_for_delivery: "bg-purple-100 text-purple-700",
  completed: "bg-gray-100 text-gray-700",
  cancelled: "bg-red-100 text-red-700",
};

const calendarStatusColors: Record<string, string> = {
  paid: "bg-green-400",
  scheduled: "bg-blue-400",
  completed: "bg-gray-400",
};

export default function AdminDemoPage() {
  const [tab, setTab] = useState<AdminTab>("dashboard");
  const [selectedOrder, setSelectedOrder] = useState<typeof MOCK_ORDERS[0] | null>(null);
  const [editingProduct, setEditingProduct] = useState<typeof MOCK_PRODUCTS[0] | null>(null);

  const tabs: { key: AdminTab; label: string }[] = [
    { key: "dashboard", label: "Dashboard" },
    { key: "products", label: "Products" },
    { key: "orders", label: "Orders" },
    { key: "calendar", label: "Calendar" },
  ];

  const paidOrders = MOCK_ORDERS.filter((o) => o.status !== "cancelled" && o.status !== "pending_payment");
  const totalRevenue = paidOrders.reduce((s, o) => s + o.total_cents, 0);

  // Calendar: generate March 2026
  const daysInMarch = 31;
  const marchStartDay = 6; // March 1, 2026 = Sunday → pad 6 cells (Mon-based)
  const calendarDays = Array.from({ length: daysInMarch }, (_, i) => i + 1);

  const getOrdersForDay = (day: number) => {
    return MOCK_ORDERS.filter((o) => {
      if (o.status === "cancelled" || o.status === "pending_payment") return false;
      const start = parseInt(o.event_date_start.split("-")[2]);
      const end = parseInt(o.event_date_end.split("-")[2]);
      const month = o.event_date_start.split("-")[1];
      return month === "03" && day >= start && day <= end;
    });
  };

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <div className="mb-6 rounded-xl bg-gradient-to-r from-gray-800 to-gray-900 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Admin Panel Demo</h1>
            <p className="mt-1 text-gray-300">Explore the admin dashboard with mock data.</p>
          </div>
          <Link href="/demo" className="rounded-lg border border-gray-600 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">
            Customer Demo
          </Link>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-48 shrink-0">
          <nav className="space-y-1 rounded-xl border bg-white p-3">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => { setTab(t.key); setSelectedOrder(null); setEditingProduct(null); }}
                className={`block w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                  tab === t.key ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 rounded-xl border bg-white p-6">
          {/* ── DASHBOARD ────────────────────────────────────── */}
          {tab === "dashboard" && (
            <div>
              <h2 className="mb-4 text-xl font-bold">Dashboard</h2>
              <div className="mb-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-gray-500">Products</p>
                  <p className="mt-1 text-3xl font-bold">{MOCK_PRODUCTS.length}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-gray-500">Total Orders</p>
                  <p className="mt-1 text-3xl font-bold">{MOCK_ORDERS.length}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-gray-500">Revenue</p>
                  <p className="mt-1 text-3xl font-bold">{formatCents(totalRevenue)}</p>
                </div>
              </div>

              <h3 className="mb-3 font-semibold">Recent Orders</h3>
              <div className="overflow-x-auto rounded-lg border">
                <table className="min-w-full divide-y">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-gray-600">Order</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-gray-600">Customer</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-gray-600">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-gray-600">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {MOCK_ORDERS.slice(0, 3).map((o) => (
                      <tr key={o.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 font-mono text-sm">{o.id.slice(4, 12)}</td>
                        <td className="px-4 py-2 text-sm">{o.customer}</td>
                        <td className="px-4 py-2">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[o.status]}`}>{o.status}</span>
                        </td>
                        <td className="px-4 py-2 text-sm font-medium">{formatCents(o.total_cents)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── PRODUCTS ─────────────────────────────────────── */}
          {tab === "products" && !editingProduct && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">Products</h2>
                <button
                  onClick={() => setEditingProduct({ id: "new", name: "", slug: "", category: "", pricing_model: "per_day", base_price_cents: 0, total_qty: 0, active: true })}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  + Add Product
                </button>
              </div>
              <div className="overflow-x-auto rounded-lg border">
                <table className="min-w-full divide-y">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-gray-600">Name</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-gray-600">Category</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-gray-600">Price</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-gray-600">Qty</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-gray-600">Active</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {MOCK_PRODUCTS.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm font-medium">{p.name}</td>
                        <td className="px-4 py-2 text-sm text-gray-500">{p.category}</td>
                        <td className="px-4 py-2 text-sm">{formatCents(p.base_price_cents)}</td>
                        <td className="px-4 py-2 text-sm">{p.total_qty}</td>
                        <td className="px-4 py-2">
                          <span className={`inline-block h-2.5 w-2.5 rounded-full ${p.active ? "bg-green-500" : "bg-gray-300"}`} />
                        </td>
                        <td className="px-4 py-2">
                          <button onClick={() => setEditingProduct(p)} className="text-sm text-indigo-600 hover:underline">Edit</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── PRODUCT EDIT MODAL ──────────────────────────── */}
          {tab === "products" && editingProduct && (
            <div>
              <button onClick={() => setEditingProduct(null)} className="mb-4 text-sm text-indigo-600 hover:underline">&larr; Back to Products</button>
              <h2 className="mb-4 text-xl font-bold">{editingProduct.id === "new" ? "Add Product" : "Edit Product"}</h2>
              <div className="max-w-lg space-y-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Product Name</label>
                  <input value={editingProduct.name} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="e.g., 20x40 White Tent" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Price (cents)</label>
                    <input type="number" value={editingProduct.base_price_cents} onChange={(e) => setEditingProduct({ ...editingProduct, base_price_cents: Number(e.target.value) })} className="w-full rounded-lg border px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Total Quantity</label>
                    <input type="number" value={editingProduct.total_qty} onChange={(e) => setEditingProduct({ ...editingProduct, total_qty: Number(e.target.value) })} className="w-full rounded-lg border px-3 py-2 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Pricing Model</label>
                  <select value={editingProduct.pricing_model} onChange={(e) => setEditingProduct({ ...editingProduct, pricing_model: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm">
                    <option value="per_day">Per Day</option>
                    <option value="flat">Flat Rate</option>
                    <option value="weekend">Weekend</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Upload Image</label>
                  <div className="flex h-24 items-center justify-center rounded-lg border-2 border-dashed text-sm text-gray-400">
                    Click or drag to upload (demo)
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={editingProduct.active} onChange={(e) => setEditingProduct({ ...editingProduct, active: e.target.checked })} className="rounded" />
                  Active
                </label>
                <div className="flex gap-3">
                  <button onClick={() => setEditingProduct(null)} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                    {editingProduct.id === "new" ? "Create Product" : "Save Changes"}
                  </button>
                  <button onClick={() => setEditingProduct(null)} className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── ORDERS ───────────────────────────────────────── */}
          {tab === "orders" && (
            <div className="flex gap-6">
              <div className="flex-1">
                <h2 className="mb-4 text-xl font-bold">Orders</h2>
                <div className="overflow-x-auto rounded-lg border">
                  <table className="min-w-full divide-y">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-gray-600">Order</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-gray-600">Customer</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-gray-600">Status</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-gray-600">Dates</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-gray-600">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {MOCK_ORDERS.map((o) => (
                        <tr
                          key={o.id}
                          onClick={() => setSelectedOrder(o)}
                          className={`cursor-pointer hover:bg-gray-50 ${selectedOrder?.id === o.id ? "bg-indigo-50" : ""}`}
                        >
                          <td className="px-4 py-2 font-mono text-sm">{o.id.slice(4, 12)}</td>
                          <td className="px-4 py-2 text-sm">{o.customer}</td>
                          <td className="px-4 py-2">
                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[o.status]}`}>
                              {o.status.replace(/_/g, " ")}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-sm">{o.event_date_start}</td>
                          <td className="px-4 py-2 text-sm font-medium">{formatCents(o.total_cents)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {selectedOrder && (
                <div className="w-72 shrink-0 rounded-lg border p-4">
                  <h3 className="mb-3 font-bold">Order Detail</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-500">ID:</span> <span className="font-mono">{selectedOrder.id}</span></p>
                    <p><span className="text-gray-500">Customer:</span> {selectedOrder.customer}</p>
                    <p><span className="text-gray-500">Status:</span>{" "}
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[selectedOrder.status]}`}>
                        {selectedOrder.status}
                      </span>
                    </p>
                    <p><span className="text-gray-500">Dates:</span> {selectedOrder.event_date_start} &rarr; {selectedOrder.event_date_end}</p>
                    <p><span className="text-gray-500">Items:</span> {selectedOrder.items_count} item(s)</p>
                    <p><span className="text-gray-500">Total:</span> <span className="font-semibold">{formatCents(selectedOrder.total_cents)}</span></p>

                    <hr />
                    <p className="text-xs font-semibold uppercase text-gray-500">Update Status</p>
                    <div className="flex flex-wrap gap-1">
                      {["paid", "scheduled", "out_for_delivery", "completed", "cancelled"].map((s) => (
                        <button
                          key={s}
                          className={`rounded border px-2 py-1 text-xs hover:bg-gray-50 ${selectedOrder.status === s ? "border-indigo-500 bg-indigo-50" : ""}`}
                          onClick={() => setSelectedOrder({ ...selectedOrder, status: s })}
                        >
                          {s.replace(/_/g, " ")}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => setSelectedOrder(null)} className="mt-3 text-xs text-gray-500 hover:underline">Close</button>
                </div>
              )}
            </div>
          )}

          {/* ── CALENDAR ─────────────────────────────────────── */}
          {tab === "calendar" && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">Calendar</h2>
                <span className="text-lg font-semibold text-gray-700">March 2026</span>
              </div>

              <div className="grid grid-cols-7 gap-px rounded-t-lg bg-gray-200">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                  <div key={d} className="bg-gray-50 px-2 py-2 text-center text-xs font-semibold uppercase text-gray-600">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-px bg-gray-200">
                {Array.from({ length: marchStartDay }).map((_, i) => (
                  <div key={`pad-${i}`} className="min-h-[80px] bg-gray-50" />
                ))}
                {calendarDays.map((day) => {
                  const dayOrders = getOrdersForDay(day);
                  const isToday = day === 2;
                  return (
                    <div key={day} className={`min-h-[80px] bg-white p-1.5 ${isToday ? "ring-2 ring-inset ring-indigo-500" : ""}`}>
                      <span className={`text-xs font-medium ${isToday ? "text-indigo-600" : "text-gray-700"}`}>{day}</span>
                      {dayOrders.map((o) => (
                        <div
                          key={o.id}
                          className={`mt-0.5 rounded px-1 py-0.5 text-xs text-white ${calendarStatusColors[o.status] || "bg-gray-400"}`}
                          title={`${o.customer} – ${o.status}`}
                        >
                          {o.customer.split("@")[0]}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 flex gap-4 text-xs">
                {Object.entries(calendarStatusColors).map(([status, color]) => (
                  <div key={status} className="flex items-center gap-1.5">
                    <span className={`h-3 w-3 rounded ${color}`} />
                    <span className="text-gray-600">{status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
