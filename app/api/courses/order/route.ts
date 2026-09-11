import { context, apiError, checked } from "@/lib/courses/server";
export async function GET(request: Request) {
  try {
    const { db, user } = await context();
    const session = new URL(request.url).searchParams.get("session_id") ?? "";
    if (!/^cs_[A-Za-z0-9_]+$/.test(session))
      return Response.json({ error: "Invalid checkout." }, { status: 400 });
    const data = checked(
      await db
        .from("course_orders")
        .select("status,course_id")
        .eq("checkout_session_id", session)
        .eq("user_id", user.id)
        .maybeSingle(),
    );
    return Response.json(
      { order: data },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return apiError(error);
  }
}
