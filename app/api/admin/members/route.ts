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
      .discriminatedUnion("action", [
        z.object({
          action: z.literal("access"),
          userId: uuid,
          courseId: uuid,
          enabled: z.boolean(),
          reason: z.string().trim().min(1).max(500),
        }),
        z.object({
          action: z.literal("suspend"),
          userId: uuid,
          enabled: z.boolean(),
        }),
      ])
      .parse(await readBody(request));
    if (body.action === "access")
      checked(
        await db.rpc("course_manage_access", {
          target_user: body.userId,
          target_course: body.courseId,
          enabled: body.enabled,
          reason: body.reason,
        }),
      );
    else
      checked(
        await db.rpc("course_suspend_member", {
          target_user: body.userId,
          enabled: body.enabled,
        }),
      );
    return Response.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
