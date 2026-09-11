import Link from "next/link";
import { ArrowUpRight, BookOpen } from "lucide-react";
import { pageContext, checked } from "@/lib/courses/server";
import { supabaseConfigured } from "@/lib/supabase/env";
import { SetupNotice } from "@/components/courses/setup-notice";
import { MediaImage } from "@/components/courses/ui";
export default async function LearnPage() {
  if (!supabaseConfigured()) return <SetupNotice />;
  const { db, profile } = await pageContext();
  const [courses, grants] = await Promise.all([
    db
      .from("courses")
      .select("*")
      .eq("status", "published")
      .order("position")
      .order("created_at"),
    db
      .from("course_entitlements")
      .select("*")
      .eq("user_id", profile.id)
      .eq("active", true),
  ]);
  const items = checked(courses),
    access = checked(grants);
  return (
    <main>
      <div className="academy-page-heading">
        <div>
          <span className="academy-eyebrow">YOUR COURSE ROOM</span>
          <h1>Show up. Build forward.</h1>
          <p className="academy-muted">
            {profile.display_name ? `${profile.display_name}, your` : "Your"}{" "}
            next session starts with one lesson.
          </p>
        </div>
        <span className="academy-count">
          <BookOpen size={17} />
          {items.length} courses
        </span>
      </div>
      {!items.length ? (
        <section className="academy-empty">
          <h2>Good things take preparation.</h2>
          <p>Your courses will appear here when they’re ready.</p>
          {profile.role === "admin" && (
            <Link href="/admin" className="academy-button">
              Create your first course
            </Link>
          )}
        </section>
      ) : (
        <div className="academy-course-grid">
          {items.map((course, index) => {
            const owned =
              profile.role === "admin" ||
              access.some(
                (g) =>
                  g.course_id === course.id &&
                  (!g.expires_at || new Date(g.expires_at) > new Date()),
              );
            return (
              <Link
                className="academy-course-card"
                href={`/learn/${course.id}`}
                key={course.id}
              >
                <div className="academy-card-image">
                  <MediaImage
                    id={course.thumbnail_asset_id}
                    alt={course.title}
                  />
                  <span className="academy-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="academy-pill">
                    {owned ? "Your course" : "Explore course"}
                  </span>
                </div>
                <div className="academy-card-body">
                  <h2>{course.title}</h2>
                  <p>
                    {course.summary || "A clear path from knowledge to action."}
                  </p>
                  <div className="academy-card-action">
                    {owned ? "Enter course" : "View course"}
                    <ArrowUpRight size={20} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
