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
      <h1 className="mb-6 text-3xl font-bold">All Products</h1>

      <CategoryFilter
        categories={categories || []}
        activeSlug={category || null}
      />

      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
        <p className="py-12 text-center text-gray-500">No products found.</p>
      )}
    </div>
  );
}
