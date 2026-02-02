import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative h-[85vh] min-h-[600px] w-full overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1920&q=80')",
        }}
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal/60 via-charcoal/40 to-charcoal/70" />

      {/* Content */}
      <div className="relative flex h-full flex-col items-center justify-center px-6 text-center text-white">
        <p className="mb-4 font-body text-sm uppercase tracking-[0.3em] text-champagne-light">
          Lolita Harris Event Rentals
        </p>
        <h1 className="max-w-4xl text-5xl font-light leading-tight sm:text-6xl lg:text-7xl">
          Wedding rentals that look{" "}
          <span className="italic text-champagne-light">curated</span>, not
          rented
        </h1>
        <p className="mx-auto mt-6 max-w-2xl font-body text-lg font-light text-white/80">
          Elegant chairs, tables, linens, and decor — hand-selected for
          celebrations that deserve every beautiful detail.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/products"
            className="inline-block border-2 border-champagne bg-champagne px-10 py-4 font-body text-sm font-semibold uppercase tracking-wider text-white transition-all duration-300 hover:bg-champagne-dark hover:border-champagne-dark"
          >
            Browse Collection
          </Link>
          <Link
            href="/products"
            className="inline-block border-2 border-white/40 px-10 py-4 font-body text-sm font-semibold uppercase tracking-wider text-white transition-all duration-300 hover:border-white hover:bg-white/10"
          >
            Get a Quote
          </Link>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-ivory to-transparent" />
    </section>
  );
}
