"use client";

import Image from "next/image";
import Link from "next/link";
import { formatCents } from "@/lib/utils";

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  basePriceCents: number;
  pricingModel: string;
  imageUrl?: string;
  categoryName?: string;
}

export default function ProductCard({
  name,
  slug,
  basePriceCents,
  pricingModel,
  imageUrl,
  categoryName,
}: ProductCardProps) {
  const priceLabel =
    pricingModel === "flat"
      ? formatCents(basePriceCents)
      : pricingModel === "weekend"
        ? `${formatCents(basePriceCents)}/weekend`
        : `${formatCents(basePriceCents)}/day`;

  return (
    <Link
      href={`/products/${slug}`}
      className="group block overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="relative aspect-[4/3] w-full bg-gray-100">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover transition group-hover:scale-105"
            sizes="(max-width:768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            No image
          </div>
        )}
      </div>
      <div className="p-4">
        {categoryName && (
          <span className="text-xs font-medium uppercase tracking-wider text-indigo-600">
            {categoryName}
          </span>
        )}
        <h3 className="mt-1 text-lg font-semibold text-gray-900">{name}</h3>
        <p className="mt-1 text-sm font-medium text-gray-700">{priceLabel}</p>
      </div>
    </Link>
  );
}
