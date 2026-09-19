export type CourseSchema = "public" | "course_staging";

export function courseStorageConfig(): { schema: CourseSchema; bucket: string } {
  const schema = process.env.NEXT_PUBLIC_COURSE_SCHEMA || "public";
  if (schema !== "public" && schema !== "course_staging") {
    throw new Error("Invalid course schema configuration.");
  }
  return {
    schema,
    bucket: schema === "public" ? "course-media" : "course-staging-media",
  };
}
