import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Play } from "lucide-react";
import { pageContext, checked } from "@/lib/courses/server";
import { supabaseConfigured } from "@/lib/supabase/env";
import { SetupNotice } from "@/components/courses/setup-notice";
import { LessonContent } from "@/components/courses/learner-content";
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
          <LessonContent
            lesson={lesson}
            moduleTitle={module.title}
            assets={assets}
          />
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
