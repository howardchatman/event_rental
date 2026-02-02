"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@/lib/store/cart";

export default function SuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="mx-auto max-w-lg px-6 py-20 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
        <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="font-heading text-3xl font-light text-charcoal">Payment Confirmed</h1>
      <p className="mt-3 font-body text-sm text-warm-gray">
        Your order has been placed successfully. We&apos;ll send you a confirmation email shortly.
      </p>
      {orderId && (
        <p className="mt-2 font-body text-sm text-warm-gray-light">
          Order ID: <span className="font-mono text-charcoal-light">{orderId}</span>
        </p>
      )}
      <div className="mt-8 flex justify-center gap-4">
        <Link
          href="/products"
          className="bg-champagne px-8 py-3 font-body text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-champagne-dark"
        >
          Continue Browsing
        </Link>
      </div>
    </div>
  );
}
