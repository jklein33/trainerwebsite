import { context, apiError, CourseError } from "@/lib/courses/server";
import { serviceClient } from "@/lib/supabase/admin";
import { uuid } from "@/lib/courses/validation";
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { db } = await context();
    const id = uuid.parse((await params).id);
    // This query runs as the learner: RLS checks the published lesson/module and course grant.
    const { data: asset, error } = await db
      .from("course_assets")
      .select("*")
      .eq("id", id)
      .eq("status", "ready")
      .single();
    if (error || !asset)
      throw new CourseError("This file is not available.", 404);
    const download = new URL(request.url).searchParams.has("download");
    const { data, error: signError } = await serviceClient()
      .storage.from("course-media")
      .createSignedUrl(
        asset.path,
        3600,
        download ? { download: asset.name } : undefined,
      );
    if (signError || !data)
      throw new CourseError("Unable to load this file. Please retry.", 503);
    return Response.json(
      { url: data.signedUrl, expiresAt: Date.now() + 3600000 },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return apiError(error);
  }
}
