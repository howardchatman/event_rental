import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const admin = createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.order_id;

      if (!orderId) {
        console.error("No order_id in session metadata");
        break;
      }

      // Mark order as paid
      await admin
        .from("orders")
        .update({
          status: "paid",
          stripe_payment_intent_id: session.payment_intent as string,
        })
        .eq("id", orderId);

      // Confirm reservations
      await admin
        .from("reservations")
        .update({ status: "confirmed", expires_at: null })
        .eq("order_id", orderId)
        .eq("status", "held");

      console.log(`Order ${orderId} paid and confirmed`);
      break;
    }

    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.order_id;

      if (!orderId) break;

      // Cancel order and release reservations
      await admin
        .from("orders")
        .update({ status: "cancelled" })
        .eq("id", orderId);

      await admin
        .from("reservations")
        .update({ status: "released" })
        .eq("order_id", orderId)
        .eq("status", "held");

      console.log(`Order ${orderId} expired, reservations released`);
      break;
    }

    default:
      // Unhandled event type
      break;
  }

  return NextResponse.json({ received: true });
}
