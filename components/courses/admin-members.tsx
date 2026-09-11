"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Profile, Course, Entitlement } from "@/lib/courses/types";
import { callApi } from "./ui";
export function AdminMembers({
  members,
  courses,
  grants,
}: {
  members: Profile[];
  courses: Course[];
  grants: Entitlement[];
}) {
  const router = useRouter(),
    [selected, setSelected] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const member = members.find((m) => m.id === selected);
  async function run(body: unknown) {
    setBusy(true);
    setError("");
    try {
      await callApi("/api/admin/members", body);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="academy-members-layout">
      <div className="academy-member-list">
        {members.map((m) => (
          <button
            key={m.id}
            className={m.id === selected ? "active" : ""}
            onClick={() => setSelected(m.id)}
          >
            <strong>{m.display_name || m.email}</strong>
            <span>{m.email}</span>
            <small>{m.suspended ? "Paused" : m.role}</small>
          </button>
        ))}
        {!members.length && <p>No matching members.</p>}
      </div>
      <section className="academy-member-detail">
        {member ? (
          <>
            <h2>{member.display_name || "Member"}</h2>
            <p>{member.email}</p>
            {member.role === "learner" && (
              <button
                disabled={busy}
                className="academy-secondary"
                onClick={() => {
                  if (
                    window.confirm(
                      `${member.suspended ? "Resume" : "Pause"} access for this member?`,
                    )
                  )
                    void run({
                      action: "suspend",
                      userId: member.id,
                      enabled: !member.suspended,
                    });
                }}
              >
                {member.suspended ? "Resume account" : "Pause account"}
              </button>
            )}
            <h3>Course access</h3>
            {grants
              .filter((g) => g.user_id === member.id)
              .map((g) => (
                <div key={g.id} className="academy-access-row">
                  <strong>
                    {courses.find((c) => c.id === g.course_id)?.title ??
                      g.course_id}
                  </strong>
                  <span>
                    {g.source} · {g.active ? "Active" : "Inactive"}
                  </span>
                  {g.note && <small>{g.note}</small>}
                </div>
              ))}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const data = new FormData(e.currentTarget);
                void run({
                  action: "access",
                  userId: member.id,
                  courseId: data.get("course"),
                  enabled: data.get("enabled") === "true",
                  reason: data.get("reason"),
                });
              }}
            >
              <label>
                Course
                <select name="course" required defaultValue="">
                  <option value="" disabled>
                    Select a course
                  </option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Manual access
                <select name="enabled">
                  <option value="true">Grant access</option>
                  <option value="false">Remove manual access</option>
                </select>
                <small>
                  Removing manual access does not cancel a purchase. Pause the
                  account to stop all access.
                </small>
              </label>
              <label>
                Reason
                <input
                  name="reason"
                  required
                  maxLength={500}
                  placeholder="e.g. Existing CC360 member"
                />
              </label>
              <button
                className="academy-button"
                disabled={busy || !courses.length}
              >
                {busy ? "Saving…" : "Update access"}
              </button>
            </form>
          </>
        ) : (
          <div className="academy-empty">
            <h2>Select a member.</h2>
            <p>Review course access and manage their account.</p>
          </div>
        )}
        {error && (
          <p className="academy-error" role="alert">
            {error}
          </p>
        )}
      </section>
    </div>
  );
}
