import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/ProductCard";

export default async function HomePage() {
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select("*, product_images(url, sort), categories(name)")
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(6);

  return (
    <div>
      {/* Hero */}
      <section className="mb-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 px-8 py-16 text-center text-white">
        <p className="mb-2 text-sm font-medium uppercase tracking-wider text-indigo-200">
          Built for Lolita Harris
        </p>
        <h1 className="text-4xl font-bold sm:text-5xl">
          Your Event Rental Business, Simplified
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-indigo-100">
          Customers browse your catalog, pick their dates, and book online &mdash;
          while you manage inventory, track leads, and close sales from one dashboard.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/products"
            className="inline-block rounded-lg bg-white px-8 py-3 font-semibold text-indigo-700 transition hover:bg-indigo-50"
          >
            Browse Products
          </Link>
          <Link
            href="/demo"
            className="inline-block rounded-lg border-2 border-white/40 px-8 py-3 font-semibold text-white transition hover:bg-white/10"
          >
            See Interactive Demo
          </Link>
        </div>
      </section>

      {/* Value props */}
      <section className="mb-12 grid gap-6 sm:grid-cols-3">
        <div className="rounded-xl border bg-white p-6 text-center">
          <div className="mb-3 text-3xl">📦</div>
          <h3 className="font-bold">Smart Inventory</h3>
          <p className="mt-2 text-sm text-gray-600">
            Real-time availability tracking. Customers see exactly what&apos;s available for their dates &mdash; no double bookings.
          </p>
        </div>
        <div className="rounded-xl border bg-white p-6 text-center">
          <div className="mb-3 text-3xl">💰</div>
          <h3 className="font-bold">Close More Sales</h3>
          <p className="mt-2 text-sm text-gray-600">
            Built-in lead tracker, appointment scheduling, and an AI assistant that helps you upsell and follow up.
          </p>
        </div>
        <div className="rounded-xl border bg-white p-6 text-center">
          <div className="mb-3 text-3xl">⚡</div>
          <h3 className="font-bold">24/7 Online Booking</h3>
          <p className="mt-2 text-sm text-gray-600">
            Customers book and pay while you sleep. Stripe handles payments, reservations are held automatically.
          </p>
        </div>
      </section>

      {/* Featured */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Featured Rentals</h2>
          <Link href="/products" className="text-sm font-medium text-indigo-600 hover:underline">
            View all &rarr;
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products?.map((p) => {
            const img = p.product_images?.sort(
              (a: { sort: number }, b: { sort: number }) => a.sort - b.sort
            )[0];
            return (
              <ProductCard
                key={p.id}
                id={p.id}
                name={p.name}
                slug={p.slug}
                basePriceCents={p.base_price_cents}
                pricingModel={p.pricing_model}
                imageUrl={img?.url}
                categoryName={(p.categories as { name: string } | null)?.name}
              />
            );
          })}
        </div>
        {(!products || products.length === 0) && (
          <p className="py-12 text-center text-gray-500">
            No products yet. Check back soon!
          </p>
        )}
      </section>
    </div>
  );
}
