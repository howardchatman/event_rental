import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/ProductCard";
import CategoryFilter from "./CategoryFilter";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  let query = supabase
    .from("products")
    .select("*, product_images(url, sort), categories!inner(name, slug)")
    .eq("active", true)
    .order("name");

  if (category) {
    query = query.eq("categories.slug", category);
  }

  const { data: products } = await query;

  return (
    <div>
      {/* Hero strip */}
      <section className="bg-charcoal px-6 py-14 text-center text-white">
        <p className="mb-2 font-body text-sm uppercase tracking-[0.2em] text-champagne-light">
          Lolita Harris Event Rentals
        </p>
        <h1 className="text-4xl font-light sm:text-5xl">The Collection</h1>
        <p className="mx-auto mt-3 max-w-xl font-body text-sm text-white/60">
          Elegant chairs, tables, linens, arches, and tabletop decor —
          hand-selected for celebrations that deserve every beautiful detail.
        </p>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-12">
        <CategoryFilter
          categories={categories || []}
          activeSlug={category || null}
        />

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
                categoryName={
                  (p.categories as { name: string } | null)?.name
                }
              />
            );
          })}
        </div>
        {(!products || products.length === 0) && (
          <p className="py-16 text-center font-body text-warm-gray">
            No products found. Check back soon.
          </p>
        )}
      </div>
    </div>
  );
}
