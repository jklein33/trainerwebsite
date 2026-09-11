import { pageContext, checked } from "@/lib/courses/server";
import { supabaseConfigured } from "@/lib/supabase/env";
import { SetupNotice } from "@/components/courses/setup-notice";
import { AdminCatalog } from "@/components/courses/admin-catalog";
import Link from "next/link";
export default async function Page() {
  if (!supabaseConfigured()) return <SetupNotice />;
  const { db } = await pageContext(true);
  const courses = checked(
    await db.from("courses").select("*").order("position").order("created_at"),
  );
  return (
    <main>
      <nav className="academy-subnav">
        <Link className="active" href="/admin">
          Courses
        </Link>
        <Link href="/admin/members">Members</Link>
        <Link href="/admin/activity">Activity & payments</Link>
      </nav>
      <AdminCatalog courses={courses} />
    </main>
  );
}
