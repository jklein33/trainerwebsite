import { z } from "zod";
import { serverClient } from "@/lib/supabase/server";
import {
  apiError,
  CourseError,
  readBody,
  requireSameOrigin,
} from "@/lib/courses/server";
import { safeReturnPath } from "@/lib/courses/validation";
import { requestOrigin } from "@/lib/courses/request-origin";

const input = z.object({
  action: z.enum(["signup", "signin", "reset", "update", "signout"]),
  email: z.string().email().max(254).optional(),
  password: z.string().min(10).max(128).optional(),
  name: z.string().trim().max(120).optional(),
  next: z.string().optional(),
});
export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const body = input.parse(await readBody(request));
    const db = await serverClient();
    const next = safeReturnPath(body.next);
    const origin = requestOrigin(request);
    if (body.action === "signout") {
      const { error } = await db.auth.signOut();
      if (error) throw error;
      return Response.json({ redirect: "/login" });
    }
    if (body.action === "update") {
      const {
        data: { user },
      } = await db.auth.getUser();
      if (!user || !body.password)
        throw new CourseError("Please open a fresh password reset link.", 401);
      const { error } = await db.auth.updateUser({ password: body.password });
      if (error) throw new CourseError(error.message);
      return Response.json({ redirect: "/learn" });
    }
    if (!body.email) throw new CourseError("Email is required.");
    if (body.action === "reset") {
      const { error } = await db.auth.resetPasswordForEmail(body.email, {
        redirectTo: `${origin}/auth/callback?next=/reset-password`,
      });
      if (error)
        throw new CourseError(
          "Unable to send a reset email. Please try again later.",
        );
      return Response.json({
        message:
          "If an account exists for this email, you will receive a password reset link.",
      });
    }
    if (!body.password) throw new CourseError("Password is required.");
    if (body.action === "signup") {
      const { error } = await db.auth.signUp({
        email: body.email,
        password: body.password,
        options: {
          data: { display_name: body.name ?? "" },
          emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (error) throw new CourseError(error.message);
      return Response.json({
        message:
          "For a new account, check your email and open the confirmation link in this same browser. If you already confirmed your email, sign in with your password instead.",
      });
    }
    const { error } = await db.auth.signInWithPassword({
      email: body.email,
      password: body.password,
    });
    if (error)
      throw new CourseError(
        "Unable to sign in. Check your email and password.",
      );
    return Response.json({ redirect: next });
  } catch (error) {
    return apiError(error);
  }
}
