"use client";

import { useState } from "react";
import { formatCents } from "@/lib/utils";
import Link from "next/link";

function NavIcon({ name, className }: { name: string; className?: string }) {
  const icons: Record<string, JSX.Element> = {
    dashboard: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
    products: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    ),
    orders: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
      </svg>
    ),
    calendar: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
    appointments: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    leads: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
      </svg>
    ),
    customers: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
    proposals: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    invoices: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
      </svg>
    ),
    vendors: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
      </svg>
    ),
  };

  return icons[name] || <span className={className} />;
}

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

type AdminTab = "dashboard" | "products" | "orders" | "calendar" | "appointments" | "leads" | "customers" | "proposals" | "invoices" | "vendors";

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
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);
  const [showProposalPreview, setShowProposalPreview] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<{ name: string; category: string; contact: string; email: string; phone: string; notes: string; status: string } | null>(null);
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [newVendor, setNewVendor] = useState({ name: "", category: "Florist", contact: "", email: "", phone: "", notes: "" });

  const tabs: { key: AdminTab; label: string; icon: string }[] = [
    { key: "dashboard", label: "Dashboard", icon: "dashboard" },
    { key: "products", label: "Products", icon: "products" },
    { key: "orders", label: "Orders", icon: "orders" },
    { key: "calendar", label: "Calendar", icon: "calendar" },
    { key: "appointments", label: "Appointments", icon: "appointments" },
    { key: "leads", label: "Sales Leads", icon: "leads" },
    { key: "customers", label: "Customers", icon: "customers" },
    { key: "proposals", label: "Proposals", icon: "proposals" },
    { key: "invoices", label: "Invoices", icon: "invoices" },
    { key: "vendors", label: "Vendors", icon: "vendors" },
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
                className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left font-body text-sm font-medium transition ${
                  tab === t.key ? "bg-champagne/10 text-champagne" : "text-charcoal-light hover:bg-ivory-dark"
                }`}
              >
                <NavIcon name={t.icon} className="h-4 w-4" />
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

          {/* ── APPOINTMENTS ───────────────────────────────────── */}
          {tab === "appointments" && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-heading text-2xl font-light text-charcoal">Appointments</h2>
                <button className="bg-champagne px-4 py-2 font-body text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-champagne-dark">
                  + Schedule Appointment
                </button>
              </div>
              <div className="overflow-x-auto border border-ivory-dark">
                <table className="min-w-full divide-y divide-ivory-dark">
                  <thead className="bg-ivory">
                    <tr>
                      <th className="px-4 py-2.5 text-left font-body text-xs font-semibold uppercase tracking-wider text-warm-gray">Client</th>
                      <th className="px-4 py-2.5 text-left font-body text-xs font-semibold uppercase tracking-wider text-warm-gray">Type</th>
                      <th className="px-4 py-2.5 text-left font-body text-xs font-semibold uppercase tracking-wider text-warm-gray">Date</th>
                      <th className="px-4 py-2.5 text-left font-body text-xs font-semibold uppercase tracking-wider text-warm-gray">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ivory-dark">
                    {[
                      { client: "Sarah Johnson", type: "Site Visit", date: "Mar 10, 2026", status: "confirmed" },
                      { client: "Michael Chen", type: "Consultation", date: "Mar 12, 2026", status: "scheduled" },
                      { client: "Emily Davis", type: "Delivery", date: "Mar 15, 2026", status: "scheduled" },
                    ].map((apt, i) => (
                      <tr key={i} className="hover:bg-ivory">
                        <td className="px-4 py-2.5 font-body text-sm font-medium text-charcoal">{apt.client}</td>
                        <td className="px-4 py-2.5 font-body text-sm text-charcoal-light">{apt.type}</td>
                        <td className="px-4 py-2.5 font-body text-sm text-charcoal-light">{apt.date}</td>
                        <td className="px-4 py-2.5">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${apt.status === "confirmed" ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700"}`}>
                            {apt.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── SALES LEADS ────────────────────────────────────── */}
          {tab === "leads" && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-heading text-2xl font-light text-charcoal">Sales Leads</h2>
                <button className="bg-champagne px-4 py-2 font-body text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-champagne-dark">
                  + Add Lead
                </button>
              </div>
              <div className="mb-6 grid gap-4 sm:grid-cols-3">
                <div className="border border-ivory-dark p-4">
                  <p className="font-body text-xs uppercase tracking-wider text-warm-gray">Pipeline Value</p>
                  <p className="mt-1 font-heading text-2xl font-light text-charcoal">$45,800</p>
                </div>
                <div className="border border-ivory-dark p-4">
                  <p className="font-body text-xs uppercase tracking-wider text-warm-gray">Active Leads</p>
                  <p className="mt-1 font-heading text-2xl font-light text-charcoal">12</p>
                </div>
                <div className="border border-ivory-dark p-4">
                  <p className="font-body text-xs uppercase tracking-wider text-warm-gray">Won This Month</p>
                  <p className="mt-1 font-heading text-2xl font-light text-green-600">$18,500</p>
                </div>
              </div>
              <div className="overflow-x-auto border border-ivory-dark">
                <table className="min-w-full divide-y divide-ivory-dark">
                  <thead className="bg-ivory">
                    <tr>
                      <th className="px-4 py-2.5 text-left font-body text-xs font-semibold uppercase tracking-wider text-warm-gray">Lead</th>
                      <th className="px-4 py-2.5 text-left font-body text-xs font-semibold uppercase tracking-wider text-warm-gray">Event Type</th>
                      <th className="px-4 py-2.5 text-left font-body text-xs font-semibold uppercase tracking-wider text-warm-gray">Est. Value</th>
                      <th className="px-4 py-2.5 text-left font-body text-xs font-semibold uppercase tracking-wider text-warm-gray">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ivory-dark">
                    {[
                      { name: "Jennifer Smith", event: "Wedding", value: 12500, status: "hot" },
                      { name: "Corporate Solutions Inc", event: "Corporate Event", value: 8500, status: "warm" },
                      { name: "Martinez Family", event: "Quinceañera", value: 4800, status: "new" },
                    ].map((lead, i) => (
                      <tr key={i} className="hover:bg-ivory">
                        <td className="px-4 py-2.5 font-body text-sm font-medium text-charcoal">{lead.name}</td>
                        <td className="px-4 py-2.5 font-body text-sm text-charcoal-light">{lead.event}</td>
                        <td className="px-4 py-2.5 font-body text-sm text-charcoal">{formatCents(lead.value * 100)}</td>
                        <td className="px-4 py-2.5">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            lead.status === "hot" ? "bg-red-50 text-red-700" :
                            lead.status === "warm" ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700"
                          }`}>
                            {lead.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── CUSTOMERS ──────────────────────────────────────── */}
          {tab === "customers" && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-heading text-2xl font-light text-charcoal">Customers</h2>
                <button className="bg-champagne px-4 py-2 font-body text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-champagne-dark">
                  + Add Customer
                </button>
              </div>
              <div className="mb-6 grid gap-4 sm:grid-cols-3">
                <div className="border border-ivory-dark p-4">
                  <p className="font-body text-xs uppercase tracking-wider text-warm-gray">Total Customers</p>
                  <p className="mt-1 font-heading text-2xl font-light text-charcoal">156</p>
                </div>
                <div className="border border-ivory-dark p-4">
                  <p className="font-body text-xs uppercase tracking-wider text-warm-gray">Total Revenue</p>
                  <p className="mt-1 font-heading text-2xl font-light text-charcoal">$284,500</p>
                </div>
                <div className="border border-ivory-dark p-4">
                  <p className="font-body text-xs uppercase tracking-wider text-warm-gray">Avg. Lifetime Value</p>
                  <p className="mt-1 font-heading text-2xl font-light text-charcoal">$1,824</p>
                </div>
              </div>
              <div className="overflow-x-auto border border-ivory-dark">
                <table className="min-w-full divide-y divide-ivory-dark">
                  <thead className="bg-ivory">
                    <tr>
                      <th className="px-4 py-2.5 text-left font-body text-xs font-semibold uppercase tracking-wider text-warm-gray">Customer</th>
                      <th className="px-4 py-2.5 text-left font-body text-xs font-semibold uppercase tracking-wider text-warm-gray">Email</th>
                      <th className="px-4 py-2.5 text-left font-body text-xs font-semibold uppercase tracking-wider text-warm-gray">Phone</th>
                      <th className="px-4 py-2.5 text-right font-body text-xs font-semibold uppercase tracking-wider text-warm-gray">Total Spent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ivory-dark">
                    {[
                      { name: "Sarah Johnson", email: "sarah@example.com", phone: "(281) 555-0123", spent: 12780 },
                      { name: "Michael Chen", email: "mike@example.com", phone: "(281) 555-0456", spent: 23500 },
                      { name: "Emily Davis", email: "emily@example.com", phone: "(281) 555-0789", spent: 5250 },
                    ].map((customer, i) => (
                      <tr key={i} className="hover:bg-ivory">
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-champagne/20 text-xs font-medium text-champagne">
                              {customer.name.split(" ").map(n => n[0]).join("")}
                            </div>
                            <span className="font-body text-sm font-medium text-charcoal">{customer.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 font-body text-sm text-charcoal-light">{customer.email}</td>
                        <td className="px-4 py-2.5 font-body text-sm text-charcoal-light">{customer.phone}</td>
                        <td className="px-4 py-2.5 text-right font-body text-sm font-medium text-charcoal">{formatCents(customer.spent * 100)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── PROPOSALS ──────────────────────────────────────── */}
          {tab === "proposals" && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-heading text-2xl font-light text-charcoal">Proposals</h2>
                <button className="bg-champagne px-4 py-2 font-body text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-champagne-dark">
                  + New Proposal
                </button>
              </div>
              <div className="mb-6 grid gap-4 sm:grid-cols-3">
                <div className="border border-ivory-dark p-4">
                  <p className="font-body text-xs uppercase tracking-wider text-warm-gray">Pipeline Value</p>
                  <p className="mt-1 font-heading text-2xl font-light text-charcoal">$32,400</p>
                </div>
                <div className="border border-ivory-dark p-4">
                  <p className="font-body text-xs uppercase tracking-wider text-warm-gray">Accepted Value</p>
                  <p className="mt-1 font-heading text-2xl font-light text-green-600">$18,750</p>
                </div>
                <div className="border border-ivory-dark p-4">
                  <p className="font-body text-xs uppercase tracking-wider text-warm-gray">Conversion Rate</p>
                  <p className="mt-1 font-heading text-2xl font-light text-charcoal">58%</p>
                </div>
              </div>
              <div className="overflow-x-auto border border-ivory-dark">
                <table className="min-w-full divide-y divide-ivory-dark">
                  <thead className="bg-ivory">
                    <tr>
                      <th className="px-4 py-2.5 text-left font-body text-xs font-semibold uppercase tracking-wider text-warm-gray">Proposal</th>
                      <th className="px-4 py-2.5 text-left font-body text-xs font-semibold uppercase tracking-wider text-warm-gray">Customer</th>
                      <th className="px-4 py-2.5 text-left font-body text-xs font-semibold uppercase tracking-wider text-warm-gray">Event Date</th>
                      <th className="px-4 py-2.5 text-left font-body text-xs font-semibold uppercase tracking-wider text-warm-gray">Status</th>
                      <th className="px-4 py-2.5 text-right font-body text-xs font-semibold uppercase tracking-wider text-warm-gray">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ivory-dark">
                    {[
                      { title: "Smith Wedding Reception", customer: "Sarah Smith", date: "Apr 15, 2026", status: "sent", value: 12500 },
                      { title: "Corporate Gala 2026", customer: "Acme Corp", date: "May 20, 2026", status: "accepted", value: 18750 },
                      { title: "Martinez Quinceañera", customer: "Rosa Martinez", date: "Jun 5, 2026", status: "draft", value: 6400 },
                    ].map((proposal, i) => (
                      <tr key={i} className="hover:bg-ivory">
                        <td className="px-4 py-2.5">
                          <span className="font-body text-sm font-medium text-charcoal">{proposal.title}</span>
                        </td>
                        <td className="px-4 py-2.5 font-body text-sm text-charcoal-light">{proposal.customer}</td>
                        <td className="px-4 py-2.5 font-body text-sm text-charcoal-light">{proposal.date}</td>
                        <td className="px-4 py-2.5">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            proposal.status === "accepted" ? "bg-green-50 text-green-700" :
                            proposal.status === "sent" ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-600"
                          }`}>
                            {proposal.status}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right font-body text-sm font-medium text-charcoal">{formatCents(proposal.value * 100)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── INVOICES ───────────────────────────────────────── */}
          {tab === "invoices" && !showInvoicePreview && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-heading text-2xl font-light text-charcoal">Invoices</h2>
                <button className="bg-champagne px-4 py-2 font-body text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-champagne-dark">
                  + New Invoice
                </button>
              </div>
              <div className="mb-6 grid gap-4 sm:grid-cols-3">
                <div className="border border-ivory-dark p-4">
                  <p className="font-body text-xs uppercase tracking-wider text-warm-gray">Outstanding</p>
                  <p className="mt-1 font-heading text-2xl font-light text-charcoal">$8,450</p>
                </div>
                <div className="border border-ivory-dark p-4">
                  <p className="font-body text-xs uppercase tracking-wider text-warm-gray">Overdue</p>
                  <p className="mt-1 font-heading text-2xl font-light text-red-600">$2,350</p>
                </div>
                <div className="border border-ivory-dark p-4">
                  <p className="font-body text-xs uppercase tracking-wider text-warm-gray">Paid This Month</p>
                  <p className="mt-1 font-heading text-2xl font-light text-green-600">$24,800</p>
                </div>
              </div>
              <div className="overflow-x-auto border border-ivory-dark">
                <table className="min-w-full divide-y divide-ivory-dark">
                  <thead className="bg-ivory">
                    <tr>
                      <th className="px-4 py-2.5 text-left font-body text-xs font-semibold uppercase tracking-wider text-warm-gray">Invoice</th>
                      <th className="px-4 py-2.5 text-left font-body text-xs font-semibold uppercase tracking-wider text-warm-gray">Customer</th>
                      <th className="px-4 py-2.5 text-left font-body text-xs font-semibold uppercase tracking-wider text-warm-gray">Due Date</th>
                      <th className="px-4 py-2.5 text-left font-body text-xs font-semibold uppercase tracking-wider text-warm-gray">Status</th>
                      <th className="px-4 py-2.5 text-right font-body text-xs font-semibold uppercase tracking-wider text-warm-gray">Amount</th>
                      <th className="px-4 py-2.5 text-right font-body text-xs font-semibold uppercase tracking-wider text-warm-gray">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ivory-dark">
                    {[
                      { number: "INV-202603-0012", customer: "Sarah Johnson", due: "Mar 15, 2026", status: "paid", amount: 12780 },
                      { number: "INV-202603-0013", customer: "Michael Chen", due: "Mar 20, 2026", status: "sent", amount: 23500 },
                      { number: "INV-202602-0011", customer: "Tom Williams", due: "Feb 28, 2026", status: "overdue", amount: 8900 },
                    ].map((invoice, i) => (
                      <tr key={i} className="hover:bg-ivory">
                        <td className="px-4 py-2.5 font-mono text-sm text-charcoal">{invoice.number}</td>
                        <td className="px-4 py-2.5 font-body text-sm text-charcoal-light">{invoice.customer}</td>
                        <td className="px-4 py-2.5 font-body text-sm text-charcoal-light">{invoice.due}</td>
                        <td className="px-4 py-2.5">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            invoice.status === "paid" ? "bg-green-50 text-green-700" :
                            invoice.status === "overdue" ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-700"
                          }`}>
                            {invoice.status}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right font-body text-sm font-medium text-charcoal">{formatCents(invoice.amount * 100)}</td>
                        <td className="px-4 py-2.5 text-right">
                          <button
                            onClick={() => setShowInvoicePreview(true)}
                            className="font-body text-xs font-medium text-champagne hover:text-champagne-dark"
                          >
                            View / PDF
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── INVOICE PREVIEW (PDF-style) ─────────────────────── */}
          {tab === "invoices" && showInvoicePreview && (
            <div>
              <button onClick={() => setShowInvoicePreview(false)} className="mb-4 font-body text-sm text-champagne hover:text-champagne-dark">&larr; Back to Invoices</button>

              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-heading text-2xl font-light text-charcoal">Invoice Preview</h2>
                <div className="flex gap-2">
                  <button className="flex items-center gap-2 border border-champagne px-4 py-2 font-body text-sm font-medium text-champagne transition-colors hover:bg-champagne/10">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Download PDF
                  </button>
                  <button className="flex items-center gap-2 bg-champagne px-4 py-2 font-body text-sm font-medium text-white transition-colors hover:bg-champagne-dark">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                    Email to Customer
                  </button>
                </div>
              </div>

              {/* PDF-style Invoice */}
              <div className="mx-auto max-w-2xl border border-gray-200 bg-white p-8 shadow-lg">
                {/* Header */}
                <div className="mb-8 flex items-start justify-between">
                  <div>
                    <h1 className="font-heading text-2xl text-charcoal">Lolita Harris</h1>
                    <p className="font-body text-xs uppercase tracking-[0.15em] text-champagne">Event Rentals</p>
                    <p className="mt-3 font-body text-sm text-warm-gray">123 Main Street</p>
                    <p className="font-body text-sm text-warm-gray">Houston, TX 77001</p>
                    <p className="font-body text-sm text-warm-gray">(281) 555-0199</p>
                  </div>
                  <div className="text-right">
                    <h2 className="font-heading text-3xl font-light text-charcoal">INVOICE</h2>
                    <p className="mt-2 font-mono text-sm text-charcoal">INV-202603-0012</p>
                    <p className="mt-4 font-body text-sm text-warm-gray">Issue Date: March 1, 2026</p>
                    <p className="font-body text-sm text-warm-gray">Due Date: March 15, 2026</p>
                  </div>
                </div>

                {/* Bill To */}
                <div className="mb-8 border-t border-gray-200 pt-6">
                  <p className="mb-2 font-body text-xs font-semibold uppercase tracking-[0.15em] text-warm-gray">Bill To</p>
                  <p className="font-body text-sm font-medium text-charcoal">Sarah Johnson</p>
                  <p className="font-body text-sm text-warm-gray">sarah@example.com</p>
                  <p className="font-body text-sm text-warm-gray">(281) 555-0123</p>
                </div>

                {/* Event Details */}
                <div className="mb-6 rounded bg-ivory p-4">
                  <p className="font-body text-xs font-semibold uppercase tracking-[0.15em] text-warm-gray">Event Details</p>
                  <p className="mt-1 font-body text-sm text-charcoal">Smith Wedding Reception</p>
                  <p className="font-body text-sm text-warm-gray">April 15, 2026 &bull; The Grand Ballroom, Houston</p>
                </div>

                {/* Line Items */}
                <table className="mb-6 w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="py-2 text-left font-body text-xs font-semibold uppercase tracking-[0.1em] text-warm-gray">Description</th>
                      <th className="py-2 text-center font-body text-xs font-semibold uppercase tracking-[0.1em] text-warm-gray">Qty</th>
                      <th className="py-2 text-right font-body text-xs font-semibold uppercase tracking-[0.1em] text-warm-gray">Unit Price</th>
                      <th className="py-2 text-right font-body text-xs font-semibold uppercase tracking-[0.1em] text-warm-gray">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="py-3 font-body text-sm text-charcoal">Gold Chiavari Chairs (2-day rental)</td>
                      <td className="py-3 text-center font-body text-sm text-charcoal">100</td>
                      <td className="py-3 text-right font-body text-sm text-charcoal">$8.00</td>
                      <td className="py-3 text-right font-body text-sm font-medium text-charcoal">$800.00</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-body text-sm text-charcoal">60&quot; Round Tables (2-day rental)</td>
                      <td className="py-3 text-center font-body text-sm text-charcoal">10</td>
                      <td className="py-3 text-right font-body text-sm text-charcoal">$15.00</td>
                      <td className="py-3 text-right font-body text-sm font-medium text-charcoal">$150.00</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-body text-sm text-charcoal">White Satin Tablecloths</td>
                      <td className="py-3 text-center font-body text-sm text-charcoal">10</td>
                      <td className="py-3 text-right font-body text-sm text-charcoal">$15.00</td>
                      <td className="py-3 text-right font-body text-sm font-medium text-charcoal">$150.00</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-body text-sm text-charcoal">Delivery &amp; Setup</td>
                      <td className="py-3 text-center font-body text-sm text-charcoal">1</td>
                      <td className="py-3 text-right font-body text-sm text-charcoal">$150.00</td>
                      <td className="py-3 text-right font-body text-sm font-medium text-charcoal">$150.00</td>
                    </tr>
                  </tbody>
                </table>

                {/* Totals */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-end">
                    <div className="w-64 space-y-2">
                      <div className="flex justify-between font-body text-sm">
                        <span className="text-warm-gray">Subtotal</span>
                        <span className="text-charcoal">$1,250.00</span>
                      </div>
                      <div className="flex justify-between font-body text-sm">
                        <span className="text-warm-gray">Tax (8.25%)</span>
                        <span className="text-charcoal">$103.13</span>
                      </div>
                      <div className="flex justify-between border-t border-gray-200 pt-2 font-body text-base font-semibold">
                        <span className="text-charcoal">Total Due</span>
                        <span className="text-charcoal">$1,353.13</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="mt-8 border-t border-gray-200 pt-6">
                  <p className="font-body text-xs font-semibold uppercase tracking-[0.15em] text-warm-gray">Payment Information</p>
                  <p className="mt-2 font-body text-sm text-warm-gray">Please make payment by the due date. We accept credit cards, checks, and bank transfers.</p>
                  <p className="mt-1 font-body text-sm text-warm-gray">Questions? Contact us at hello@lolitaharris.com</p>
                </div>

                {/* Footer */}
                <div className="mt-8 border-t border-gray-200 pt-4 text-center">
                  <p className="font-body text-xs text-warm-gray">Thank you for choosing Lolita Harris Event Rentals</p>
                </div>
              </div>
            </div>
          )}

          {/* ── VENDORS ────────────────────────────────────────── */}
          {tab === "vendors" && !selectedVendor && !showAddVendor && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-heading text-2xl font-light text-charcoal">Vendors</h2>
                <button
                  onClick={() => setShowAddVendor(true)}
                  className="bg-champagne px-4 py-2 font-body text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-champagne-dark"
                >
                  + Add Vendor
                </button>
              </div>
              <div className="overflow-x-auto border border-ivory-dark">
                <table className="min-w-full divide-y divide-ivory-dark">
                  <thead className="bg-ivory">
                    <tr>
                      <th className="px-4 py-2.5 text-left font-body text-xs font-semibold uppercase tracking-wider text-warm-gray">Vendor</th>
                      <th className="px-4 py-2.5 text-left font-body text-xs font-semibold uppercase tracking-wider text-warm-gray">Category</th>
                      <th className="px-4 py-2.5 text-left font-body text-xs font-semibold uppercase tracking-wider text-warm-gray">Contact</th>
                      <th className="px-4 py-2.5 text-left font-body text-xs font-semibold uppercase tracking-wider text-warm-gray">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ivory-dark">
                    {[
                      { name: "Bella Flora Designs", category: "Florist", contact: "Maria Garcia", email: "maria@bellaflora.com", phone: "(281) 555-0111", notes: "Specializes in luxury wedding arrangements. 10% discount for referrals.", status: "active" },
                      { name: "Elite Catering Co.", category: "Caterer", contact: "James Wilson", email: "james@elitecatering.com", phone: "(281) 555-0222", notes: "Full-service catering. Minimum 50 guests.", status: "active" },
                      { name: "Capture the Moment", category: "Photographer", contact: "Lisa Chen", email: "lisa@capturethemoment.com", phone: "(281) 555-0333", notes: "Award-winning wedding photographer. Book 6 months in advance.", status: "active" },
                      { name: "DJ Smooth Beats", category: "DJ", contact: "Marcus Brown", email: "marcus@smoothbeats.com", phone: "(281) 555-0444", notes: "On hiatus until June 2026.", status: "inactive" },
                    ].map((vendor, i) => (
                      <tr
                        key={i}
                        onClick={() => setSelectedVendor(vendor)}
                        className="cursor-pointer hover:bg-ivory"
                      >
                        <td className="px-4 py-2.5">
                          <span className="font-body text-sm font-medium text-charcoal">{vendor.name}</span>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            vendor.category === "Florist" ? "bg-pink-50 text-pink-700" :
                            vendor.category === "Caterer" ? "bg-orange-50 text-orange-700" :
                            vendor.category === "Photographer" ? "bg-purple-50 text-purple-700" : "bg-blue-50 text-blue-700"
                          }`}>
                            {vendor.category}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 font-body text-sm text-charcoal-light">{vendor.contact}</td>
                        <td className="px-4 py-2.5">
                          <span className={`inline-block h-2.5 w-2.5 rounded-full ${vendor.status === "active" ? "bg-green-500" : "bg-warm-gray-light"}`} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── VENDOR DETAIL VIEW ─────────────────────────────── */}
          {tab === "vendors" && selectedVendor && !showAddVendor && (
            <div>
              <button onClick={() => setSelectedVendor(null)} className="mb-4 font-body text-sm text-champagne hover:text-champagne-dark">&larr; Back to Vendors</button>

              <div className="flex gap-6">
                <div className="flex-1">
                  <div className="mb-6 flex items-start justify-between">
                    <div>
                      <h2 className="font-heading text-2xl font-light text-charcoal">{selectedVendor.name}</h2>
                      <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        selectedVendor.category === "Florist" ? "bg-pink-50 text-pink-700" :
                        selectedVendor.category === "Caterer" ? "bg-orange-50 text-orange-700" :
                        selectedVendor.category === "Photographer" ? "bg-purple-50 text-purple-700" : "bg-blue-50 text-blue-700"
                      }`}>
                        {selectedVendor.category}
                      </span>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${selectedVendor.status === "active" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                      {selectedVendor.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="space-y-4 border border-ivory-dark bg-white p-6">
                    <div>
                      <p className="font-body text-xs font-semibold uppercase tracking-[0.15em] text-warm-gray">Contact Person</p>
                      <p className="mt-1 font-body text-sm text-charcoal">{selectedVendor.contact}</p>
                    </div>
                    <div>
                      <p className="font-body text-xs font-semibold uppercase tracking-[0.15em] text-warm-gray">Email</p>
                      <a href={`mailto:${selectedVendor.email}`} className="mt-1 block font-body text-sm text-champagne hover:text-champagne-dark">{selectedVendor.email}</a>
                    </div>
                    <div>
                      <p className="font-body text-xs font-semibold uppercase tracking-[0.15em] text-warm-gray">Phone</p>
                      <a href={`tel:${selectedVendor.phone}`} className="mt-1 block font-body text-sm text-champagne hover:text-champagne-dark">{selectedVendor.phone}</a>
                    </div>
                    <div>
                      <p className="font-body text-xs font-semibold uppercase tracking-[0.15em] text-warm-gray">Notes</p>
                      <p className="mt-1 font-body text-sm text-charcoal-light">{selectedVendor.notes}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-3">
                    <button className="border border-champagne px-4 py-2 font-body text-sm font-medium text-champagne transition-colors hover:bg-champagne/10">
                      Edit Vendor
                    </button>
                    <button className="border border-red-200 px-4 py-2 font-body text-sm font-medium text-red-600 transition-colors hover:bg-red-50">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── ADD VENDOR FORM ────────────────────────────────── */}
          {tab === "vendors" && showAddVendor && (
            <div>
              <button onClick={() => { setShowAddVendor(false); setNewVendor({ name: "", category: "Florist", contact: "", email: "", phone: "", notes: "" }); }} className="mb-4 font-body text-sm text-champagne hover:text-champagne-dark">&larr; Back to Vendors</button>

              <h2 className="mb-6 font-heading text-2xl font-light text-charcoal">Add New Vendor</h2>

              <div className="max-w-lg space-y-4">
                <div>
                  <label className="mb-1 block font-body text-xs font-semibold uppercase tracking-[0.15em] text-warm-gray">Vendor Name *</label>
                  <input
                    type="text"
                    value={newVendor.name}
                    onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
                    className="w-full border border-ivory-dark px-4 py-2.5 font-body text-sm text-charcoal focus:border-champagne focus:outline-none"
                    placeholder="e.g., Bella Flora Designs"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-body text-xs font-semibold uppercase tracking-[0.15em] text-warm-gray">Category *</label>
                  <select
                    value={newVendor.category}
                    onChange={(e) => setNewVendor({ ...newVendor, category: e.target.value })}
                    className="w-full border border-ivory-dark bg-white px-4 py-2.5 font-body text-sm text-charcoal focus:border-champagne focus:outline-none"
                  >
                    <option value="Florist">Florist</option>
                    <option value="Caterer">Caterer</option>
                    <option value="Photographer">Photographer</option>
                    <option value="DJ">DJ / Entertainment</option>
                    <option value="Planner">Event Planner</option>
                    <option value="Rental Partner">Rental Partner</option>
                    <option value="Transport">Transport / Delivery</option>
                    <option value="Staffing">Staffing</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block font-body text-xs font-semibold uppercase tracking-[0.15em] text-warm-gray">Contact Person</label>
                  <input
                    type="text"
                    value={newVendor.contact}
                    onChange={(e) => setNewVendor({ ...newVendor, contact: e.target.value })}
                    className="w-full border border-ivory-dark px-4 py-2.5 font-body text-sm text-charcoal focus:border-champagne focus:outline-none"
                    placeholder="e.g., Maria Garcia"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block font-body text-xs font-semibold uppercase tracking-[0.15em] text-warm-gray">Email</label>
                    <input
                      type="email"
                      value={newVendor.email}
                      onChange={(e) => setNewVendor({ ...newVendor, email: e.target.value })}
                      className="w-full border border-ivory-dark px-4 py-2.5 font-body text-sm text-charcoal focus:border-champagne focus:outline-none"
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-body text-xs font-semibold uppercase tracking-[0.15em] text-warm-gray">Phone</label>
                    <input
                      type="tel"
                      value={newVendor.phone}
                      onChange={(e) => setNewVendor({ ...newVendor, phone: e.target.value })}
                      className="w-full border border-ivory-dark px-4 py-2.5 font-body text-sm text-charcoal focus:border-champagne focus:outline-none"
                      placeholder="(281) 555-0000"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block font-body text-xs font-semibold uppercase tracking-[0.15em] text-warm-gray">Notes</label>
                  <textarea
                    value={newVendor.notes}
                    onChange={(e) => setNewVendor({ ...newVendor, notes: e.target.value })}
                    rows={3}
                    className="w-full border border-ivory-dark px-4 py-2.5 font-body text-sm text-charcoal focus:border-champagne focus:outline-none"
                    placeholder="Any additional notes about this vendor..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => { setShowAddVendor(false); setNewVendor({ name: "", category: "Florist", contact: "", email: "", phone: "", notes: "" }); }}
                    className="bg-champagne px-5 py-2.5 font-body text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-champagne-dark"
                  >
                    Save Vendor
                  </button>
                  <button
                    onClick={() => { setShowAddVendor(false); setNewVendor({ name: "", category: "Florist", contact: "", email: "", phone: "", notes: "" }); }}
                    className="border border-ivory-dark px-5 py-2.5 font-body text-sm text-charcoal-light transition-colors hover:border-champagne"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
