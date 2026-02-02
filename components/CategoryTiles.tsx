import Link from "next/link";

const categories = [
  {
    name: "Chairs",
    image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&q=80",
    href: "/products?category=chairs",
  },
  {
    name: "Tables",
    image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&q=80",
    href: "/products?category=tables",
  },
  {
    name: "Linens",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
    href: "/products?category=linens",
  },
  {
    name: "Arches",
    image: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=600&q=80",
    href: "/products?category=arches",
  },
  {
    name: "Tabletop",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80",
    href: "/products?category=tabletop",
  },
];

export default function CategoryTiles() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="mb-12 text-center">
        <p className="mb-2 font-body text-sm uppercase tracking-[0.2em] text-champagne">
          Our Collection
        </p>
        <h2 className="text-4xl font-light text-charcoal sm:text-5xl">
          Browse by Category
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {categories.map((cat) => (
          <Link
            key={cat.name}
            href={cat.href}
            className="group relative aspect-[3/4] overflow-hidden"
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
              style={{ backgroundImage: `url('${cat.image}')` }}
            />
            <div className="absolute inset-0 bg-charcoal/30 transition-colors duration-300 group-hover:bg-charcoal/50" />
            <div className="absolute inset-0 flex items-end p-5">
              <h3 className="font-body text-sm font-semibold uppercase tracking-wider text-white">
                {cat.name}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
