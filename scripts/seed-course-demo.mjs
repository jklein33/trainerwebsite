import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";
import { chromium } from "@playwright/test";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

// Development fixture only. Explicit project and existing member IDs prevent
// accidentally seeding whichever project happens to be configured locally.
nextEnv.loadEnvConfig(process.cwd(), true, { info() {}, error() {} });
const args = process.argv.slice(2);
const option = (name) => args[args.indexOf(name) + 1];
const project = args.includes("--project-ref") && option("--project-ref");
const learner = args.includes("--learner-id") && option("--learner-id");
const contentOnly = args.includes("--content-only");
if (!project || Boolean(learner) === contentOnly || !args.includes("--apply")) {
  throw new Error(
    "Usage: node scripts/seed-course-demo.mjs --project-ref <DEV_REF> (--learner-id <EXISTING_USER_UUID> | --content-only) --apply",
  );
}
const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
const schema = process.env.NEXT_PUBLIC_COURSE_SCHEMA || "public";
if (schema !== "public" && schema !== "course_staging") {
  throw new Error("Refusing to seed an unsupported course schema.");
}
const mediaBucket =
  schema === "public" ? "course-media" : "course-staging-media";
if (
  url.origin !== `https://${project}.supabase.co` ||
  process.env.NODE_ENV === "production"
) {
  throw new Error("Refusing to seed: development project does not match.");
}
const db = createClient(url.origin, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  db: { schema },
  auth: { persistSession: false, autoRefreshToken: false },
  global: {
    fetch: (input, init) =>
      fetch(input, {
        ...init,
        redirect: "error",
        signal: AbortSignal.timeout(60000),
      }),
  },
});
function checked(result, operation) {
  if (result.error)
    throw new Error(
      `${operation} failed (${result.error.code ?? result.error.status ?? "unknown"}).`,
    );
  return result.data;
}
function id(label) {
  const hex = createHash("sha256")
    .update(`course-demo-v1:${label}`)
    .digest("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}
async function insertMissing(table, row) {
  checked(
    await db
      .from(table)
      .upsert(row, { onConflict: "id", ignoreDuplicates: true }),
    `Insert ${table}`,
  );
}

let member = null;
if (learner) {
  member = checked(
    await db
      .from("course_profiles")
      .select("id,role,suspended")
      .eq("id", learner)
      .single(),
    "Read member",
  );
  const auth = checked(
    await db.auth.admin.getUserById(learner),
    "Check confirmed member",
  );
  if (member.suspended || !auth.user.email_confirmed_at)
    throw new Error("Choose an active, confirmed member.");
}
checked(
  await db.from("courses").select("id").limit(1),
  "Check course schema access",
);
const bucket = checked(await db.storage.getBucket(mediaBucket), "Read bucket");
if (bucket.public) throw new Error("The course media bucket must be private.");

const mediaDir = path.join(process.cwd(), "client-notes", "demo-media");
await mkdir(mediaDir, { recursive: true });
let clip;
let worksheet;
try {
  clip = await readFile(path.join(mediaDir, "sample-lesson.mp4"));
  worksheet = await readFile(path.join(mediaDir, "weekly-planner.png"));
} catch {
  /* Generate the local fixtures on the first run. */
}
if (!clip || !worksheet) {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({
      viewport: { width: 1000, height: 780 },
    });
    clip = Buffer.from(
      await page.evaluate(async () => {
        const type = "video/mp4;codecs=avc1.42E01E";
        if (!MediaRecorder.isTypeSupported(type))
          throw new Error("MP4 recording is unavailable.");
        const canvas = document.createElement("canvas");
        canvas.width = 960;
        canvas.height = 540;
        const ctx = canvas.getContext("2d");
        const stream = canvas.captureStream(24);
        const recorder = new MediaRecorder(stream, {
          mimeType: type,
          videoBitsPerSecond: 600000,
        });
        const chunks = [];
        const finished = new Promise((resolve, reject) => {
          recorder.ondataavailable = (event) => {
            if (event.data.size) chunks.push(event.data);
          };
          recorder.onstop = async () =>
            resolve(
              Array.from(
                new Uint8Array(
                  await new Blob(chunks, { type: "video/mp4" }).arrayBuffer(),
                ),
              ),
            );
          recorder.onerror = reject;
        });
        const draw = (progress) => {
          ctx.fillStyle = "#111513";
          ctx.fillRect(0, 0, 960, 540);
          ctx.fillStyle = "#d3f36b";
          ctx.font = "bold 18px sans-serif";
          ctx.fillText("DAWG STRENGTH / DEVELOPMENT DEMO", 60, 90);
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 52px sans-serif";
          ctx.fillText("Your course starts here.", 60, 220);
          ctx.fillStyle = "#b9c0ba";
          ctx.font = "24px sans-serif";
          ctx.fillText(
            "Sample video for upload and playback testing.",
            60,
            280,
          );
          ctx.fillText("No coaching instruction. No audio.", 60, 320);
          ctx.fillStyle = "#30372f";
          ctx.fillRect(60, 410, 840, 8);
          ctx.fillStyle = "#d3f36b";
          ctx.fillRect(60, 410, 840 * progress, 8);
          ctx.font = "18px sans-serif";
          ctx.fillText(
            `${Math.min(5, Math.floor(progress * 5))} / 5 seconds`,
            60,
            460,
          );
        };
        draw(0);
        recorder.start();
        const start = performance.now();
        await new Promise((resolve) => {
          const timer = setInterval(() => {
            const progress = Math.min(1, (performance.now() - start) / 5000);
            draw(progress);
            if (progress === 1) {
              clearInterval(timer);
              resolve();
            }
          }, 1000 / 24);
        });
        recorder.stop();
        const bytes = await finished;
        stream.getTracks().forEach((track) => track.stop());
        return bytes;
      }),
    );
    await page.setContent(
      `<html lang="en"><body style="margin:0;background:#f5f3eb;font-family:Arial,sans-serif;color:#17221b;padding:64px;box-sizing:border-box"><p style="letter-spacing:3px;font-size:14px">DAWG STRENGTH / DEMO RESOURCE</p><h1 style="font-size:48px;margin-bottom:16px">Weekly training planner</h1><p style="font-size:20px">Sample worksheet for testing lesson attachments.</p><table style="width:100%;border-collapse:collapse;margin-top:48px;font-size:20px"><tr><th align="left">Day</th><th align="left">Session / notes</th></tr>${["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => `<tr><td style="padding:20px 0;border-bottom:1px solid #abb6a8">${day}</td><td style="border-bottom:1px solid #abb6a8">________________________________</td></tr>`).join("")}</table><p style="margin-top:40px">Development fixture only. Replace with approved course materials.</p></body></html>`,
    );
    worksheet = await page.screenshot({ type: "png" });
  } finally {
    await browser.close();
  }
  await writeFile(path.join(mediaDir, "sample-lesson.mp4"), clip);
  await writeFile(path.join(mediaDir, "weekly-planner.png"), worksheet);
}
console.log("Generated a short MP4 and an English sample worksheet.");

const fixtures = [
  {
    title: "Strength Foundations",
    summary:
      "Build a consistent training routine, explore the main movement patterns, and plan your first week.",
    image: "ambitious-studio-rick-barrett-wZlsHihO2g4-unsplash.jpg",
    modules: [
      [
        "Start with a plan",
        "Welcome and course overview",
        "Set your training priorities",
        "Plan your first week",
      ],
      [
        "Movement fundamentals",
        "Understanding the squat pattern",
        "Understanding the hinge pattern",
        "Review and next steps",
      ],
    ],
  },
  {
    title: "Nutrition & Recovery",
    summary:
      "Organize everyday habits, review your recovery routine, and keep a simple weekly journal.",
    image: "james_pose.jpg",
    modules: [
      [
        "Everyday foundations",
        "Welcome to your habit journal",
        "Build a repeatable routine",
        "Prepare your weekly checklist",
      ],
      [
        "Recovery and reflection",
        "Track your recovery habits",
        "Review your weekly journal",
        "Choose your next focus",
      ],
    ],
  },
  {
    title: "Hypertrophy Essentials",
    summary:
      "Preview a course you have not unlocked. This demo has no Stripe price and cannot be purchased yet.",
    image: "classic_stage.jpg",
    modules: [
      [
        "Program structure",
        "Welcome to the course",
        "Read a sample training week",
        "Track your sessions",
      ],
      [
        "Progress review",
        "Keep useful session notes",
        "Review consistency",
        "Plan the next training block",
      ],
    ],
  },
  {
    title: "Coach Workshop",
    summary:
      "An unpublished course for testing the admin editor, draft lessons, and media management.",
    image: "IMG_2103.jpeg",
    modules: [
      [
        "Workshop preparation",
        "Draft welcome lesson",
        "Draft workshop agenda",
        "Draft resource walkthrough",
      ],
      [
        "Coaching workflow",
        "Draft check-in process",
        "Draft review session",
        "Draft course wrap-up",
      ],
    ],
  },
];
const assets = [];
async function addAsset(courseId, label, name, kind, mime, bytes) {
  const assetId = id(label);
  const assetPath = `${courseId}/${assetId}.${name.split(".").at(-1)}`;
  await insertMissing("course_assets", {
    id: assetId,
    course_id: courseId,
    name,
    kind,
    mime_type: mime,
    size_bytes: bytes.length,
    path: assetPath,
    status: "uploading",
  });
  const existing = checked(
    await db.storage
      .from(mediaBucket)
      .list(courseId, { search: assetPath.split("/").at(-1) }),
    "Read storage object",
  );
  const object = existing.find(
    (item) => item.name === assetPath.split("/").at(-1),
  );
  if (!object) {
    checked(
      await db.storage
        .from(mediaBucket)
        .upload(assetPath, bytes, { contentType: mime, upsert: false }),
      "Upload demo media",
    );
  }
  // Check against the persisted row, so reruns do not overwrite edited data.
  const row = checked(
    await db
      .from("course_assets")
      .select("size_bytes,status,path")
      .eq("id", assetId)
      .single(),
    "Read asset",
  );
  const stored = checked(
    await db.storage
      .from(mediaBucket)
      .list(courseId, { search: assetPath.split("/").at(-1) }),
    "Verify storage object",
  ).find((item) => item.name === assetPath.split("/").at(-1));
  if (
    !stored ||
    Number(stored.metadata?.size) !== row.size_bytes ||
    row.path !== assetPath
  )
    throw new Error("Demo asset metadata does not match storage.");
  if (row.status === "uploading")
    checked(
      await db
        .from("course_assets")
        .update({ status: "ready" })
        .eq("id", assetId)
        .eq("status", "uploading"),
      "Complete demo asset",
    );
  assets.push({ id: assetId, path: assetPath, kind, size: row.size_bytes });
  return assetId;
}
const courseIds = [];
for (const [courseIndex, course] of fixtures.entries()) {
  const courseId = id(`course:${courseIndex}`);
  courseIds.push(courseId);
  await insertMissing("courses", {
    id: courseId,
    title: `${course.title} · Demo`,
    summary: `DEVELOPMENT DEMO — ${course.summary}`,
    status: courseIndex === 3 ? "draft" : "published",
    position: courseIndex,
  });
  const thumbnail = await addAsset(
    courseId,
    `thumbnail:${courseIndex}`,
    "demo-thumbnail.jpg",
    "image",
    "image/jpeg",
    await readFile(path.join(process.cwd(), "public", "images", course.image)),
  );
  const video = await addAsset(
    courseId,
    `video:${courseIndex}`,
    "demo-sample-lesson.mp4",
    "video",
    "video/mp4",
    clip,
  );
  const attachment = await addAsset(
    courseId,
    `resource:${courseIndex}`,
    "demo-weekly-planner.png",
    "attachment",
    "image/png",
    worksheet,
  );
  checked(
    await db
      .from("courses")
      .update({ thumbnail_asset_id: thumbnail })
      .eq("id", courseId)
      .is("thumbnail_asset_id", null),
    "Attach thumbnail",
  );
  for (const [moduleIndex, module] of course.modules.entries()) {
    const moduleId = id(`module:${courseIndex}:${moduleIndex}`);
    await insertMissing("course_modules", {
      id: moduleId,
      course_id: courseId,
      title: module[0],
      position: moduleIndex,
      status: courseIndex === 3 ? "draft" : "published",
    });
    for (const [lessonIndex, title] of module.slice(1).entries()) {
      const lessonId = id(
        `lesson:${courseIndex}:${moduleIndex}:${lessonIndex}`,
      );
      const paragraph = (text) => ({
        type: "paragraph",
        content: [{ type: "text", text }],
      });
      await insertMissing("course_lessons", {
        id: lessonId,
        module_id: moduleId,
        title,
        position: lessonIndex,
        status:
          courseIndex === 3 || (moduleIndex === 1 && lessonIndex === 2)
            ? "draft"
            : "published",
        video_asset_id: video,
        description: {
          type: "doc",
          content: [
            {
              type: "heading",
              attrs: { level: 2 },
              content: [{ type: "text", text: title }],
            },
            paragraph(
              "This is sample course content for development and review. The five-second video tests playback only; it does not contain coaching instruction.",
            ),
            {
              type: "heading",
              attrs: { level: 3 },
              content: [{ type: "text", text: "Try this page" }],
            },
            {
              type: "bulletList",
              content: [
                "Play and pause the sample video.",
                "Open the attached weekly planner.",
                "Use the module list to move to another lesson.",
              ].map((text) => ({
                type: "listItem",
                content: [paragraph(text)],
              })),
            },
            paragraph(
              "Replace this demo with client-approved lessons and resources before launch.",
            ),
          ],
        },
      });
      if (lessonIndex === 0)
        await insertMissing("course_attachments", {
          id: id(`attachment:${courseIndex}:${moduleIndex}`),
          lesson_id: lessonId,
          asset_id: attachment,
        });
    }
  }
  if (learner && courseIndex < 2)
    await insertMissing("course_entitlements", {
      id: id(`grant:${learner}:${courseIndex}`),
      user_id: learner,
      course_id: courseId,
      source: "manual",
      source_id: `demo-v1:${learner}:${courseId}`,
      active: true,
      note: "Development demo access. No purchase or payment was made.",
    });
  console.log(
    `Ready: ${course.title} (${courseIndex === 3 ? "draft" : "published"}).`,
  );
}
await writeFile(
  path.join(mediaDir, `seed-manifest-${project}-${schema}.json`),
  JSON.stringify(
    {
      fixture: "course-demo-v1",
      project,
      schema,
      bucket: mediaBucket,
      courseIds,
      assets,
    },
    null,
    2,
  ),
);
console.log(
  JSON.stringify({
    courses: 4,
    publishedCourses: 3,
    modules: 8,
    lessons: 24,
    publishedLessons: 15,
    attachments: 8,
    assets: assets.length,
    manualGrants: learner ? 2 : 0,
    memberRole: member?.role ?? null,
    uploadedBytes: assets.reduce((sum, asset) => sum + asset.size, 0),
  }),
);
