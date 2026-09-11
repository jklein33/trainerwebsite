import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Play } from "lucide-react";
import { pageContext, checked } from "@/lib/courses/server";
import { supabaseConfigured } from "@/lib/supabase/env";
import { SetupNotice } from "@/components/courses/setup-notice";
import { CoursePlayer, DownloadAsset } from "@/components/courses/player";
import { RichText } from "@/components/courses/rich-text";
export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  if (!supabaseConfigured()) return <SetupNotice />;
  const { courseId, lessonId } = await params,
    { db } = await pageContext();
  const { data: lesson } = await db
    .from("course_lessons")
    .select("*")
    .eq("id", lessonId)
    .eq("status", "published")
    .single();
  if (!lesson) notFound();
  const { data: module } = await db
    .from("course_modules")
    .select("*")
    .eq("id", lesson.module_id)
    .eq("course_id", courseId)
    .eq("status", "published")
    .single();
  if (!module) notFound();
  const lessons = checked(
    await db
      .from("course_lessons")
      .select("id,title")
      .eq("module_id", module.id)
      .eq("status", "published")
      .order("position")
      .order("created_at"),
  );
  const attachments = checked(
    await db.from("course_attachments").select("*").eq("lesson_id", lessonId),
  );
  const assets = attachments.length
    ? checked(
        await db
          .from("course_assets")
          .select("*")
          .in(
            "id",
            attachments.map((a) => a.asset_id),
          )
          .eq("status", "ready"),
      )
    : [];
  const next = lessons[lessons.findIndex((l) => l.id === lessonId) + 1];
  return (
    <main>
      <Link className="academy-back" href={`/learn/${courseId}`}>
        <ArrowLeft size={15} /> Back to course
      </Link>
      <div className="academy-lesson-layout">
        <article>
          <span className="academy-eyebrow">{module.title}</span>
          <h1 className="academy-lesson-title">{lesson.title}</h1>
          {lesson.video_asset_id ? (
            <CoursePlayer
              key={lesson.video_asset_id}
              assetId={lesson.video_asset_id}
              title={lesson.title}
            />
          ) : (
            <div className="academy-notice">This video is being updated.</div>
          )}
          <section className="academy-lesson-notes">
            <h2>Lesson notes</h2>
            <RichText document={lesson.description} />
          </section>
          {assets.length > 0 && (
            <section className="academy-resources">
              <h2>Your resources</h2>
              {assets.map((asset) => (
                <DownloadAsset key={asset.id} id={asset.id} name={asset.name} />
              ))}
            </section>
          )}
          {next && (
            <Link
              className="academy-button"
              href={`/learn/${courseId}/${next.id}`}
            >
              Next lesson <ArrowRight size={17} />
            </Link>
          )}
        </article>
        <aside className="academy-lesson-sidebar">
          <span className="academy-eyebrow">IN THIS MODULE</span>
          <h2>{module.title}</h2>
          {lessons.map((l, i) => (
            <Link
              key={l.id}
              href={`/learn/${courseId}/${l.id}`}
              className={l.id === lessonId ? "active" : ""}
              aria-current={l.id === lessonId ? "page" : undefined}
            >
              <span>{String(i + 1).padStart(2, "0")}</span>
              {l.title}
              {l.id === lessonId && <Play size={14} />}
            </Link>
          ))}
        </aside>
      </div>
    </main>
  );
}
