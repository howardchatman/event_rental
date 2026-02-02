import Link from "next/link";

const packages = [
  {
    name: "The Intimate Gathering",
    guests: "Up to 50 guests",
    description:
      "Perfect for intimate ceremonies and garden receptions. Includes chiavari chairs, round tables, ivory linens, and centerpiece vessels.",
    price: "From $1,200",
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&q=80",
  },
  {
    name: "The Classic Celebration",
    guests: "Up to 150 guests",
    description:
      "Our most popular package. Banquet tables, gold-accented chairs, premium linens, a ceremony arch, and tabletop decor for every setting.",
    price: "From $3,500",
    image: "https://images.unsplash.com/photo-1478146059778-26028b07395a?w=600&q=80",
    featured: true,
  },
  {
    name: "The Grand Affair",
    guests: "Up to 300 guests",
    description:
      "A full-service rental suite for large-scale celebrations. Everything in Classic, plus lounge furniture, lighting, and bar setups.",
    price: "From $7,500",
    image: "https://images.unsplash.com/photo-1544078751-58fee2d8a03b?w=600&q=80",
  },
];

export default function Packages() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 text-center">
          <p className="mb-2 font-body text-sm uppercase tracking-[0.2em] text-champagne">
            Curated for You
          </p>
          <h2 className="text-4xl font-light text-charcoal sm:text-5xl">
            Popular Packages
          </h2>
          <p className="mx-auto mt-4 max-w-xl font-body text-warm-gray">
            Not sure where to start? Our most-loved packages make planning
            effortless.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {packages.map((pkg) => (
            <div
              key={pkg.name}
              className={`group relative overflow-hidden border transition-shadow duration-300 hover:shadow-xl ${
                pkg.featured
                  ? "border-champagne ring-1 ring-champagne"
                  : "border-ivory-dark"
              }`}
            >
              {pkg.featured && (
                <div className="bg-champagne py-1.5 text-center font-body text-xs font-semibold uppercase tracking-wider text-white">
                  Most Popular
                </div>
              )}
              <div className="relative h-52 overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url('${pkg.image}')` }}
                />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-light text-charcoal">
                  {pkg.name}
                </h3>
                <p className="mt-1 font-body text-sm font-medium text-champagne">
                  {pkg.guests}
                </p>
                <p className="mt-3 font-body text-sm leading-relaxed text-warm-gray">
                  {pkg.description}
                </p>
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-xl font-light text-charcoal">
                    {pkg.price}
                  </span>
                  <Link
                    href="/products"
                    className="font-body text-sm font-semibold uppercase tracking-wider text-champagne transition-colors hover:text-champagne-dark"
                  >
                    View Details &rarr;
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
