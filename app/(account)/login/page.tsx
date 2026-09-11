import { AuthForm } from "@/components/courses/auth-form";
import { supabaseConfigured } from "@/lib/supabase/env";
import { safeReturnPath } from "@/lib/courses/validation";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  return (
    <AuthForm
      mode="signin"
      next={safeReturnPath(params.next)}
      configured={supabaseConfigured()}
      errorHint={params.error}
    />
  );
}
