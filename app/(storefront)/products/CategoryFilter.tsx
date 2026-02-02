"use client";

import Link from "next/link";

interface CategoryFilterProps {
  categories: { id: string; name: string; slug: string }[];
  activeSlug: string | null;
}

export default function CategoryFilter({ categories, activeSlug }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href="/products"
        className={`rounded-full border px-5 py-2 font-body text-sm font-medium transition-all ${
          !activeSlug
            ? "border-champagne bg-champagne text-white"
            : "border-ivory-dark bg-white text-charcoal-light hover:border-champagne hover:text-champagne"
        }`}
      >
        All
      </Link>
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/products?category=${cat.slug}`}
          className={`rounded-full border px-5 py-2 font-body text-sm font-medium transition-all ${
            activeSlug === cat.slug
              ? "border-champagne bg-champagne text-white"
              : "border-ivory-dark bg-white text-charcoal-light hover:border-champagne hover:text-champagne"
          }`}
        >
          {cat.name}
        </Link>
      ))}
    </div>
  );
}
