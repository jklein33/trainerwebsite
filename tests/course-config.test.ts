import { test } from "node:test";
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";
import { courseStorageConfig, type CourseSchema } from "../lib/courses/config";
import type { Database } from "../lib/courses/types";

test("schema and bucket stay paired; REST reads, writes and RPCs use the selected schema", async () => {
  const previous = process.env.NEXT_PUBLIC_COURSE_SCHEMA;
  try {
    for (const schema of ["public", "course_staging"] as const) {
      process.env.NEXT_PUBLIC_COURSE_SCHEMA = schema;
      const config = courseStorageConfig();
      assert.equal(
        config.bucket,
        schema === "public" ? "course-media" : "course-staging-media",
      );
      const requests: { method: string; headers: Headers }[] = [];
      const db = createClient<Database, CourseSchema>(
        "https://example.supabase.co",
        "test-key",
        {
          db: { schema: config.schema },
          auth: { persistSession: false, autoRefreshToken: false },
          global: {
            fetch: async (_input, init) => {
              requests.push({
                method: init?.method ?? "GET",
                headers: new Headers(init?.headers),
              });
              return new Response("[]", {
                headers: { "Content-Type": "application/json" },
              });
            },
          },
        },
      );
      await db.from("courses").select("id");
      await db.from("courses").insert({ title: "Fixture" });
      await db.rpc("course_is_admin");
      assert.equal(requests.length, 3);
      for (const request of requests) {
        assert.equal(
          request.headers.get(
            request.method === "GET" ? "Accept-Profile" : "Content-Profile",
          ),
          schema,
        );
      }
    }
    delete process.env.NEXT_PUBLIC_COURSE_SCHEMA;
    assert.equal(courseStorageConfig().schema, "public");
    process.env.NEXT_PUBLIC_COURSE_SCHEMA = "typo";
    assert.throws(() => courseStorageConfig(), /Invalid course schema/);
  } finally {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_COURSE_SCHEMA;
    else process.env.NEXT_PUBLIC_COURSE_SCHEMA = previous;
  }
});
