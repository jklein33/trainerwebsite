import "server-only";
import { serverClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";
import { redirect } from "next/navigation";

export class CourseError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export async function context(admin = false) {
  if (!supabaseConfigured())
    throw new CourseError(
      "The course platform is being prepared. Please check back soon.",
      503,
    );
  const db = await serverClient();
  const {
    data: { user },
    error,
  } = await db.auth.getUser();
  if (error || !user) throw new CourseError("Please sign in to continue.", 401);
  if (!user.email_confirmed_at)
    throw new CourseError("Please confirm your email address.", 403);
  const { data: profile, error: profileError } = await db
    .from("course_profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  if (profileError || !profile)
    throw new CourseError(
      "Your account could not be loaded. Please try again.",
      503,
    );
  if (profile.suspended)
    throw new CourseError(
      "Your account is paused. Please contact support.",
      403,
    );
  if (admin && profile.role !== "admin")
    throw new CourseError("Administrator access is required.", 403);
  return { db, user, profile };
}
export async function pageContext(admin = false) {
  try {
    return await context(admin);
  } catch (error) {
    if (error instanceof CourseError && error.status === 401)
      redirect(`/login?next=${admin ? "/admin" : "/learn"}`);
    if (error instanceof CourseError && error.status === 403)
      redirect("/login?error=access");
    throw error;
  }
}
export function requireSameOrigin(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin)
    throw new CourseError("Invalid request origin.", 403);
}
export async function readBody(request: Request) {
  if (Number(request.headers.get("content-length")) > 110000)
    throw new CourseError("Request is too large.", 413);
  const body = await request.text();
  if (body.length > 110000) throw new CourseError("Request is too large.", 413);
  try {
    return JSON.parse(body);
  } catch {
    throw new CourseError("Invalid request.");
  }
}
export function apiError(error: unknown) {
  if (error instanceof CourseError)
    return Response.json({ error: error.message }, { status: error.status });
  console.error(
    "Course request failed:",
    error instanceof Error ? error.message : "Unknown error",
  );
  return Response.json(
    {
      error: "Unable to complete this request. Check your input and try again.",
    },
    { status: 400 },
  );
}
export function checked<
  T extends { data: unknown; error: { message: string } | null },
>(result: T): Extract<T, { error: null }>["data"] {
  if (result.error) throw new Error(result.error.message);
  return result.data as Extract<T, { error: null }>["data"];
}
