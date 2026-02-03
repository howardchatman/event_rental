"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import DateRangePicker from "@/components/DateRangePicker";
import QuantitySelector from "@/components/QuantitySelector";
import { useCartStore } from "@/lib/store/cart";
import { checkAvailability } from "@/lib/availability/rpc";
import { formatCents } from "@/lib/utils";
import type { PricingModel } from "@/lib/pricing/calc";

interface ProductDetailProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    pricingModel: string;
    basePriceCents: number;
    securityDepositCents: number;
    totalQty: number;
    categoryName: string;
    images: { id: string; url: string }[];
  };
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const { dates, setDates, addItem } = useCartStore();
  const [qty, setQty] = useState(1);
  const [available, setAvailable] = useState<number | null>(null);
  const [checking, setChecking] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  const startDate = dates.startDate || "";
  const endDate = dates.endDate || "";

  useEffect(() => {
    if (!startDate || !endDate) {
      setAvailable(null);
      return;
    }
    let cancelled = false;
    setChecking(true);
    checkAvailability(product.id, startDate, endDate)
      .then((avail) => {
        if (!cancelled) setAvailable(avail);
      })
      .catch(() => {
        if (!cancelled) setAvailable(null);
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });
    return () => { cancelled = true; };
  }, [product.id, startDate, endDate]);

  const handleAddToCart = () => {
    if (!startDate || !endDate) {
      toast.error("Please select rental dates first");
      return;
    }
    if (available !== null && qty > available) {
      toast.error("Not enough availability");
      return;
    }
    addItem(
      {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        imageUrl: product.images[0]?.url || "",
        pricingModel: product.pricingModel as PricingModel,
        basePriceCents: product.basePriceCents,
        securityDepositCents: product.securityDepositCents,
      },
      qty
    );
    toast.success(`${product.name} added to cart`);
  };

  const priceLabel =
    product.pricingModel === "flat"
      ? formatCents(product.basePriceCents)
      : product.pricingModel === "weekend"
        ? `${formatCents(product.basePriceCents)}/weekend`
        : `${formatCents(product.basePriceCents)}/day`;

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="grid gap-10 lg:grid-cols-2">
        {/* Images */}
        <div>
          <div className="relative aspect-[4/3] overflow-hidden bg-ivory-dark">
            {product.images.length > 0 ? (
              <Image
                src={product.images[selectedImage]?.url}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width:1024px) 100vw, 50vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center font-body text-warm-gray">
                No image
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(i)}
                  className={`relative h-16 w-16 overflow-hidden border-2 transition-colors ${
                    i === selectedImage ? "border-champagne" : "border-transparent"
                  }`}
                >
                  <Image src={img.url} alt="" fill className="object-cover" sizes="64px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <span className="font-body text-[11px] font-semibold uppercase tracking-[0.15em] text-champagne">
            {product.categoryName}
          </span>
          <h1 className="mt-2 text-3xl font-light text-charcoal sm:text-4xl">
            {product.name}
          </h1>
          <p className="mt-2 font-body text-xl text-charcoal-light">{priceLabel}</p>

          {product.description && (
            <p className="mt-5 font-body text-sm leading-relaxed text-warm-gray">
              {product.description}
            </p>
          )}

          <div className="mt-8 space-y-6 border border-ivory-dark bg-white p-6">
            {/* Date Selection - Highlighted when empty */}
            <div className={`rounded-lg p-4 transition-colors ${!startDate || !endDate ? "bg-champagne/10 ring-2 ring-champagne/30" : "bg-transparent"}`}>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="font-body text-xs font-semibold uppercase tracking-[0.15em] text-charcoal-light">
                  Rental Dates
                </h3>
                {(!startDate || !endDate) && (
                  <span className="inline-flex items-center rounded-full bg-champagne px-2 py-0.5 text-[10px] font-medium text-white">
                    Required
                  </span>
                )}
              </div>
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onChange={(s, e) => setDates(s, e)}
              />
              {(!startDate || !endDate) && (
                <p className="mt-3 font-body text-xs text-champagne-dark">
                  Please select your event dates to check availability and add to cart
                </p>
              )}
            </div>

            {checking && (
              <p className="font-body text-sm text-warm-gray">Checking availability...</p>
            )}
            {!checking && available !== null && (
              <p className={`font-body text-sm font-medium ${available > 0 ? "text-green-700" : "text-red-600"}`}>
                {available > 0 ? `${available} available for your dates` : "Sold out for these dates"}
              </p>
            )}

            <div>
              <h3 className="mb-3 font-body text-xs font-semibold uppercase tracking-[0.15em] text-charcoal-light">
                Quantity
              </h3>
              <QuantitySelector
                qty={qty}
                max={available ?? product.totalQty}
                onChange={setQty}
              />
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!startDate || !endDate || (available !== null && available < qty)}
              className="w-full bg-champagne py-3.5 font-body text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-champagne-dark disabled:cursor-not-allowed disabled:opacity-40"
            >
              {!startDate || !endDate ? "Select Dates to Add to Cart" : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
