import type { ReactNode } from "react";
import type { Asset, Course, Lesson } from "@/lib/courses/types";
import { MediaImage } from "./ui";
import { CoursePlayer, DownloadAsset } from "./player";
import { RichText } from "./rich-text";

export function CourseHero({
  course,
  children,
}: {
  course: Pick<Course, "title" | "summary" | "thumbnail_asset_id">;
  children?: ReactNode;
}) {
  return (
    <section className="academy-course-hero">
      <div>
        <span className="academy-eyebrow">DAWG STRENGTH / COURSE</span>
        <h1>{course.title}</h1>
        <p>{course.summary}</p>
        {children}
      </div>
      <MediaImage
        key={course.thumbnail_asset_id}
        id={course.thumbnail_asset_id}
        alt={course.title}
      />
    </section>
  );
}

export function LessonContent({
  lesson,
  moduleTitle,
  assets,
  preview = false,
}: {
  lesson: Pick<Lesson, "title" | "video_asset_id" | "description">;
  moduleTitle: string;
  assets: Asset[];
  preview?: boolean;
}) {
  return (
    <>
      <span className="academy-eyebrow">{moduleTitle}</span>
      <h1 className="academy-lesson-title">{lesson.title}</h1>
      {lesson.video_asset_id ? (
        <CoursePlayer
          key={lesson.video_asset_id}
          assetId={lesson.video_asset_id}
          title={lesson.title}
        />
      ) : (
        <div className="academy-notice">
          {preview
            ? "No video selected yet. Add a video in the editor to preview it here."
            : "This video is being updated."}
        </div>
      )}
      <section className="academy-lesson-notes">
        <h2>Lesson notes</h2>
        <RichText document={lesson.description} />
      </section>
      {assets.length > 0 && (
        <section className="academy-resources">
          <h2>Your resources</h2>
          {assets.map((asset) => (
            <DownloadAsset key={asset.id} id={asset.id} name={asset.name} />
          ))}
        </section>
      )}
    </>
  );
}
