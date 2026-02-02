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
        <h1 className="text-4xl font-bold sm:text-5xl">
          Rent Everything for Your Event
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-indigo-100">
          Tables, chairs, tents, lighting, audio &mdash; browse our catalog,
          pick your dates, and book online in minutes.
        </p>
        <Link
          href="/products"
          className="mt-8 inline-block rounded-lg bg-white px-8 py-3 font-semibold text-indigo-700 transition hover:bg-indigo-50"
        >
          Browse Products
        </Link>
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
