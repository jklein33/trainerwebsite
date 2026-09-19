import { z } from "zod";
import {
  context,
  readBody,
  requireSameOrigin,
  apiError,
  checked,
  CourseError,
} from "@/lib/courses/server";
import { serviceClient } from "@/lib/supabase/admin";
import { stripeClient } from "@/lib/courses/payments";
import { uuid } from "@/lib/courses/validation";
import { requestOrigin } from "@/lib/courses/request-origin";
export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const { db, user } = await context();
    const { courseId, requestId } = z
      .object({ courseId: uuid, requestId: uuid })
      .parse(await readBody(request));
    const course = checked(
      await db
        .from("courses")
        .select("*")
        .eq("id", courseId)
        .eq("status", "published")
        .single(),
    );
    if (checked(await db.rpc("course_can_read", { target: courseId })))
      return Response.json({ url: `/learn/${courseId}` });
    if (!course.stripe_price_id)
      throw new CourseError("This course is not available for purchase yet.");
    const stripe = stripeClient(),
      service = serviceClient();
    const price = await stripe.prices.retrieve(course.stripe_price_id);
    if (!price.active || price.recurring || !price.unit_amount)
      throw new CourseError("This course price is unavailable.");
    const inserted = await service.from("course_orders").insert({
      id: requestId,
      user_id: user.id,
      course_id: courseId,
      stripe_price_id: price.id,
    });
    if (inserted.error && inserted.error.code !== "23505") throw inserted.error;
    const order = checked(
      await service
        .from("course_orders")
        .select("*")
        .eq("id", requestId)
        .single(),
    );
    if (
      order.user_id !== user.id ||
      order.course_id !== courseId ||
      order.stripe_price_id !== price.id
    )
      throw new CourseError("Invalid checkout request.", 403);
    if (order.status !== "pending")
      throw new CourseError(
        "This checkout has already finished. Refresh the page before trying again.",
        409,
      );
    // Stripe idempotency keys expire. Never create a second chargeable session for a known order.
    if (order.checkout_session_id) {
      const previous = await stripe.checkout.sessions.retrieve(
        order.checkout_session_id,
      );
      if (previous.status === "open" && previous.url)
        return Response.json({ url: previous.url });
      throw new CourseError(
        "This checkout has closed. Refresh the page to check your access or start again.",
        409,
      );
    }
    const origin = requestOrigin(request);
    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        customer_email: user.email,
        client_reference_id: user.id,
        line_items: [{ price: price.id, quantity: 1 }],
        metadata: { course_order_id: order.id },
        payment_intent_data: { metadata: { course_order_id: order.id } },
        success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/learn/${courseId}?checkout=cancelled`,
      },
      { idempotencyKey: `course-checkout-${order.id}` },
    );
    checked(
      await service
        .from("course_orders")
        .update({ checkout_session_id: session.id })
        .eq("id", order.id),
    );
    if (!session.url)
      throw new CourseError("Unable to open checkout. Please retry.", 503);
    return Response.json({ url: session.url });
  } catch (error) {
    return apiError(error);
  }
}
