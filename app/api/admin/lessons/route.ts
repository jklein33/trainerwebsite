import { z } from "zod";
import {
  context,
  checked,
  requireSameOrigin,
  readBody,
  apiError,
  CourseError,
} from "@/lib/courses/server";
import { lessonInput, uuid } from "@/lib/courses/validation";
import { saveLesson } from "@/lib/courses/save-lesson";

const input = z.object({
  id: uuid,
  data: lessonInput,
  resourceIds: z.array(uuid).max(100),
});

export async function PUT(request: Request) {
  let writing = false;
  try {
    requireSameOrigin(request);
    const { db } = await context(true);
    const { id, data, resourceIds } = input.parse(await readBody(request));
    const courseModule = checked(
      await db
        .from("course_modules")
        .select("*")
        .eq("id", data.module_id)
        .single(),
    );
    const previous = checked(
      await db.from("course_lessons").select("*").eq("id", id).maybeSingle(),
    );
    if (previous && previous.module_id !== data.module_id)
      throw new CourseError(
        "Moving a lesson between modules is not supported.",
      );
    if (data.status === "published" && !data.video_asset_id)
      throw new CourseError(
        "Add a video before publishing, or save as a draft.",
      );
    const requested = [
      ...new Set([
        ...resourceIds,
        ...(data.video_asset_id ? [data.video_asset_id] : []),
      ]),
    ];
    if (requested.length) {
      const assets = checked(
        await db.from("course_assets").select("*").in("id", requested),
      );
      for (const assetId of requested) {
        const asset = assets.find((entry) => entry.id === assetId);
        if (
          !asset ||
          asset.course_id !== courseModule.course_id ||
          asset.status !== "ready" ||
          (assetId === data.video_asset_id
            ? asset.kind !== "video"
            : asset.kind === "video") ||
          (resourceIds.includes(assetId) && asset.kind === "video")
        )
          throw new CourseError(
            "A selected file is unavailable or belongs to a different course. Replace or remove it and try again.",
          );
      }
    }
    writing = true;
    const item = await saveLesson(id, data, resourceIds, {
      ensureDraft: async (lessonId, changes) => {
        // The editor supplies a stable UUID, including on retries after a lost response.
        checked(
          await db
            .from("course_lessons")
            .upsert(
              { ...changes, id: lessonId, status: "draft" },
              { onConflict: "id", ignoreDuplicates: true },
            ),
        );
        const existing = checked(
          await db
            .from("course_lessons")
            .select("module_id")
            .eq("id", lessonId)
            .single(),
        );
        if (existing.module_id !== changes.module_id)
          throw new CourseError("The lesson belongs to a different module.");
      },
      listResources: async (lessonId) =>
        checked(
          await db
            .from("course_attachments")
            .select("asset_id")
            .eq("lesson_id", lessonId),
        ).map((link) => link.asset_id),
      addResources: async (lessonId, ids) => {
        checked(
          await db.from("course_attachments").upsert(
            ids.map((asset_id) => ({ lesson_id: lessonId, asset_id })),
            { onConflict: "lesson_id,asset_id", ignoreDuplicates: true },
          ),
        );
      },
      removeResources: async (lessonId, ids) => {
        checked(
          await db
            .from("course_attachments")
            .delete()
            .eq("lesson_id", lessonId)
            .in("asset_id", ids),
        );
      },
      updateLesson: async (lessonId, changes) =>
        checked(
          await db
            .from("course_lessons")
            .update(changes)
            .eq("id", lessonId)
            .select()
            .single(),
        ),
    });
    return Response.json({ item });
  } catch (error) {
    if (writing) {
      return apiError(
        new CourseError(
          "The save could not finish. Some changes may already be saved. Your edits are still here — save again to finish.",
        ),
      );
    }
    return apiError(error);
  }
}
