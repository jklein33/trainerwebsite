import { z } from "zod";
import {
  context,
  readBody,
  requireSameOrigin,
  apiError,
  checked,
} from "@/lib/courses/server";
import { uuid } from "@/lib/courses/validation";
export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const { db } = await context(true);
    const body = z
      .object({
        type: z.enum(["module", "lesson"]),
        ids: z.array(uuid).min(1).max(1000),
      })
      .parse(await readBody(request));
    checked(
      await db.rpc("course_reorder", {
        item_type: body.type,
        ordered_ids: body.ids,
      }),
    );
    return Response.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
