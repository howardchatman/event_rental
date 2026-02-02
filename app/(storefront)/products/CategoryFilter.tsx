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
        className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
          !activeSlug
            ? "bg-indigo-600 text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
      >
        All
      </Link>
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/products?category=${cat.slug}`}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
            activeSlug === cat.slug
              ? "bg-indigo-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {cat.name}
        </Link>
      ))}
    </div>
  );
}
