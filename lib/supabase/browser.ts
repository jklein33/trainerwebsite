"use client";
import { createBrowserClient } from "@supabase/ssr";
import { supabaseEnvironment } from "./env";
import type { Database } from "@/lib/courses/types";
import { courseStorageConfig, type CourseSchema } from "@/lib/courses/config";
export function browserClient() {
  const { url, key } = supabaseEnvironment();
  return createBrowserClient<Database, CourseSchema>(url, key, {
    db: { schema: courseStorageConfig().schema },
  });
}
