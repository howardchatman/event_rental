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
    <div className="mx-auto max-w-lg py-16 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
        <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="text-3xl font-bold text-gray-900">Payment Confirmed!</h1>
      <p className="mt-3 text-gray-600">
        Your order has been placed successfully. We&apos;ll send you a confirmation email shortly.
      </p>
      {orderId && (
        <p className="mt-2 text-sm text-gray-500">
          Order ID: <span className="font-mono">{orderId}</span>
        </p>
      )}
      <div className="mt-8 flex justify-center gap-4">
        <Link
          href="/products"
          className="rounded-lg bg-indigo-600 px-6 py-2.5 font-medium text-white hover:bg-indigo-700"
        >
          Continue Browsing
        </Link>
      </div>
    </div>
  );
}
