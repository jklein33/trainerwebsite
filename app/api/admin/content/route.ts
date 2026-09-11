import { z } from "zod";
import {
  context,
  readBody,
  requireSameOrigin,
  apiError,
  checked,
  CourseError,
} from "@/lib/courses/server";
import {
  courseInput,
  moduleInput,
  lessonInput,
  uuid,
} from "@/lib/courses/validation";
const envelope = z.object({
  type: z.enum(["course", "module", "lesson", "attachment"]),
  id: uuid.optional(),
  data: z.unknown().optional(),
});
async function write(request: Request) {
  try {
    requireSameOrigin(request);
    const { db } = await context(true);
    const body = envelope.parse(await readBody(request));
    const table = (
      {
        course: "courses",
        module: "course_modules",
        lesson: "course_lessons",
        attachment: "course_attachments",
      } as const
    )[body.type];
    if (request.method === "DELETE") {
      if (!body.id) throw new CourseError("Missing item.");
      if (body.type === "course") {
        const orders = checked(
          await db
            .from("course_orders")
            .select("id")
            .eq("course_id", body.id)
            .limit(1),
        );
        const grants = checked(
          await db
            .from("course_entitlements")
            .select("id")
            .eq("course_id", body.id)
            .limit(1),
        );
        if (orders.length || grants.length)
          throw new CourseError(
            "This course has access history. Archive it instead.",
          );
      }
      checked(await db.from(table).delete().eq("id", body.id));
      return Response.json({ ok: true });
    }
    const data =
      body.type === "course"
        ? courseInput.parse(body.data)
        : body.type === "module"
          ? moduleInput.parse(body.data)
          : body.type === "lesson"
            ? lessonInput.parse(body.data)
            : z.object({ lesson_id: uuid, asset_id: uuid }).parse(body.data);
    if (body.id) {
      const previous = checked(
        await db.from(table).select("*").eq("id", body.id).single(),
      );
      if (
        "course_id" in data &&
        "course_id" in previous &&
        data.course_id !== previous.course_id
      )
        throw new CourseError("Moving between courses is not supported.");
      if (
        "module_id" in data &&
        "module_id" in previous &&
        data.module_id !== previous.module_id
      )
        throw new CourseError("Moving between modules is not supported.");
    }
    if (body.id)
      return Response.json({
        item: checked(
          await db.from(table).update(data).eq("id", body.id).select().single(),
        ),
      });
    switch (body.type) {
      case "course":
        return Response.json({
          item: checked(
            await db
              .from("courses")
              .insert(courseInput.parse(body.data))
              .select()
              .single(),
          ),
        });
      case "module":
        return Response.json({
          item: checked(
            await db
              .from("course_modules")
              .insert(moduleInput.parse(body.data))
              .select()
              .single(),
          ),
        });
      case "lesson":
        return Response.json({
          item: checked(
            await db
              .from("course_lessons")
              .insert(lessonInput.parse(body.data))
              .select()
              .single(),
          ),
        });
      case "attachment":
        return Response.json({
          item: checked(
            await db
              .from("course_attachments")
              .insert(
                z.object({ lesson_id: uuid, asset_id: uuid }).parse(body.data),
              )
              .select()
              .single(),
          ),
        });
    }
  } catch (error) {
    return apiError(error);
  }
}
export const POST = write;
export const PATCH = write;
export const DELETE = write;
