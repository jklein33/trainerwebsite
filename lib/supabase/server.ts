import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseEnvironment } from "./env";
import type { Database } from "@/lib/courses/types";
import { courseStorageConfig, type CourseSchema } from "@/lib/courses/config";

export async function serverClient() {
  const { url, key } = supabaseEnvironment();
  const jar = await cookies();
  return createServerClient<Database, CourseSchema>(url, key, {
    db: { schema: courseStorageConfig().schema },
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (values) => {
        try {
          values.forEach(({ name, value, options }) =>
            jar.set(name, value, options),
          );
        } catch {
          /* Server Components cannot write; proxy refreshes cookies. */
        }
      },
    },
  });
}
