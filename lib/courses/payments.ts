import "server-only";
import Stripe from "stripe";
import { serviceClient } from "@/lib/supabase/admin";
import { checked, CourseError } from "./server";

export function stripeClient() {
  if (!process.env.STRIPE_SECRET_KEY)
    throw new CourseError("Payments are temporarily unavailable.", 503);
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-02-24.acacia",
  });
}
function reference(value: string | { id: string } | null) {
  return typeof value === "string" ? value : (value?.id ?? null);
}

export async function fulfillPaymentEvent(event: Stripe.Event) {
  const db = serviceClient();
  const existing = checked(
    await db
      .from("course_payment_events")
      .select("status")
      .eq("id", event.id)
      .maybeSingle(),
  );
  if (existing?.status === "processed" || existing?.status === "ignored")
    return;
  if (!existing) {
    const inserted = await db
      .from("course_payment_events")
      .insert({ id: event.id, type: event.type });
    if (inserted.error && inserted.error.code !== "23505") throw inserted.error;
  }
  let orderId: string | null = null;
  try {
    let state: string | null = null,
      sessionId: string | null = null,
      intentId: string | null = null;
    if (
      [
        "checkout.session.completed",
        "checkout.session.async_payment_succeeded",
        "checkout.session.async_payment_failed",
      ].includes(event.type)
    ) {
      const eventSession = event.data.object as Stripe.Checkout.Session;
      // Retrieve current Stripe state rather than trusting event arrival order.
      const session = await stripeClient().checkout.sessions.retrieve(
        eventSession.id,
      );
      orderId = session.metadata?.course_order_id ?? null;
      sessionId = session.id;
      intentId = reference(session.payment_intent);
      if (orderId) {
        const order = checked(
          await db.from("course_orders").select("*").eq("id", orderId).single(),
        );
        if (
          session.client_reference_id !== order.user_id ||
          (order.checkout_session_id &&
            order.checkout_session_id !== session.id)
        )
          throw new Error("Checkout ownership mismatch");
        const items = await stripeClient().checkout.sessions.listLineItems(
          session.id,
          { limit: 2 },
        );
        if (
          session.mode !== "payment" ||
          items.data.length !== 1 ||
          items.data[0].price?.id !== order.stripe_price_id ||
          items.data[0].quantity !== 1
        )
          throw new Error("Checkout product mismatch");
        if (session.payment_status === "paid") state = "paid";
        else if (event.type === "checkout.session.async_payment_failed")
          state = "failed";
      }
    } else if (event.type === "charge.refunded") {
      const charge = await stripeClient().charges.retrieve(
        (event.data.object as Stripe.Charge).id,
      );
      intentId = reference(charge.payment_intent);
      if (charge.refunded) state = "refunded"; // Partial refunds keep access; policy is documented.
    } else if (event.type === "charge.dispute.created") {
      const dispute = event.data.object as Stripe.Dispute;
      intentId = reference(dispute.payment_intent);
      state = "disputed";
    }
    if (!orderId && intentId) {
      const found = checked(
        await db
          .from("course_orders")
          .select("id")
          .eq("payment_intent_id", intentId)
          .maybeSingle(),
      );
      orderId = found?.id ?? null;
      if (!orderId) {
        const intent = await stripeClient().paymentIntents.retrieve(intentId);
        orderId = intent.metadata.course_order_id ?? null;
      }
    }
    if (orderId && state)
      checked(
        await db.rpc("course_apply_payment", {
          target_order: orderId,
          target_state: state,
          session_ref: sessionId,
          intent_ref: intentId,
        }),
      );
    checked(
      await db
        .from("course_payment_events")
        .update({
          status: orderId && state ? "processed" : "ignored",
          order_id: orderId,
          error: null,
          processed_at: new Date().toISOString(),
        })
        .eq("id", event.id),
    );
  } catch (error) {
    await db
      .from("course_payment_events")
      .update({
        status: "failed",
        error: "Processing failed. Retry after checking payment configuration.",
        order_id: orderId,
      })
      .eq("id", event.id);
    throw error;
  }
}
