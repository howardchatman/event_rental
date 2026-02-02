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
  pending_payment: "bg-amber-50 text-amber-700",
  paid: "bg-green-50 text-green-700",
  scheduled: "bg-blue-50 text-blue-700",
  out_for_delivery: "bg-purple-50 text-purple-700",
  completed: "bg-ivory-dark text-warm-gray",
  cancelled: "bg-red-50 text-red-600",
};

const calendarStatusColors: Record<string, string> = {
  paid: "bg-green-400",
  scheduled: "bg-blue-400",
  completed: "bg-warm-gray-light",
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

  const daysInMarch = 31;
  const marchStartDay = 6;
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
    <div>
      {/* Hero strip */}
      <section className="bg-charcoal px-6 py-10 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <p className="mb-1 font-body text-sm text-champagne-light">Welcome, Lolita Harris</p>
            <h1 className="font-heading text-2xl font-light">Your Business Command Center</h1>
            <p className="mt-1 font-body text-sm text-white/50">
              Manage inventory, track orders, schedule appointments, and close leads.
            </p>
          </div>
          <Link href="/demo" className="border border-white/20 px-4 py-2 font-body text-sm text-white/60 transition-colors hover:border-white/40 hover:text-white">
            Customer Demo
          </Link>
        </div>
      </section>

      <div className="mx-auto flex max-w-6xl gap-6 px-6 py-10">
        {/* Sidebar */}
        <div className="w-48 shrink-0">
          <nav className="space-y-1 border border-ivory-dark bg-white p-3">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => { setTab(t.key); setSelectedOrder(null); setEditingProduct(null); }}
                className={`block w-full px-3 py-2.5 text-left font-body text-sm font-medium transition ${
                  tab === t.key ? "bg-champagne/10 text-champagne" : "text-charcoal-light hover:bg-ivory-dark"
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 border border-ivory-dark bg-white p-6">
          {/* ── DASHBOARD ────────────────────────────────────── */}
          {tab === "dashboard" && (
            <div>
              <h2 className="mb-5 font-heading text-2xl font-light text-charcoal">Dashboard</h2>
              <div className="mb-6 grid gap-4 sm:grid-cols-3">
                {[
                  { label: "Products", value: MOCK_PRODUCTS.length },
                  { label: "Total Orders", value: MOCK_ORDERS.length },
                  { label: "Revenue", value: formatCents(totalRevenue) },
                ].map((s) => (
                  <div key={s.label} className="border border-ivory-dark p-5">
                    <p className="font-body text-xs uppercase tracking-wider text-warm-gray">{s.label}</p>
                    <p className="mt-1 font-heading text-3xl font-light text-charcoal">{s.value}</p>
                  </div>
                ))}
              </div>

              <h3 className="mb-3 font-body text-xs font-semibold uppercase tracking-[0.15em] text-charcoal-light">Recent Orders</h3>
              <div className="overflow-x-auto border border-ivory-dark">
                <table className="min-w-full divide-y divide-ivory-dark">
                  <thead className="bg-ivory">
                    <tr>
                      <th className="px-4 py-2.5 text-left font-body text-xs font-semibold uppercase tracking-wider text-warm-gray">Order</th>
                      <th className="px-4 py-2.5 text-left font-body text-xs font-semibold uppercase tracking-wider text-warm-gray">Customer</th>
                      <th className="px-4 py-2.5 text-left font-body text-xs font-semibold uppercase tracking-wider text-warm-gray">Status</th>
                      <th className="px-4 py-2.5 text-left font-body text-xs font-semibold uppercase tracking-wider text-warm-gray">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ivory-dark">
                    {MOCK_ORDERS.slice(0, 3).map((o) => (
                      <tr key={o.id} className="hover:bg-ivory">
                        <td className="px-4 py-2.5 font-mono text-sm text-charcoal-light">{o.id.slice(4, 12)}</td>
                        <td className="px-4 py-2.5 font-body text-sm text-charcoal-light">{o.customer}</td>
                        <td className="px-4 py-2.5">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[o.status]}`}>{o.status}</span>
                        </td>
                        <td className="px-4 py-2.5 font-body text-sm font-medium text-charcoal">{formatCents(o.total_cents)}</td>
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
                <h2 className="font-heading text-2xl font-light text-charcoal">Products</h2>
                <button
                  onClick={() => setEditingProduct({ id: "new", name: "", slug: "", category: "", pricing_model: "per_day", base_price_cents: 0, total_qty: 0, active: true })}
                  className="bg-champagne px-4 py-2 font-body text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-champagne-dark"
                >
                  + Add Product
                </button>
              </div>
              <div className="overflow-x-auto border border-ivory-dark">
                <table className="min-w-full divide-y divide-ivory-dark">
                  <thead className="bg-ivory">
                    <tr>
                      <th className="px-4 py-2.5 text-left font-body text-xs font-semibold uppercase tracking-wider text-warm-gray">Name</th>
                      <th className="px-4 py-2.5 text-left font-body text-xs font-semibold uppercase tracking-wider text-warm-gray">Category</th>
                      <th className="px-4 py-2.5 text-left font-body text-xs font-semibold uppercase tracking-wider text-warm-gray">Price</th>
                      <th className="px-4 py-2.5 text-left font-body text-xs font-semibold uppercase tracking-wider text-warm-gray">Qty</th>
                      <th className="px-4 py-2.5 text-left font-body text-xs font-semibold uppercase tracking-wider text-warm-gray">Active</th>
                      <th className="px-4 py-2.5 text-left font-body text-xs font-semibold uppercase tracking-wider text-warm-gray">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ivory-dark">
                    {MOCK_PRODUCTS.map((p) => (
                      <tr key={p.id} className="hover:bg-ivory">
                        <td className="px-4 py-2.5 font-body text-sm font-medium text-charcoal">{p.name}</td>
                        <td className="px-4 py-2.5 font-body text-sm text-warm-gray">{p.category}</td>
                        <td className="px-4 py-2.5 font-body text-sm text-charcoal-light">{formatCents(p.base_price_cents)}</td>
                        <td className="px-4 py-2.5 font-body text-sm text-charcoal-light">{p.total_qty}</td>
                        <td className="px-4 py-2.5">
                          <span className={`inline-block h-2.5 w-2.5 rounded-full ${p.active ? "bg-green-500" : "bg-warm-gray-light"}`} />
                        </td>
                        <td className="px-4 py-2.5">
                          <button onClick={() => setEditingProduct(p)} className="font-body text-sm text-champagne hover:text-champagne-dark">Edit</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── PRODUCT EDIT ──────────────────────────────────── */}
          {tab === "products" && editingProduct && (
            <div>
              <button onClick={() => setEditingProduct(null)} className="mb-4 font-body text-sm text-champagne hover:text-champagne-dark">&larr; Back to Products</button>
              <h2 className="mb-5 font-heading text-2xl font-light text-charcoal">{editingProduct.id === "new" ? "Add Product" : "Edit Product"}</h2>
              <div className="max-w-lg space-y-4">
                <div>
                  <label className="mb-1 block font-body text-xs font-semibold uppercase tracking-[0.15em] text-warm-gray">Product Name</label>
                  <input value={editingProduct.name} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} className="w-full border border-ivory-dark px-4 py-2.5 font-body text-sm text-charcoal focus:border-champagne focus:outline-none" placeholder="e.g., 20x40 White Tent" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block font-body text-xs font-semibold uppercase tracking-[0.15em] text-warm-gray">Price (cents)</label>
                    <input type="number" value={editingProduct.base_price_cents} onChange={(e) => setEditingProduct({ ...editingProduct, base_price_cents: Number(e.target.value) })} className="w-full border border-ivory-dark px-4 py-2.5 font-body text-sm text-charcoal focus:border-champagne focus:outline-none" />
                  </div>
                  <div>
                    <label className="mb-1 block font-body text-xs font-semibold uppercase tracking-[0.15em] text-warm-gray">Total Quantity</label>
                    <input type="number" value={editingProduct.total_qty} onChange={(e) => setEditingProduct({ ...editingProduct, total_qty: Number(e.target.value) })} className="w-full border border-ivory-dark px-4 py-2.5 font-body text-sm text-charcoal focus:border-champagne focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block font-body text-xs font-semibold uppercase tracking-[0.15em] text-warm-gray">Pricing Model</label>
                  <select value={editingProduct.pricing_model} onChange={(e) => setEditingProduct({ ...editingProduct, pricing_model: e.target.value })} className="w-full border border-ivory-dark bg-white px-4 py-2.5 font-body text-sm text-charcoal focus:border-champagne focus:outline-none">
                    <option value="per_day">Per Day</option>
                    <option value="flat">Flat Rate</option>
                    <option value="weekend">Weekend</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block font-body text-xs font-semibold uppercase tracking-[0.15em] text-warm-gray">Upload Image</label>
                  <div className="flex h-24 items-center justify-center border-2 border-dashed border-ivory-dark font-body text-sm text-warm-gray-light">
                    Click or drag to upload (demo)
                  </div>
                </div>
                <label className="flex items-center gap-2 font-body text-sm text-charcoal">
                  <input type="checkbox" checked={editingProduct.active} onChange={(e) => setEditingProduct({ ...editingProduct, active: e.target.checked })} className="rounded accent-champagne" />
                  Active
                </label>
                <div className="flex gap-3">
                  <button onClick={() => setEditingProduct(null)} className="bg-champagne px-5 py-2.5 font-body text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-champagne-dark">
                    {editingProduct.id === "new" ? "Create Product" : "Save Changes"}
                  </button>
                  <button onClick={() => setEditingProduct(null)} className="border border-ivory-dark px-5 py-2.5 font-body text-sm text-charcoal-light transition-colors hover:border-champagne">
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
                <h2 className="mb-5 font-heading text-2xl font-light text-charcoal">Orders</h2>
                <div className="overflow-x-auto border border-ivory-dark">
                  <table className="min-w-full divide-y divide-ivory-dark">
                    <thead className="bg-ivory">
                      <tr>
                        <th className="px-4 py-2.5 text-left font-body text-xs font-semibold uppercase tracking-wider text-warm-gray">Order</th>
                        <th className="px-4 py-2.5 text-left font-body text-xs font-semibold uppercase tracking-wider text-warm-gray">Customer</th>
                        <th className="px-4 py-2.5 text-left font-body text-xs font-semibold uppercase tracking-wider text-warm-gray">Status</th>
                        <th className="px-4 py-2.5 text-left font-body text-xs font-semibold uppercase tracking-wider text-warm-gray">Dates</th>
                        <th className="px-4 py-2.5 text-left font-body text-xs font-semibold uppercase tracking-wider text-warm-gray">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ivory-dark">
                      {MOCK_ORDERS.map((o) => (
                        <tr
                          key={o.id}
                          onClick={() => setSelectedOrder(o)}
                          className={`cursor-pointer hover:bg-ivory ${selectedOrder?.id === o.id ? "bg-champagne/5" : ""}`}
                        >
                          <td className="px-4 py-2.5 font-mono text-sm text-charcoal-light">{o.id.slice(4, 12)}</td>
                          <td className="px-4 py-2.5 font-body text-sm text-charcoal-light">{o.customer}</td>
                          <td className="px-4 py-2.5">
                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[o.status]}`}>
                              {o.status.replace(/_/g, " ")}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 font-body text-sm text-charcoal-light">{o.event_date_start}</td>
                          <td className="px-4 py-2.5 font-body text-sm font-medium text-charcoal">{formatCents(o.total_cents)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {selectedOrder && (
                <div className="w-72 shrink-0 border border-ivory-dark p-5">
                  <h3 className="mb-3 font-heading text-lg font-normal text-charcoal">Order Detail</h3>
                  <div className="space-y-2 font-body text-sm">
                    <p><span className="text-warm-gray">ID:</span> <span className="font-mono text-charcoal-light">{selectedOrder.id}</span></p>
                    <p><span className="text-warm-gray">Customer:</span> <span className="text-charcoal-light">{selectedOrder.customer}</span></p>
                    <p><span className="text-warm-gray">Status:</span>{" "}
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[selectedOrder.status]}`}>
                        {selectedOrder.status}
                      </span>
                    </p>
                    <p><span className="text-warm-gray">Dates:</span> <span className="text-charcoal-light">{selectedOrder.event_date_start} &rarr; {selectedOrder.event_date_end}</span></p>
                    <p><span className="text-warm-gray">Items:</span> <span className="text-charcoal-light">{selectedOrder.items_count} item(s)</span></p>
                    <p><span className="text-warm-gray">Total:</span> <span className="font-medium text-charcoal">{formatCents(selectedOrder.total_cents)}</span></p>

                    <div className="my-3 border-t border-ivory-dark" />
                    <p className="font-body text-xs font-semibold uppercase tracking-wider text-warm-gray">Update Status</p>
                    <div className="flex flex-wrap gap-1">
                      {["paid", "scheduled", "out_for_delivery", "completed", "cancelled"].map((s) => (
                        <button
                          key={s}
                          className={`border px-2 py-1 font-body text-xs transition-colors hover:border-champagne ${selectedOrder.status === s ? "border-champagne bg-champagne/10 text-champagne" : "border-ivory-dark text-charcoal-light"}`}
                          onClick={() => setSelectedOrder({ ...selectedOrder, status: s })}
                        >
                          {s.replace(/_/g, " ")}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => setSelectedOrder(null)} className="mt-3 font-body text-xs text-warm-gray hover:text-champagne">Close</button>
                </div>
              )}
            </div>
          )}

          {/* ── CALENDAR ─────────────────────────────────────── */}
          {tab === "calendar" && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-heading text-2xl font-light text-charcoal">Calendar</h2>
                <span className="font-heading text-lg text-charcoal-light">March 2026</span>
              </div>

              <div className="grid grid-cols-7 gap-px bg-ivory-dark">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                  <div key={d} className="bg-ivory px-2 py-2 text-center font-body text-xs font-semibold uppercase tracking-wider text-warm-gray">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-px bg-ivory-dark">
                {Array.from({ length: marchStartDay }).map((_, i) => (
                  <div key={`pad-${i}`} className="min-h-[80px] bg-ivory" />
                ))}
                {calendarDays.map((day) => {
                  const dayOrders = getOrdersForDay(day);
                  const isToday = day === 2;
                  return (
                    <div key={day} className={`min-h-[80px] bg-white p-1.5 ${isToday ? "ring-2 ring-inset ring-champagne" : ""}`}>
                      <span className={`font-body text-xs font-medium ${isToday ? "text-champagne" : "text-charcoal-light"}`}>{day}</span>
                      {dayOrders.map((o) => (
                        <div
                          key={o.id}
                          className={`mt-0.5 rounded px-1 py-0.5 font-body text-xs text-white ${calendarStatusColors[o.status] || "bg-warm-gray-light"}`}
                          title={`${o.customer} \u2013 ${o.status}`}
                        >
                          {o.customer.split("@")[0]}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 flex gap-4 font-body text-xs">
                {Object.entries(calendarStatusColors).map(([status, color]) => (
                  <div key={status} className="flex items-center gap-1.5">
                    <span className={`h-3 w-3 rounded ${color}`} />
                    <span className="text-warm-gray">{status}</span>
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
