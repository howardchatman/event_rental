"use client";

import { useState } from "react";
import Image from "next/image";
import { formatCents } from "@/lib/utils";

// ─── Mock data ────────────────────────────────────────────────
const MOCK_CATEGORIES = [
  { id: "1", name: "All", slug: "" },
  { id: "2", name: "Tents & Canopies", slug: "tents" },
  { id: "3", name: "Tables & Chairs", slug: "tables" },
  { id: "4", name: "Lighting", slug: "lighting" },
  { id: "5", name: "Audio & Visual", slug: "av" },
];

const MOCK_PRODUCTS = [
  { id: "p1", name: "20x40 White Tent", slug: "20x40-tent", basePriceCents: 45000, pricingModel: "per_day" as const, category: "tents", totalQty: 8, image: null, description: "Elegant white frame tent, perfect for outdoor receptions. Seats up to 80 guests." },
  { id: "p2", name: "Round Table (60\")", slug: "round-table-60", basePriceCents: 1500, pricingModel: "per_day" as const, category: "tables", totalQty: 50, image: null, description: "60-inch round banquet table. Seats 8-10 guests comfortably." },
  { id: "p3", name: "Chiavari Chair (Gold)", slug: "chiavari-gold", basePriceCents: 800, pricingModel: "per_day" as const, category: "tables", totalQty: 200, image: null, description: "Elegant gold chiavari chair with ivory cushion." },
  { id: "p4", name: "String Light Set (100ft)", slug: "string-lights-100", basePriceCents: 7500, pricingModel: "flat" as const, category: "lighting", totalQty: 20, image: null, description: "Warm white Edison-style string lights. 100ft strand with 50 bulbs." },
  { id: "p5", name: "PA System w/ 2 Speakers", slug: "pa-system", basePriceCents: 25000, pricingModel: "per_day" as const, category: "av", totalQty: 5, image: null, description: "Professional PA system with two 15\" powered speakers, mixer, and wireless mic." },
  { id: "p6", name: "LED Uplighting (Set of 10)", slug: "led-uplighting", basePriceCents: 15000, pricingModel: "flat" as const, category: "lighting", totalQty: 10, image: null, description: "Wireless LED uplights with 16 color options. Remote control included." },
];

const MOCK_ORDERS = [
  {
    id: "ord-a1b2c3d4",
    status: "paid",
    event_date_start: "2026-03-15",
    event_date_end: "2026-03-16",
    total_cents: 78500,
    items: [
      { name: "20x40 White Tent", qty: 1, line_total: 45000 },
      { name: "Round Table (60\")", qty: 8, line_total: 12000 },
      { name: "Chiavari Chair (Gold)", qty: 64, line_total: 21500 },
    ],
  },
  {
    id: "ord-e5f6g7h8",
    status: "completed",
    event_date_start: "2026-02-01",
    event_date_end: "2026-02-01",
    total_cents: 32500,
    items: [
      { name: "PA System w/ 2 Speakers", qty: 1, line_total: 25000 },
      { name: "String Light Set (100ft)", qty: 1, line_total: 7500 },
    ],
  },
];

// ─── Step types ───────────────────────────────────────────────
type DemoStep =
  | "browse"
  | "product-detail"
  | "cart"
  | "checkout"
  | "payment"
  | "confirmation"
  | "account";

