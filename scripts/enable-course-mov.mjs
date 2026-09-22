import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";

nextEnv.loadEnvConfig(process.cwd(), true, { info() {}, error() {} });
const args = process.argv.slice(2);
const project = args.includes("--project-ref")
  ? args[args.indexOf("--project-ref") + 1]
  : null;
const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
const schema = process.env.NEXT_PUBLIC_COURSE_SCHEMA || "public";
if (
  !project ||
  url.origin !== `https://${project}.supabase.co` ||
  !["public", "course_staging"].includes(schema)
)
  throw new Error(
    "Specify --project-ref matching the configured project and a supported course schema.",
  );
const bucket =
  schema === "course_staging" ? "course-staging-media" : "course-media";
const db = createClient(url.origin, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
  global: {
    fetch: (input, init) =>
      fetch(input, {
        ...init,
        redirect: "error",
        signal: AbortSignal.timeout(30000),
      }),
  },
});
function checked(result) {
  if (result.error)
    throw new Error(
      `Storage request failed (${result.error.status ?? "unknown"}).`,
    );
  return result.data;
}
const before = checked(await db.storage.getBucket(bucket));
if (before.public)
  throw new Error(
    "Expected a private course bucket. No settings were changed.",
  );
const allowed = before.allowed_mime_types;
const needsUpdate = allowed !== null && !allowed.includes("video/quicktime");
console.log(
  JSON.stringify({
    project,
    bucket,
    private: !before.public,
    fileSizeLimit: before.file_size_limit,
    allowedMimeTypes: allowed,
    needsUpdate,
    apply: args.includes("--apply"),
  }),
);
if (args.includes("--apply") && needsUpdate) {
  checked(
    await db.storage.updateBucket(bucket, {
      public: false,
      // Omit unchanged limits: Storage preserves them; resubmission can fail
      // if a historical bucket limit exceeds the current project's global cap.
      allowedMimeTypes: [...allowed, "video/quicktime"],
    }),
  );
  const after = checked(await db.storage.getBucket(bucket));
  if (
    after.public ||
    after.file_size_limit !== before.file_size_limit ||
    !after.allowed_mime_types?.includes("video/quicktime") ||
    !allowed.every((mime) => after.allowed_mime_types.includes(mime))
  )
    throw new Error("Bucket verification failed. Review Storage settings.");
  console.log(
    "MOV enabled. Existing MIME types, size limit, and private access verified.",
  );
}
