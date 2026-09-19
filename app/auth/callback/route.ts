import { NextResponse } from "next/server";
import { serverClient } from "@/lib/supabase/server";
import { safeReturnPath } from "@/lib/courses/validation";
import { requestOrigin } from "@/lib/courses/request-origin";
export async function GET(request: Request) {
  const url = new URL(request.url),
    code = url.searchParams.get("code");
  const origin = requestOrigin(request);
  let errorHint = "link-invalid";
  if (code) {
    try {
      const db = await serverClient();
      const { error } = await db.auth.exchangeCodeForSession(code);
      if (!error)
        return NextResponse.redirect(
          new URL(safeReturnPath(url.searchParams.get("next")), origin),
        );
      if (
        error.code === "pkce_code_verifier_not_found" ||
        error.code === "bad_code_verifier"
      ) {
        errorHint = "link-browser";
      }
    } catch {}
  }
  return NextResponse.redirect(
    new URL(`/login?error=${errorHint}`, origin),
  );
}
