import { AuthForm } from "@/components/courses/auth-form";
import { supabaseConfigured } from "@/lib/supabase/env";
export default function Page() {
  return (
    <AuthForm mode="update" next="/learn" configured={supabaseConfigured()} />
  );
}
