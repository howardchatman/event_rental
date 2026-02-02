import { createClient } from "@/lib/supabase/client";

export async function checkAvailability(
  productId: string,
  startDate: string,
  endDate: string
): Promise<number> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("check_availability", {
    p_product_id: productId,
    p_start: startDate,
    p_end: endDate,
  });
  if (error) throw error;
  return data as number;
}

export interface CartAvailabilityItem {
  product_id: string;
  qty: number;
}

export interface Shortage {
  product_id: string;
  requested: number;
  available: number;
}

export async function checkCartAvailability(
  cart: CartAvailabilityItem[],
  startDate: string,
  endDate: string
): Promise<Shortage[]> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("check_cart_availability", {
    p_cart: JSON.stringify(cart),
    p_start: startDate,
    p_end: endDate,
  });
  if (error) throw error;
  return (data as Shortage[]) || [];
}
