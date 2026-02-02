"use client";

interface QuantitySelectorProps {
  qty: number;
  max?: number;
  onChange: (qty: number) => void;
}

export default function QuantitySelector({
  qty,
  max,
  onChange,
}: QuantitySelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onChange(Math.max(1, qty - 1))}
        disabled={qty <= 1}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-lg font-medium transition hover:bg-gray-50 disabled:opacity-40"
      >
        &minus;
      </button>
      <span className="w-10 text-center text-lg font-semibold">{qty}</span>
      <button
        onClick={() => onChange(qty + 1)}
        disabled={max !== undefined && qty >= max}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-lg font-medium transition hover:bg-gray-50 disabled:opacity-40"
      >
        +
      </button>
      {max !== undefined && (
        <span className="ml-2 text-sm text-gray-500">
          {max} available
        </span>
      )}
    </div>
  );
}
