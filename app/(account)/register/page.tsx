import { AuthForm } from "@/components/courses/auth-form";
import { supabaseConfigured } from "@/lib/supabase/env";
import { safeReturnPath } from "@/lib/courses/validation";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  return (
    <AuthForm
      mode="signup"
      next={safeReturnPath((await searchParams).next)}
      configured={supabaseConfigured()}
    />
  );
}
