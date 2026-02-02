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
      className="group block overflow-hidden border border-ivory-dark bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-ivory-dark">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width:768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-body text-sm text-warm-gray-light">
            No image
          </div>
        )}
      </div>
      <div className="p-5">
        {categoryName && (
          <span className="font-body text-[11px] font-semibold uppercase tracking-[0.15em] text-champagne">
            {categoryName}
          </span>
        )}
        <h3 className="mt-1 font-heading text-lg font-normal text-charcoal">{name}</h3>
        <p className="mt-1 font-body text-sm text-warm-gray">{priceLabel}</p>
      </div>
    </Link>
  );
}
