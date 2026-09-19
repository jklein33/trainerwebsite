import { notFound } from "next/navigation";
import "@/app/academy.css";
import "./preview.css";
import { LocalCoursePreview } from "@/components/courses/local-preview";

export const metadata = {
  title: "Local preview | Dawg Strength",
  robots: { index: false, follow: false },
};

export default async function PreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; course?: string; lesson?: string }>;
}) {
  // This route never authenticates a user or grants access to real course data.
  if (process.env.NODE_ENV !== "development") notFound();
  const params = await searchParams;
  return (
    <LocalCoursePreview
      key={`${params.view}-${params.course}-${params.lesson}`}
      view={params.view}
      courseIndex={Number(params.course) || 0}
      lessonIndex={Number(params.lesson) || 0}
    />
  );
}
