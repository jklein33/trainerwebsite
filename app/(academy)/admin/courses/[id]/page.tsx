import { notFound } from "next/navigation";
import { pageContext, checked } from "@/lib/courses/server";
import { supabaseConfigured } from "@/lib/supabase/env";
import { SetupNotice } from "@/components/courses/setup-notice";
import { AdminCourse } from "@/components/courses/admin-course";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!supabaseConfigured()) return <SetupNotice />;
  const { db } = await pageContext(true),
    { id } = await params;
  const { data: course } = await db
    .from("courses")
    .select("*")
    .eq("id", id)
    .single();
  if (!course) notFound();
  const [moduleResult, assetResult] = await Promise.all([
    db
      .from("course_modules")
      .select("*")
      .eq("course_id", id)
      .order("position")
      .order("created_at"),
    db
      .from("course_assets")
      .select("*")
      .eq("course_id", id)
      .order("created_at", { ascending: false }),
  ]);
  const modules = checked(moduleResult),
    assets = checked(assetResult);
  const lessons = modules.length
    ? checked(
        await db
          .from("course_lessons")
          .select("*")
          .in(
            "module_id",
            modules.map((m) => m.id),
          )
          .order("position")
          .order("created_at"),
      )
    : [];
  const attachments = lessons.length
    ? checked(
        await db
          .from("course_attachments")
          .select("*")
          .in(
            "lesson_id",
            lessons.map((l) => l.id),
          ),
      )
    : [];
  return (
    <AdminCourse
      course={course}
      modules={modules}
      lessons={lessons}
      assets={assets}
      attachments={attachments}
    />
  );
}
