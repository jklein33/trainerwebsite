import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseConfigured, supabaseEnvironment } from "@/lib/supabase/env";
import { courseStorageConfig } from "@/lib/courses/config";

export async function proxy(request: NextRequest) {
  const courseUrl = process.env.NEXT_PUBLIC_COURSE_URL;
  if (
    request.nextUrl.pathname === "/checkout" &&
    courseUrl &&
    new URL(courseUrl).host !== request.nextUrl.host
  ) {
    return NextResponse.redirect(new URL("/checkout", courseUrl));
  }
  if (
    request.nextUrl.pathname === "/" &&
    courseUrl &&
    new URL(courseUrl).host === request.nextUrl.host
  ) {
    return NextResponse.redirect(new URL("/learn", request.url));
  }
  let response = NextResponse.next({ request });
  if (!supabaseConfigured()) return response;
  const { url, key } = supabaseEnvironment();
  const db = createServerClient(url, key, {
    db: { schema: courseStorageConfig().schema },
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (values) => {
        values.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        values.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });
  await db.auth.getUser();
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
export const config = {
  matcher: [
    "/",
    "/learn/:path*",
    "/admin/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/auth/:path*",
    "/api/courses/:path*",
    "/api/admin/:path*",
    "/api/auth/:path*",
    "/checkout",
  ],
};
