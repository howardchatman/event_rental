"use client";

import { useState } from "react";
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

type DemoStep = "browse" | "product-detail" | "cart" | "checkout" | "payment" | "confirmation" | "account";

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
    <div>
      {/* Hero strip */}
      <section className="bg-charcoal px-6 py-12 text-center text-white">
        <p className="mb-2 font-body text-sm uppercase tracking-[0.2em] text-champagne-light">
          Built for Lolita Harris
        </p>
        <h1 className="text-3xl font-light sm:text-4xl">
          See How Your Customers Will Book
        </h1>
        <p className="mx-auto mt-3 max-w-xl font-body text-sm text-white/50">
          Click through the full customer journey — browse, pick dates, and pay.
          No phone calls, no back-and-forth.
        </p>
      </section>

      <div className="mx-auto max-w-5xl px-6 py-10">
        {/* Step indicator */}
        <div className="mb-8 flex items-center gap-1 overflow-x-auto border border-ivory-dark bg-white p-3">
          {steps.map((s, i) => (
            <button
              key={s.key}
              onClick={() => setStep(s.key)}
              className={`flex items-center gap-2 whitespace-nowrap px-3 py-2 font-body text-sm font-medium transition ${
                s.key === step
                  ? "bg-champagne text-white"
                  : i < currentIndex
                    ? "bg-green-50 text-green-700"
                    : "text-warm-gray hover:bg-ivory-dark"
              }`}
            >
              <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                s.key === step
                  ? "bg-white text-champagne"
                  : i < currentIndex
                    ? "bg-green-500 text-white"
                    : "bg-ivory-dark text-warm-gray"
              }`}>
                {i < currentIndex ? "\u2713" : i + 1}
              </span>
              {s.label}
            </button>
          ))}
        </div>

        {/* Step content */}
        <div className="border border-ivory-dark bg-white p-6">
          {/* ── BROWSE ─────────────────────────────────────────── */}
          {step === "browse" && (
            <div>
              <h2 className="mb-4 font-heading text-2xl font-light text-charcoal">Browse Collection</h2>
              <div className="mb-5 flex flex-wrap gap-2">
                {MOCK_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`rounded-full border px-5 py-2 font-body text-sm font-medium transition-all ${
                      selectedCategory === cat.slug
                        ? "border-champagne bg-champagne text-white"
                        : "border-ivory-dark text-charcoal-light hover:border-champagne hover:text-champagne"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => { setSelectedProduct(p); setStep("product-detail"); }}
                    className="border border-ivory-dark p-4 text-left transition-all hover:border-champagne/40 hover:shadow-md hover:-translate-y-0.5"
                  >
                    <div className="mb-3 flex h-32 items-center justify-center bg-ivory-dark text-3xl">
                      {p.category === "tents" ? "\u26FA" : p.category === "tables" ? "\u{1FA91}" : p.category === "lighting" ? "\u{1F4A1}" : "\u{1F3B5}"}
                    </div>
                    <h3 className="font-heading text-base font-normal text-charcoal">{p.name}</h3>
                    <p className="font-body text-sm text-warm-gray">
                      {p.pricingModel === "flat"
                        ? formatCents(p.basePriceCents)
                        : `${formatCents(p.basePriceCents)}/day`}
                    </p>
                    <p className="mt-1 font-body text-xs text-green-700">{p.totalQty} available</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── PRODUCT DETAIL ─────────────────────────────────── */}
          {step === "product-detail" && (
            <div className="grid gap-8 md:grid-cols-2">
              <div className="flex items-center justify-center bg-ivory-dark p-12 text-6xl">
                {selectedProduct.category === "tents" ? "\u26FA" : selectedProduct.category === "tables" ? "\u{1FA91}" : selectedProduct.category === "lighting" ? "\u{1F4A1}" : "\u{1F3B5}"}
              </div>
              <div>
                <h2 className="font-heading text-3xl font-light text-charcoal">{selectedProduct.name}</h2>
                <p className="mt-2 font-body text-xl text-charcoal-light">
                  {selectedProduct.pricingModel === "flat"
                    ? formatCents(selectedProduct.basePriceCents)
                    : `${formatCents(selectedProduct.basePriceCents)}/day`}
                </p>
                <p className="mt-4 font-body text-sm leading-relaxed text-warm-gray">{selectedProduct.description}</p>

                <div className="mt-6 space-y-5 border border-ivory-dark p-5">
                  <div>
                    <label className="mb-2 block font-body text-xs font-semibold uppercase tracking-[0.15em] text-charcoal-light">Rental Dates</label>
                    <div className="flex gap-3">
                      <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="flex-1 border border-ivory-dark bg-white px-4 py-2.5 font-body text-sm text-charcoal focus:border-champagne focus:outline-none" />
                      <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="flex-1 border border-ivory-dark bg-white px-4 py-2.5 font-body text-sm text-charcoal focus:border-champagne focus:outline-none" />
                    </div>
                  </div>
                  <p className="font-body text-sm font-medium text-green-700">
                    {selectedProduct.totalQty} available for selected dates
                  </p>
                  <div>
                    <label className="mb-2 block font-body text-xs font-semibold uppercase tracking-[0.15em] text-charcoal-light">Quantity</label>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setQty(Math.max(1, qty - 1))} className="flex h-9 w-9 items-center justify-center border border-ivory-dark text-lg text-charcoal-light hover:border-champagne">&minus;</button>
                      <span className="w-10 text-center font-body text-lg font-medium text-charcoal">{qty}</span>
                      <button onClick={() => setQty(qty + 1)} className="flex h-9 w-9 items-center justify-center border border-ivory-dark text-lg text-charcoal-light hover:border-champagne">+</button>
                    </div>
                  </div>
                  <button
                    onClick={handleAddToCart}
                    className="w-full bg-champagne py-3.5 font-body text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-champagne-dark"
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
              <h2 className="mb-4 font-heading text-2xl font-light text-charcoal">Your Cart</h2>
              <div className="mb-4 border border-ivory-dark bg-ivory px-4 py-2.5 font-body text-sm text-champagne">
                {startDate} &rarr; {endDate} (2 days)
              </div>
              {cartItems.length === 0 ? (
                <p className="py-12 text-center font-body text-warm-gray">Cart is empty. Go back to browse products.</p>
              ) : (
                <>
                  <div className="space-y-3">
                    {cartItems.map((item, i) => {
                      const days = 2;
                      const lineTotal = item.product.pricingModel === "flat"
                        ? item.product.basePriceCents * item.qty
                        : item.product.basePriceCents * item.qty * days;
                      return (
                        <div key={i} className="flex items-center justify-between border border-ivory-dark p-4">
                          <div>
                            <p className="font-heading text-base font-normal text-charcoal">{item.product.name}</p>
                            <p className="font-body text-sm text-warm-gray">
                              {formatCents(item.product.basePriceCents)} &times; {item.qty}
                              {item.product.pricingModel !== "flat" && ` \u00D7 2 days`}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-body font-medium text-charcoal">{formatCents(lineTotal)}</span>
                            <button
                              onClick={() => setCartItems(cartItems.filter((_, j) => j !== i))}
                              className="font-body text-xs text-warm-gray transition-colors hover:text-red-500"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-6 space-y-2 border border-ivory-dark p-5 font-body text-sm">
                    <div className="flex justify-between"><span className="text-warm-gray">Subtotal</span><span className="text-charcoal">{formatCents(subtotal)}</span></div>
                    <div className="flex justify-between"><span className="text-warm-gray">Tax (8%)</span><span className="text-charcoal">{formatCents(tax)}</span></div>
                    <div className="border-t border-ivory-dark pt-3" />
                    <div className="flex justify-between font-heading text-xl font-normal"><span>Total</span><span>{formatCents(total)}</span></div>
                  </div>

                  <button
                    onClick={() => setStep("checkout")}
                    className="mt-5 w-full bg-champagne py-3.5 font-body text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-champagne-dark"
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
              <h2 className="mb-5 font-heading text-2xl font-light text-charcoal">Checkout</h2>
              <div className="space-y-5">
                <div className="border border-ivory-dark p-5">
                  <h3 className="mb-3 font-body text-xs font-semibold uppercase tracking-[0.15em] text-warm-gray">Order Summary</h3>
                  {cartItems.map((item, i) => (
                    <div key={i} className="flex justify-between font-body text-sm text-charcoal-light">
                      <span>{item.product.name} &times; {item.qty}</span>
                    </div>
                  ))}
                  <div className="my-3 border-t border-ivory-dark" />
                  <div className="flex justify-between font-heading text-lg font-normal"><span>Total</span><span>{formatCents(total)}</span></div>
                </div>

                <div>
                  <label className="mb-1 block font-body text-xs font-medium text-warm-gray">Email</label>
                  <input value="demo@example.com" readOnly className="w-full border border-ivory-dark bg-ivory px-4 py-2.5 font-body text-sm text-charcoal" />
                </div>

                <label className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-warm-gray-light accent-champagne" />
                  <span className="font-body text-sm text-charcoal">Delivery required (+$75.00)</span>
                </label>

                <div>
                  <label className="mb-1 block font-body text-xs font-medium text-warm-gray">Delivery Address</label>
                  <input value="123 Demo Street, Anytown, ST 12345" readOnly className="w-full border border-ivory-dark bg-ivory px-4 py-2.5 font-body text-sm text-charcoal" />
                </div>

                <button
                  onClick={() => setStep("payment")}
                  className="w-full bg-champagne py-3.5 font-body text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-champagne-dark"
                >
                  Continue to Payment
                </button>
              </div>
            </div>
          )}

          {/* ── PAYMENT (fake Stripe) ─────────────────────────── */}
          {step === "payment" && (
            <div className="mx-auto max-w-md">
              <div className="border-2 border-ivory-dark bg-ivory p-6">
                <div className="mb-4 flex items-center gap-2">
                  <div className="bg-charcoal px-2 py-1 font-body text-xs font-bold text-white">stripe</div>
                  <span className="font-body text-xs text-warm-gray">Test Mode</span>
                </div>
                <h2 className="mb-5 font-heading text-xl font-light text-charcoal">Pay {formatCents(total)}</h2>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block font-body text-xs font-medium text-warm-gray">Card number</label>
                    <input value="4242 4242 4242 4242" readOnly className="w-full border border-ivory-dark bg-white px-4 py-2.5 font-mono text-sm text-charcoal" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block font-body text-xs font-medium text-warm-gray">Expiry</label>
                      <input value="12/28" readOnly className="w-full border border-ivory-dark bg-white px-4 py-2.5 font-mono text-sm text-charcoal" />
                    </div>
                    <div>
                      <label className="mb-1 block font-body text-xs font-medium text-warm-gray">CVC</label>
                      <input value="123" readOnly className="w-full border border-ivory-dark bg-white px-4 py-2.5 font-mono text-sm text-charcoal" />
                    </div>
                  </div>
                  <button
                    onClick={() => setStep("confirmation")}
                    className="w-full bg-champagne py-3.5 font-body text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-champagne-dark"
                  >
                    Pay Now
                  </button>
                </div>
              </div>
              <p className="mt-3 text-center font-body text-xs text-warm-gray-light">
                This is a demo — no real payment is processed.
              </p>
            </div>
          )}

          {/* ── CONFIRMATION ──────────────────────────────────── */}
          {step === "confirmation" && (
            <div className="py-10 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="font-heading text-3xl font-light text-charcoal">Payment Confirmed</h2>
              <p className="mt-2 font-body text-sm text-warm-gray">Your rental order has been placed successfully.</p>
              <div className="mx-auto mt-6 max-w-sm border border-ivory-dark bg-ivory p-5 text-left font-body text-sm">
                <p><span className="text-warm-gray">Order ID:</span> <span className="font-mono text-charcoal">ord-demo-1234</span></p>
                <p className="mt-2"><span className="text-warm-gray">Status:</span> <span className="ml-1 rounded bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">paid</span></p>
                <p className="mt-2"><span className="text-warm-gray">Event Dates:</span> <span className="text-charcoal">{startDate} &rarr; {endDate}</span></p>
                <p className="mt-2"><span className="text-warm-gray">Total:</span> <span className="font-medium text-charcoal">{formatCents(total)}</span></p>
              </div>
              <button
                onClick={() => setStep("account")}
                className="mt-6 bg-champagne px-8 py-3 font-body text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-champagne-dark"
              >
                View My Orders
              </button>
            </div>
          )}

          {/* ── ACCOUNT / MY ORDERS ───────────────────────────── */}
          {step === "account" && (
            <div>
              <h2 className="mb-5 font-heading text-2xl font-light text-charcoal">My Orders</h2>
              <div className="space-y-3">
                {MOCK_ORDERS.map((order) => (
                  <div key={order.id} className="border border-ivory-dark p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm text-charcoal-light">#{order.id.slice(4)}</span>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          order.status === "paid" ? "bg-green-50 text-green-700" : "bg-ivory-dark text-warm-gray"
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <span className="font-body font-medium text-charcoal">{formatCents(order.total_cents)}</span>
                    </div>
                    <p className="mt-2 font-body text-sm text-warm-gray">{order.event_date_start} &rarr; {order.event_date_end}</p>
                    <div className="mt-3 space-y-1">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between font-body text-sm text-charcoal-light">
                          <span>{item.name} &times; {item.qty}</span>
                          <span>{formatCents(item.line_total)}</span>
                        </div>
                      ))}
                    </div>

                    {order.status === "paid" && (
                      <div className="mt-5 flex items-center gap-1">
                        {["Paid", "Scheduled", "Delivery", "Complete"].map((label, i) => (
                          <div key={label} className="flex flex-1 items-center">
                            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                              i === 0 ? "bg-green-500 text-white" : "bg-ivory-dark text-warm-gray"
                            }`}>
                              {i === 0 ? "\u2713" : i + 1}
                            </div>
                            <span className={`ml-1 font-body text-xs ${i === 0 ? "text-green-700" : "text-warm-gray-light"}`}>{label}</span>
                            {i < 3 && <div className={`mx-1 h-0.5 flex-1 ${i < 1 ? "bg-green-400" : "bg-ivory-dark"}`} />}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={() => { setCartItems([]); setQty(1); setStep("browse"); }}
                className="mt-6 border border-ivory-dark px-5 py-2.5 font-body text-sm font-medium text-charcoal-light transition-colors hover:border-champagne hover:text-champagne"
              >
                Restart Demo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
