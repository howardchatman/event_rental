import { differenceInCalendarDays, isWeekend, eachDayOfInterval } from "date-fns";

export type PricingModel = "per_day" | "flat" | "weekend";

interface PricingInput {
  pricingModel: PricingModel;
  basePriceCents: number;
  securityDepositCents: number;
  qty: number;
  startDate: Date;
  endDate: Date;
}

interface PricingResult {
  unitPriceCents: number;
  days: number;
  lineTotalCents: number;
  depositCents: number;
}

function countDays(start: Date, end: Date): number {
  return Math.max(1, differenceInCalendarDays(end, start) + 1);
}

function isWeekendRange(start: Date, end: Date): boolean {
  const days = eachDayOfInterval({ start, end });
  // Consider it a "weekend" rental if every day in the range is Fri/Sat/Sun
  return days.length >= 1 && days.every((d) => {
    const day = d.getDay();
    return day === 5 || day === 6 || day === 0; // Fri, Sat, Sun
  });
}

export function calculateLineItem(input: PricingInput): PricingResult {
  const { pricingModel, basePriceCents, securityDepositCents, qty, startDate, endDate } = input;
  const days = countDays(startDate, endDate);

  let unitPriceCents = basePriceCents;
  let lineTotalCents: number;

  switch (pricingModel) {
    case "flat":
      lineTotalCents = basePriceCents * qty;
      break;
    case "weekend":
      if (isWeekendRange(startDate, endDate)) {
        lineTotalCents = basePriceCents * qty; // flat weekend rate
      } else {
        lineTotalCents = basePriceCents * qty * days; // fall back to per_day
      }
      break;
    case "per_day":
    default:
      lineTotalCents = basePriceCents * qty * days;
      break;
  }

  const depositCents = securityDepositCents > 0
    ? securityDepositCents * qty
    : Math.round(lineTotalCents * 0.2); // 20% fallback

  return { unitPriceCents, days, lineTotalCents, depositCents };
}

export interface CartItem {
  productId: string;
  qty: number;
  pricingModel: PricingModel;
  basePriceCents: number;
  securityDepositCents: number;
  name: string;
}

interface OrderTotals {
  subtotalCents: number;
  depositCents: number;
  taxCents: number;
  deliveryFeeCents: number;
  totalCents: number;
  lineItems: Array<CartItem & PricingResult>;
}

const TAX_RATE = 0.08; // 8%
const DELIVERY_FEE_CENTS = 7500; // $75

export function calculateOrderTotals(
  items: CartItem[],
  startDate: Date,
  endDate: Date,
  deliveryRequired: boolean
): OrderTotals {
  let subtotalCents = 0;
  let depositCents = 0;

  const lineItems = items.map((item) => {
    const result = calculateLineItem({
      pricingModel: item.pricingModel,
      basePriceCents: item.basePriceCents,
      securityDepositCents: item.securityDepositCents,
      qty: item.qty,
      startDate,
      endDate,
    });
    subtotalCents += result.lineTotalCents;
    depositCents += result.depositCents;
    return { ...item, ...result };
  });

  const taxCents = Math.round(subtotalCents * TAX_RATE);
  const deliveryFeeCents = deliveryRequired ? DELIVERY_FEE_CENTS : 0;
  const totalCents = subtotalCents + taxCents + deliveryFeeCents;

  return { subtotalCents, depositCents, taxCents, deliveryFeeCents, totalCents, lineItems };
}
