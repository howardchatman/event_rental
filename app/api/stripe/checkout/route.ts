import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe/stripe";
import { calculateOrderTotals, type CartItem, type PricingModel } from "@/lib/pricing/calc";

interface CheckoutItem {
  product_id: string;
  qty: number;
}

interface CheckoutBody {
  event_date_start: string;
  event_date_end: string;
  delivery_required: boolean;
  delivery_address: Record<string, string> | null;
  items: CheckoutItem[];
}

export async function POST(request: NextRequest) {
  try {
    // 1. Auth check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: CheckoutBody = await request.json();
    const { event_date_start, event_date_end, delivery_required, delivery_address, items } = body;

    if (!event_date_start || !event_date_end || !items?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const admin = createAdminClient();

    // 2. Check availability via RPC
    const { data: shortages, error: availError } = await admin.rpc("check_cart_availability", {
      p_cart: JSON.stringify(items.map((i) => ({ product_id: i.product_id, qty: i.qty }))),
      p_start: event_date_start,
      p_end: event_date_end,
    });

    if (availError) {
      return NextResponse.json({ error: "Availability check failed" }, { status: 500 });
    }

    if (shortages && shortages.length > 0) {
      return NextResponse.json(
        { error: "Some items are not available in requested quantity", shortages },
        { status: 409 }
      );
    }

    // 3. Fetch product details for pricing
    const productIds = items.map((i) => i.product_id);
    const { data: products, error: prodError } = await admin
      .from("products")
      .select("id, name, slug, pricing_model, base_price_cents, security_deposit_cents")
      .in("id", productIds);

    if (prodError || !products) {
      return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }

    const cartItems: CartItem[] = items.map((item) => {
      const p = products.find((pr) => pr.id === item.product_id)!;
      return {
        productId: p.id,
        qty: item.qty,
        pricingModel: p.pricing_model as PricingModel,
        basePriceCents: p.base_price_cents,
        securityDepositCents: p.security_deposit_cents,
        name: p.name,
      };
    });

    const totals = calculateOrderTotals(
      cartItems,
      new Date(event_date_start),
      new Date(event_date_end),
      delivery_required
    );

    // 4. Create order
    const { data: order, error: orderError } = await admin
      .from("orders")
      .insert({
        customer_id: user.id,
        status: "pending_payment",
        event_date_start,
        event_date_end,
        delivery_required,
        delivery_address: delivery_address || null,
        subtotal_cents: totals.subtotalCents,
        tax_cents: totals.taxCents,
        delivery_fee_cents: totals.deliveryFeeCents,
        deposit_cents: totals.depositCents,
        total_cents: totals.totalCents,
      })
      .select("id")
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }

    // 5. Create order items
    const orderItems = totals.lineItems.map((li) => ({
      order_id: order.id,
      product_id: li.productId,
      qty: li.qty,
      unit_price_cents: li.unitPriceCents,
      line_total_cents: li.lineTotalCents,
    }));

    await admin.from("order_items").insert(orderItems);

    // 6. Create held reservations (15 min expiry)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    const reservations = items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      qty: item.qty,
      start_date: event_date_start,
      end_date: event_date_end,
      status: "held",
      expires_at: expiresAt,
    }));

    await admin.from("reservations").insert(reservations);

    // 7. Create Stripe Checkout Session
    const appUrl = process.env.APP_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: user.email,
      metadata: { order_id: order.id },
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Event Rental Order`,
              description: `${event_date_start} to ${event_date_end} – ${items.length} item(s)`,
            },
            unit_amount: totals.totalCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/success?order_id=${order.id}`,
      cancel_url: `${appUrl}/cart?canceled=1`,
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 min
    });

    // 8. Save session ID on order
    await admin
      .from("orders")
      .update({ stripe_checkout_session_id: session.id })
      .eq("id", order.id);

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
