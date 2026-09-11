import { NextResponse } from "next/server";
import { serverClient } from "@/lib/supabase/server";
import { safeReturnPath } from "@/lib/courses/validation";
export async function GET(request: Request) {
  const url = new URL(request.url),
    code = url.searchParams.get("code");
  if (code) {
    try {
      const db = await serverClient();
      const { error } = await db.auth.exchangeCodeForSession(code);
      if (!error)
        return NextResponse.redirect(
          new URL(safeReturnPath(url.searchParams.get("next")), url.origin),
        );
    } catch {}
  }
  return NextResponse.redirect(
    new URL("/login?error=link-expired", url.origin),
  );
}
