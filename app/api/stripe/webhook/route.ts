import { stripeClient, fulfillPaymentEvent } from "@/lib/courses/payments";
export const runtime = "nodejs";
export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature"),
    secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret)
    return Response.json(
      { error: "Webhook is not configured." },
      { status: 503 },
    );
  if (!signature)
    return Response.json({ error: "Missing signature." }, { status: 400 });
  let event;
  try {
    event = stripeClient().webhooks.constructEvent(
      await request.text(),
      signature,
      secret,
    );
  } catch {
    return Response.json({ error: "Invalid signature." }, { status: 400 });
  }
  try {
    await fulfillPaymentEvent(event);
    return Response.json({ received: true });
  } catch (error) {
    console.error(
      "Payment fulfillment failed",
      event.id,
      error instanceof Error ? error.message : "",
    );
    return Response.json({ error: "Please retry delivery." }, { status: 500 });
  }
}
