import Link from "next/link";
import { pageContext, checked } from "@/lib/courses/server";
import { supabaseConfigured } from "@/lib/supabase/env";
import { SetupNotice } from "@/components/courses/setup-notice";
import { AdminMembers } from "@/components/courses/admin-members";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  if (!supabaseConfigured()) return <SetupNotice />;
  const { db } = await pageContext(true),
    params = await searchParams,
    q = (params.q ?? "").replace(/[%_,().]/g, "").slice(0, 100),
    page = Math.max(0, Math.min(10000, Number(params.page) || 0));
  let query = db
    .from("course_profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .range(page * 50, page * 50 + 49);
  if (q) query = query.ilike("email", `%${q}%`);
  const members = checked(await query),
    courses = checked(await db.from("courses").select("*").order("title"));
  const grants = members.length
    ? checked(
        await db
          .from("course_entitlements")
          .select("*")
          .in(
            "user_id",
            members.map((m) => m.id),
          ),
      )
    : [];
  return (
    <main>
      <nav className="academy-subnav">
        <Link href="/admin">Courses</Link>
        <Link className="active" href="/admin/members">
          Members
        </Link>
        <Link href="/admin/activity">Activity & payments</Link>
      </nav>
      <div className="academy-page-heading">
        <div>
          <span className="academy-eyebrow">YOUR COMMUNITY</span>
          <h1>People behind the progress.</h1>
        </div>
      </div>
      <form className="academy-inline academy-search">
        <input
          name="q"
          aria-label="Search members by email"
          placeholder="Search by email"
          defaultValue={q}
        />
        <button className="academy-secondary">Search</button>
      </form>
      <AdminMembers members={members} courses={courses} grants={grants} />
      <div className="academy-inline">
        {page > 0 && (
          <Link href={`?q=${encodeURIComponent(q)}&page=${page - 1}`}>
            Previous
          </Link>
        )}
        {members.length === 50 && (
          <Link href={`?q=${encodeURIComponent(q)}&page=${page + 1}`}>
            Next 50 members
          </Link>
        )}
      </div>
    </main>
  );
}
