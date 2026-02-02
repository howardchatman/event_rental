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
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Images */}
      <div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-gray-100">
          {product.images.length > 0 ? (
            <Image
              src={product.images[selectedImage]?.url}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width:1024px) 100vw, 50vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">
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
                className={`relative h-16 w-16 overflow-hidden rounded-lg border-2 ${
                  i === selectedImage ? "border-indigo-600" : "border-transparent"
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
        <span className="text-sm font-medium uppercase tracking-wider text-indigo-600">
          {product.categoryName}
        </span>
        <h1 className="mt-1 text-3xl font-bold">{product.name}</h1>
        <p className="mt-1 text-2xl font-semibold text-gray-800">{priceLabel}</p>

        {product.description && (
          <p className="mt-4 text-gray-600">{product.description}</p>
        )}

        <div className="mt-6 space-y-5 rounded-xl border bg-white p-5">
          <div>
            <h3 className="mb-2 text-sm font-semibold text-gray-700">Rental Dates</h3>
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onChange={(s, e) => setDates(s, e)}
            />
          </div>

          {checking && (
            <p className="text-sm text-gray-500">Checking availability...</p>
          )}
          {!checking && available !== null && (
            <p className={`text-sm font-medium ${available > 0 ? "text-green-600" : "text-red-600"}`}>
              {available > 0 ? `${available} available` : "Sold out for these dates"}
            </p>
          )}

          <div>
            <h3 className="mb-2 text-sm font-semibold text-gray-700">Quantity</h3>
            <QuantitySelector
              qty={qty}
              max={available ?? product.totalQty}
              onChange={setQty}
            />
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!startDate || !endDate || (available !== null && available < qty)}
            className="w-full rounded-lg bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