// ─── Component ────────────────────────────────────────────────
export default function CustomerDemoPage() {
  const [step, setStep] = useState<DemoStep>("browse");
  const [selectedProduct, setSelectedProduct] = useState(MOCK_PRODUCTS[0]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [qty, setQty] = useState(1);
  const [startDate, setStartDate] = useState("2026-03-15");
  const [endDate, setEndDate] = useState("2026-03-16");
  const [cartItems, setCartItems] = useState<Array<{ product: typeof MOCK_PRODUCTS[0]; qty: number }>>([]);

  const filteredProducts = selectedCategory
    ? MOCK_PRODUCTS.filter((p) => p.category === selectedCategory)
    : MOCK_PRODUCTS;

  const handleAddToCart = () => {
    setCartItems([...cartItems, { product: selectedProduct, qty }]);
    setStep("cart");
  };

  const subtotal = cartItems.reduce((sum, item) => {
    const days = 2;
    const lineTotal = item.product.pricingModel === "flat"
      ? item.product.basePriceCents * item.qty
      : item.product.basePriceCents * item.qty * days;
    return sum + lineTotal;
  }, 0);
  const tax = Math.round(subtotal * 0.08);
  const total = subtotal + tax;

  const steps: { key: DemoStep; label: string }[] = [
    { key: "browse", label: "Browse" },
    { key: "product-detail", label: "Product" },
    { key: "cart", label: "Cart" },
    { key: "checkout", label: "Checkout" },
    { key: "payment", label: "Payment" },
    { key: "confirmation", label: "Confirmed" },
    { key: "account", label: "My Orders" },
  ];

  const currentIndex = steps.findIndex((s) => s.key === step);

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="mb-6 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
        <p className="mb-1 text-sm font-medium text-indigo-200">Built for Lolita Harris</p>
        <h1 className="text-2xl font-bold">See How Your Customers Will Book</h1>
        <p className="mt-1 text-indigo-100">
          Click through the full customer journey &mdash; this is what your clients experience when they rent from you online. No phone calls, no back-and-forth. They browse, pick dates, and pay &mdash; while you focus on growing your business.
        </p>
      </div>

      {/* Step indicator */}
      <div className="mb-6 flex items-center gap-1 overflow-x-auto rounded-xl border bg-white p-3">
        {steps.map((s, i) => (
          <button
            key={s.key}
            onClick={() => setStep(s.key)}
            className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition ${
              s.key === step
                ? "bg-indigo-600 text-white"
                : i < currentIndex
                  ? "bg-green-50 text-green-700"
                  : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
              s.key === step
                ? "bg-white text-indigo-600"
                : i < currentIndex
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-500"
            }`}>
              {i < currentIndex ? "✓" : i + 1}
            </span>
            {s.label}
          </button>
        ))}
      </div>

      {/* Step content */}
      <div className="rounded-xl border bg-white p-6">
        {/* ── BROWSE ─────────────────────────────────────────── */}
        {step === "browse" && (
          <div>
            <h2 className="mb-4 text-xl font-bold">Browse Products</h2>
            {/* Category filter */}
            <div className="mb-4 flex flex-wrap gap-2">
              {MOCK_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                    selectedCategory === cat.slug
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
            {/* Product grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { setSelectedProduct(p); setStep("product-detail"); }}
                  className="rounded-xl border p-4 text-left transition hover:border-indigo-300 hover:shadow-md"
                >
                  <div className="mb-3 flex h-32 items-center justify-center rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 text-3xl">
                    {p.category === "tents" ? "⛺" : p.category === "tables" ? "🪑" : p.category === "lighting" ? "💡" : "🎵"}
                  </div>
                  <h3 className="font-semibold">{p.name}</h3>
                  <p className="text-sm text-gray-500">
                    {p.pricingModel === "flat"
                      ? formatCents(p.basePriceCents)
                      : `${formatCents(p.basePriceCents)}/day`}
                  </p>
                  <p className="mt-1 text-xs text-green-600">{p.totalQty} available</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── PRODUCT DETAIL ─────────────────────────────────── */}
        {step === "product-detail" && (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex items-center justify-center rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 p-12 text-6xl">
              {selectedProduct.category === "tents" ? "⛺" : selectedProduct.category === "tables" ? "🪑" : selectedProduct.category === "lighting" ? "💡" : "🎵"}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{selectedProduct.name}</h2>
              <p className="mt-1 text-xl font-semibold text-gray-700">
                {selectedProduct.pricingModel === "flat"
                  ? formatCents(selectedProduct.basePriceCents)
                  : `${formatCents(selectedProduct.basePriceCents)}/day`}
              </p>
              <p className="mt-3 text-gray-600">{selectedProduct.description}</p>

              <div className="mt-5 space-y-4 rounded-lg border p-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Rental Dates</label>
                  <div className="flex gap-3">
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="flex-1 rounded-lg border px-3 py-2 text-sm" />
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="flex-1 rounded-lg border px-3 py-2 text-sm" />
                  </div>
                </div>
                <p className="text-sm font-medium text-green-600">
                  {selectedProduct.totalQty} available for selected dates
                </p>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Quantity</label>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setQty(Math.max(1, qty - 1))} className="flex h-9 w-9 items-center justify-center rounded-lg border text-lg hover:bg-gray-50">&minus;</button>
                    <span className="w-10 text-center text-lg font-semibold">{qty}</span>
                    <button onClick={() => setQty(qty + 1)} className="flex h-9 w-9 items-center justify-center rounded-lg border text-lg hover:bg-gray-50">+</button>
                  </div>
                </div>
                <button
                  onClick={handleAddToCart}
                  className="w-full rounded-lg bg-indigo-600 py-3 font-semibold text-white hover:bg-indigo-700"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── CART ───────────────────────────────────────────── */}
        {step === "cart" && (
          <div>
            <h2 className="mb-4 text-xl font-bold">Your Cart</h2>
            <div className="mb-4 rounded-lg bg-indigo-50 px-4 py-2 text-sm text-indigo-700">
              {startDate} &rarr; {endDate} (2 days)
            </div>
            {cartItems.length === 0 ? (
              <p className="py-8 text-center text-gray-500">Cart is empty. Go back to browse products.</p>
            ) : (
              <>
                <div className="space-y-3">
                  {cartItems.map((item, i) => {
                    const days = 2;
                    const lineTotal = item.product.pricingModel === "flat"
                      ? item.product.basePriceCents * item.qty
                      : item.product.basePriceCents * item.qty * days;
                    return (
                      <div key={i} className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                          <p className="font-medium">{item.product.name}</p>
                          <p className="text-sm text-gray-500">
                            {formatCents(item.product.basePriceCents)} &times; {item.qty}
                            {item.product.pricingModel !== "flat" && ` &times; 2 days`}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-semibold">{formatCents(lineTotal)}</span>
                          <button
                            onClick={() => setCartItems(cartItems.filter((_, j) => j !== i))}
                            className="text-red-400 hover:text-red-600"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 space-y-2 rounded-lg border p-4 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatCents(subtotal)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Tax (8%)</span><span>{formatCents(tax)}</span></div>
                  <hr />
                  <div className="flex justify-between text-lg font-bold"><span>Total</span><span>{formatCents(total)}</span></div>
                </div>

                <button
                  onClick={() => setStep("checkout")}
                  className="mt-4 w-full rounded-lg bg-indigo-600 py-3 font-semibold text-white hover:bg-indigo-700"
                >
                  Proceed to Checkout
                </button>
              </>
            )}
          </div>
        )}

        {/* ── CHECKOUT ──────────────────────────────────────── */}
        {step === "checkout" && (
          <div className="mx-auto max-w-md">
            <h2 className="mb-4 text-xl font-bold">Checkout</h2>
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <h3 className="mb-2 text-sm font-semibold text-gray-500">Order Summary</h3>
                {cartItems.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span>{item.product.name} &times; {item.qty}</span>
                  </div>
                ))}
                <hr className="my-2" />
                <div className="flex justify-between font-bold"><span>Total</span><span>{formatCents(total)}</span></div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                <input value="demo@example.com" readOnly className="w-full rounded-lg border bg-gray-50 px-3 py-2 text-sm" />
              </div>

              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-gray-300 text-indigo-600" />
                <span className="text-sm">Delivery required (+$75.00)</span>
              </label>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Delivery Address</label>
                <input value="123 Demo Street, Anytown, ST 12345" readOnly className="w-full rounded-lg border bg-gray-50 px-3 py-2 text-sm" />
              </div>

              <button
                onClick={() => setStep("payment")}
                className="w-full rounded-lg bg-indigo-600 py-3 font-semibold text-white hover:bg-indigo-700"
              >
                Continue to Payment
              </button>
            </div>
          </div>
        )}

        {/* ── PAYMENT (fake Stripe) ─────────────────────────── */}
        {step === "payment" && (
          <div className="mx-auto max-w-md">
            <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50 p-6">
              <div className="mb-4 flex items-center gap-2">
                <div className="rounded bg-indigo-600 px-2 py-1 text-xs font-bold text-white">stripe</div>
                <span className="text-sm text-gray-500">Test Mode</span>
              </div>
              <h2 className="mb-4 text-lg font-bold">Pay {formatCents(total)}</h2>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Card number</label>
                  <input value="4242 4242 4242 4242" readOnly className="w-full rounded border bg-white px-3 py-2 font-mono text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">Expiry</label>
                    <input value="12/28" readOnly className="w-full rounded border bg-white px-3 py-2 font-mono text-sm" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">CVC</label>
                    <input value="123" readOnly className="w-full rounded border bg-white px-3 py-2 font-mono text-sm" />
                  </div>
                </div>
                <button
                  onClick={() => setStep("confirmation")}
                  className="w-full rounded-lg bg-indigo-600 py-3 font-semibold text-white hover:bg-indigo-700"
                >
                  Pay Now
                </button>
              </div>
            </div>
            <p className="mt-3 text-center text-xs text-gray-400">
              This is a demo — no real payment is processed.
            </p>
          </div>
        )}

        {/* ── CONFIRMATION ──────────────────────────────────── */}
        {step === "confirmation" && (
          <div className="py-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold">Payment Confirmed!</h2>
            <p className="mt-2 text-gray-600">Your rental order has been placed successfully.</p>
            <div className="mx-auto mt-6 max-w-sm rounded-lg border p-4 text-left text-sm">
              <p><span className="text-gray-500">Order ID:</span> <span className="font-mono">ord-demo-1234</span></p>
              <p className="mt-1"><span className="text-gray-500">Status:</span> <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">paid</span></p>
              <p className="mt-1"><span className="text-gray-500">Event Dates:</span> {startDate} &rarr; {endDate}</p>
              <p className="mt-1"><span className="text-gray-500">Total:</span> <span className="font-semibold">{formatCents(total)}</span></p>
            </div>
            <button
              onClick={() => setStep("account")}
              className="mt-6 rounded-lg bg-indigo-600 px-6 py-2.5 font-medium text-white hover:bg-indigo-700"
            >
              View My Orders
            </button>
          </div>
        )}

        {/* ── ACCOUNT / MY ORDERS ───────────────────────────── */}
        {step === "account" && (
          <div>
            <h2 className="mb-4 text-xl font-bold">My Orders</h2>
            <div className="space-y-3">
              {MOCK_ORDERS.map((order) => (
                <div key={order.id} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-medium">#{order.id.slice(4)}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        order.status === "paid" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <span className="font-semibold">{formatCents(order.total_cents)}</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">{order.event_date_start} &rarr; {order.event_date_end}</p>
                  <div className="mt-2 space-y-1">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm text-gray-600">
                        <span>{item.name} &times; {item.qty}</span>
                        <span>{formatCents(item.line_total)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Progress tracker for paid order */}
                  {order.status === "paid" && (
                    <div className="mt-4 flex items-center gap-1">
                      {["Paid", "Scheduled", "Delivery", "Complete"].map((label, i) => (
                        <div key={label} className="flex flex-1 items-center">
                          <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                            i === 0 ? "bg-green-500 text-white" : "bg-gray-200 text-gray-400"
                          }`}>
                            {i === 0 ? "✓" : i + 1}
                          </div>
                          <span className={`ml-1 text-xs ${i === 0 ? "text-green-600" : "text-gray-400"}`}>{label}</span>
                          {i < 3 && <div className={`mx-1 h-0.5 flex-1 ${i < 0 ? "bg-green-500" : "bg-gray-200"}`} />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => { setCartItems([]); setQty(1); setStep("browse"); }}
              className="mt-6 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Restart Demo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
