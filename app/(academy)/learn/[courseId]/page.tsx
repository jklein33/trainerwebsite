import Link from "next/link";
import { notFound } from "next/navigation";
import { Play, ArrowLeft, Lock } from "lucide-react";
import { pageContext, checked } from "@/lib/courses/server";
import { supabaseConfigured } from "@/lib/supabase/env";
import { SetupNotice } from "@/components/courses/setup-notice";
import { MediaImage, PurchaseButton } from "@/components/courses/ui";
import { ModuleMap } from "@/components/courses/module-map";
export default async function CoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  if (!supabaseConfigured()) return <SetupNotice />;
  const { courseId } = await params,
    { db } = await pageContext();
  const { data: course } = await db
    .from("courses")
    .select("*")
    .eq("id", courseId)
    .single();
  if (!course) notFound();
  const owned = checked(await db.rpc("course_can_read", { target: courseId }));
  const modules = owned
    ? checked(
        await db
          .from("course_modules")
          .select("*")
          .eq("course_id", courseId)
          .eq("status", "published")
          .order("position")
          .order("created_at"),
      )
    : [];
  const lessons = modules.length
    ? checked(
        await db
          .from("course_lessons")
          .select("id,module_id,title,position")
          .in(
            "module_id",
            modules.map((m) => m.id),
          )
          .eq("status", "published")
          .order("position")
          .order("created_at"),
      )
    : [];
  return (
    <main>
      <Link className="academy-back" href="/learn">
        <ArrowLeft size={15} /> All courses
      </Link>
      <section className="academy-course-hero">
        <div>
          <span className="academy-eyebrow">DAWG STRENGTH / COURSE</span>
          <h1>{course.title}</h1>
          <p>{course.summary}</p>
          {!owned ? (
            <PurchaseButton courseId={courseId} />
          ) : (
            <span className="academy-pill">Your access is active</span>
          )}
        </div>
        <MediaImage id={course.thumbnail_asset_id} alt={course.title} />
      </section>
      {owned ? (
        <>
          <div className="academy-section-heading">
            <h2>Your curriculum</h2>
            <span>
              {modules.length} modules · {lessons.length} lessons
            </span>
          </div>
          <ModuleMap modules={modules} />
          {!modules.length && (
            <div className="academy-empty">
              <h2>Lessons are on their way.</h2>
              <p>
                You have access. New modules will appear here as they are
                published.
              </p>
            </div>
          )}
          <div className="academy-modules">
            {modules.map((module, index) => (
              <section
                id={`module-${module.id}`}
                key={module.id}
                className="academy-module"
              >
                <div className="academy-module-heading">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{module.title}</h3>
                </div>
                {lessons
                  .filter((l) => l.module_id === module.id)
                  .map((lesson, i) => (
                    <Link
                      key={lesson.id}
                      href={`/learn/${courseId}/${lesson.id}`}
                      className="academy-lesson-link"
                    >
                      <span>{String(i + 1).padStart(2, "0")}</span>
                      <strong>{lesson.title}</strong>
                      <Play size={17} />
                    </Link>
                  ))}
              </section>
            ))}
          </div>
        </>
      ) : (
        <div className="academy-notice">
          <Lock size={18} /> Purchase this course to unlock its videos, notes
          and resources.
        </div>
      )}
    </main>
  );
}
