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
        className="flex h-9 w-9 items-center justify-center border border-ivory-dark font-body text-lg text-charcoal-light transition-colors hover:border-champagne hover:text-champagne disabled:opacity-30"
      >
        &minus;
      </button>
      <span className="w-10 text-center font-body text-lg font-medium text-charcoal">{qty}</span>
      <button
        onClick={() => onChange(qty + 1)}
        disabled={max !== undefined && qty >= max}
        className="flex h-9 w-9 items-center justify-center border border-ivory-dark font-body text-lg text-charcoal-light transition-colors hover:border-champagne hover:text-champagne disabled:opacity-30"
      >
        +
      </button>
      {max !== undefined && (
        <span className="ml-2 font-body text-xs text-warm-gray">
          {max} available
        </span>
      )}
    </div>
  );
}
