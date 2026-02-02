import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ProductDetail from "./ProductDetail";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*, product_images(id, url, sort), categories(name)")
    .eq("slug", slug)
    .eq("active", true)
    .single();

  if (!product) notFound();

  const images = (product.product_images || []).sort(
    (a: { sort: number }, b: { sort: number }) => a.sort - b.sort
  );

  return (
    <ProductDetail
      product={{
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        pricingModel: product.pricing_model,
        basePriceCents: product.base_price_cents,
        securityDepositCents: product.security_deposit_cents,
        totalQty: product.total_qty,
        categoryName: (product.categories as { name: string } | null)?.name || "",
        images: images.map((img: { id: string; url: string }) => ({
          id: img.id,
          url: img.url,
        })),
      }}
    />
  );
}
