import { z } from "zod";
import {
  context,
  requireSameOrigin,
  readBody,
  apiError,
  checked,
  CourseError,
} from "@/lib/courses/server";
import { fulfillPaymentEvent, stripeClient } from "@/lib/courses/payments";
export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const { db } = await context(true);
    const { eventId } = z
      .object({ eventId: z.string().regex(/^evt_[A-Za-z0-9]+$/) })
      .parse(await readBody(request));
    const event = checked(
      await db
        .from("course_payment_events")
        .select("*")
        .eq("id", eventId)
        .single(),
    );
    if (event.status !== "failed")
      throw new CourseError("Only failed events can be retried.");
    await fulfillPaymentEvent(await stripeClient().events.retrieve(eventId));
    return Response.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
