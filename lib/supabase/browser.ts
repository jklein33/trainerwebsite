"use client";
import { createBrowserClient } from "@supabase/ssr";
import { supabaseEnvironment } from "./env";
import type { Database } from "@/lib/courses/types";
export function browserClient() {
  const { url, key } = supabaseEnvironment();
  return createBrowserClient<Database>(url, key);
}
