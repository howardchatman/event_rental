import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/ProductCard";
import Hero from "@/components/Hero";
import CategoryTiles from "@/components/CategoryTiles";
import Packages from "@/components/Packages";
import GalleryGrid from "@/components/GalleryGrid";
import HowItWorks from "@/components/HowItWorks";
import Testimonials from "@/components/Testimonials";

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
      <Hero />

      <CategoryTiles />

      {/* Featured Rentals from DB */}
      {products && products.length > 0 && (
        <section className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-12 text-center">
              <p className="mb-2 font-body text-sm uppercase tracking-[0.2em] text-champagne">
                Just Added
              </p>
              <h2 className="text-4xl font-light text-charcoal sm:text-5xl">
                Featured Rentals
              </h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => {
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
            <div className="mt-10 text-center">
              <Link
                href="/products"
                className="inline-block border-2 border-champagne px-10 py-3 font-body text-sm font-semibold uppercase tracking-wider text-champagne transition-all duration-300 hover:bg-champagne hover:text-white"
              >
                View Full Collection
              </Link>
            </div>
          </div>
        </section>
      )}

      <Packages />

      <GalleryGrid />

      <HowItWorks />

      <Testimonials />

      {/* AI Assistant Banner */}
      <section className="bg-charcoal py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="mb-2 font-body text-sm uppercase tracking-[0.2em] text-champagne-light">
            24/7 AI Concierge
          </p>
          <h2 className="text-3xl font-light text-white sm:text-4xl">
            Need help planning your event?
          </h2>
          <p className="mx-auto mt-4 max-w-xl font-body text-sm text-white/60">
            Our AI assistant is available around the clock to answer questions
            about rentals, pricing, availability, and delivery. Chat with us
            online or call our AI voice line anytime.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <a
              href="tel:2815550199"
              className="inline-flex items-center gap-3 bg-champagne px-8 py-4 font-body text-sm font-semibold uppercase tracking-wider text-white transition-colors duration-300 hover:bg-champagne-dark"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call (281) 555-0199
            </a>
            <span className="font-body text-sm text-white/40">or use the chat bubble below</span>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-ivory py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-4xl font-light text-charcoal sm:text-5xl">
            Ready to start planning?
          </h2>
          <p className="mx-auto mt-4 max-w-xl font-body text-warm-gray">
            Browse our collection, check availability for your date, and reserve
            online. We&apos;ll handle the rest.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/products"
              className="inline-block bg-champagne px-10 py-4 font-body text-sm font-semibold uppercase tracking-wider text-white transition-colors duration-300 hover:bg-champagne-dark"
            >
              Browse Collection
            </Link>
            <Link
              href="/demo"
              className="inline-block border-2 border-charcoal/20 px-10 py-4 font-body text-sm font-semibold uppercase tracking-wider text-charcoal transition-colors duration-300 hover:border-charcoal"
            >
              See How It Works
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
