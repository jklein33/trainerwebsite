import Link from "next/link";
import { pageContext, checked } from "@/lib/courses/server";
import { supabaseConfigured } from "@/lib/supabase/env";
import { SetupNotice } from "@/components/courses/setup-notice";
import { RetryPayment } from "@/components/courses/retry-payment";
export default async function Page() {
  if (!supabaseConfigured()) return <SetupNotice />;
  const { db } = await pageContext(true);
  const [events, audit] = await Promise.all([
    db
      .from("course_payment_events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100),
    db
      .from("course_audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100),
  ]);
  return (
    <main>
      <nav className="academy-subnav">
        <Link href="/admin">Courses</Link>
        <Link href="/admin/members">Members</Link>
        <Link className="active" href="/admin/activity">
          Activity & payments
        </Link>
      </nav>
      <div className="academy-page-heading">
        <div>
          <span className="academy-eyebrow">OPERATIONS</span>
          <h1>Keep things moving.</h1>
          <p className="academy-muted">
            The latest 100 payment events and administrative changes.
          </p>
        </div>
      </div>
      <h2>Payment events</h2>
      <div className="academy-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Event</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {checked(events).map((event) => (
              <tr key={event.id}>
                <td>
                  {new Date(event.created_at).toLocaleString("en-US", {
                    timeZone: "UTC",
                  })}{" "}
                  UTC
                </td>
                <td>
                  {event.type}
                  <small>{event.id}</small>
                </td>
                <td>
                  {event.status}
                  {event.error && <small>{event.error}</small>}
                </td>
                <td>
                  {event.status === "failed" && (
                    <RetryPayment eventId={event.id} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!events.data?.length && (
          <p className="academy-muted">No payment events yet.</p>
        )}
      </div>
      <h2>Change history</h2>
      <div className="academy-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Change</th>
              <th>Item</th>
              <th>Actor</th>
            </tr>
          </thead>
          <tbody>
            {checked(audit).map((entry) => (
              <tr key={entry.id}>
                <td>
                  {new Date(entry.created_at).toLocaleString("en-US", {
                    timeZone: "UTC",
                  })}{" "}
                  UTC
                </td>
                <td>{entry.action}</td>
                <td>
                  {entry.table_name}
                  <small>{entry.record_id}</small>
                </td>
                <td>{entry.actor_id ?? "System"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
