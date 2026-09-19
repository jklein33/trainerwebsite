import "server-only";
import { createClient } from "@supabase/supabase-js";
import { supabaseEnvironment } from "./env";
import type { Database } from "@/lib/courses/types";
import { courseStorageConfig, type CourseSchema } from "@/lib/courses/config";

export function serviceClient() {
  const { url } = supabaseEnvironment();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("Course services are not configured.");
  return createClient<Database, CourseSchema>(url, key, {
    db: { schema: courseStorageConfig().schema },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
