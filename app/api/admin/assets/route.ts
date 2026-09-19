import { z } from "zod";
import {
  context,
  readBody,
  requireSameOrigin,
  apiError,
  checked,
  CourseError,
} from "@/lib/courses/server";
import { uuid, validateUpload } from "@/lib/courses/validation";
import { serviceClient } from "@/lib/supabase/admin";
import { courseStorageConfig } from "@/lib/courses/config";
export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const { db } = await context(true);
    const body = z
      .object({
        courseId: uuid,
        name: z.string().min(1).max(250),
        kind: z.enum(["video", "image", "attachment"]),
        size: z.number().positive(),
      })
      .parse(await readBody(request));
    const { mime, extension } = validateUpload(body.name, body.kind, body.size);
    const id = crypto.randomUUID(),
      path = `${body.courseId}/${id}.${extension}`;
    const asset = checked(
      await db
        .from("course_assets")
        .insert({
          id,
          course_id: body.courseId,
          name: body.name,
          kind: body.kind,
          mime_type: mime,
          size_bytes: body.size,
          path,
        })
        .select()
        .single(),
    );
    return Response.json({ asset });
  } catch (error) {
    return apiError(error);
  }
}
export async function PATCH(request: Request) {
  try {
    requireSameOrigin(request);
    const { db } = await context(true);
    const body = z
      .object({ id: uuid, action: z.enum(["complete", "archive", "restore"]) })
      .parse(await readBody(request));
    const asset = checked(
      await db.from("course_assets").select("*").eq("id", body.id).single(),
    );
    if (body.action === "complete" || body.action === "restore") {
      const objects = checked(
        await serviceClient()
          .storage.from(courseStorageConfig().bucket)
          .list(asset.course_id, { search: asset.path.split("/").at(-1) }),
      );
      const object = objects.find(
        (item) => item.name === asset.path.split("/").at(-1),
      );
      if (!object || Number(object.metadata?.size) !== asset.size_bytes)
        throw new CourseError("Upload is incomplete. Please retry.");
    }
    if (body.action === "archive") await assertUnreferenced(db, body.id);
    checked(
      await db
        .from("course_assets")
        .update({ status: body.action === "archive" ? "archived" : "ready" })
        .eq("id", body.id),
    );
    return Response.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
async function assertUnreferenced(
  db: Awaited<ReturnType<typeof context>>["db"],
  id: string,
) {
  const results = await Promise.all([
    db.from("courses").select("id").eq("thumbnail_asset_id", id).limit(1),
    db.from("course_lessons").select("id").eq("video_asset_id", id).limit(1),
    db.from("course_attachments").select("id").eq("asset_id", id).limit(1),
  ]);
  if (results.some((result) => checked(result).length > 0))
    throw new CourseError(
      "This file is in use. Replace or detach it before archiving or deleting.",
    );
}
export async function DELETE(request: Request) {
  try {
    requireSameOrigin(request);
    const { db } = await context(true);
    const { id } = z.object({ id: uuid }).parse(await readBody(request));
    const asset = checked(
      await db.from("course_assets").select("*").eq("id", id).single(),
    );
    await assertUnreferenced(db, id);
    // Mark unavailable before removing the object, so a failed delete remains retryable.
    checked(
      await db
        .from("course_assets")
        .update({ status: "archived" })
        .eq("id", id),
    );
    checked(
      await serviceClient()
        .storage.from(courseStorageConfig().bucket)
        .remove([asset.path]),
    );
    checked(await db.from("course_assets").delete().eq("id", id));
    return Response.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
