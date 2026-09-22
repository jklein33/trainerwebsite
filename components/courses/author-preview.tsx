"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowRight, Eye, Play, X } from "lucide-react";
import type {
  Asset,
  Attachment,
  Course,
  Lesson,
  Module,
} from "@/lib/courses/types";
import { CourseHero, LessonContent } from "./learner-content";

export type AuthorPreviewData = {
  course: Pick<Course, "title" | "summary" | "thumbnail_asset_id" | "status">;
  modules: Module[];
  lessons: Lesson[];
  assets: Asset[];
  attachments: Attachment[];
  initialLessonId?: string;
  unsaved?: boolean;
  pending?: boolean;
};

export function AuthorPreview({
  data,
  onClose,
}: {
  data: AuthorPreviewData;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const navigated = useRef(false);
  const [lessonId, setLessonId] = useState(data.initialLessonId);
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const element = dialog.current;
    const opener = document.activeElement;
    element?.showModal();
    closeButton.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      element?.close();
      document.body.style.overflow = overflow;
      if (opener instanceof HTMLElement && opener.isConnected)
        opener.focus({ preventScroll: true });
    };
  }, []);
  useEffect(() => {
    if (!navigated.current) return;
    content.current?.focus({ preventScroll: true });
    dialog.current
      ?.querySelector(".academy-preview-scroll")
      ?.scrollTo({ top: 0 });
  }, [lessonId]);
  const selected = data.lessons.find((lesson) => lesson.id === lessonId);
  const sort = (a: Module | Lesson, b: Module | Lesson) =>
    a.position - b.position || a.created_at.localeCompare(b.created_at);
  const modules = data.modules
    .filter(
      (module) =>
        module.status !== "archived" || module.id === selected?.module_id,
    )
    .toSorted(sort);
  const lessons = data.lessons
    .filter(
      (lesson) =>
        (lesson.status !== "archived" || lesson.id === lessonId) &&
        modules.some((module) => module.id === lesson.module_id),
    )
    .toSorted(sort);
  const currentModule = modules.find(
    (module) => module.id === selected?.module_id,
  );
  const siblings = lessons.filter(
    (lesson) => lesson.module_id === selected?.module_id,
  );
  const next =
    siblings[siblings.findIndex((lesson) => lesson.id === lessonId) + 1];
  function navigate(id?: string) {
    navigated.current = true;
    setLessonId(id);
    dialog.current
      ?.querySelector(".academy-preview-scroll")
      ?.scrollTo({ top: 0 });
  }
  const resourceIds = data.attachments
    .filter((link) => link.lesson_id === selected?.id)
    .map((link) => link.asset_id);
  return createPortal(
    <dialog
      ref={dialog}
      className="academy academy-preview-dialog"
      aria-labelledby="author-preview-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <header className="academy-preview-toolbar">
        <div>
          <h2 id="author-preview-title">
            <Eye size={18} /> {selected ? "Lesson preview" : "Course preview"}
          </h2>
          <p>
            {data.unsaved ? "Includes unsaved edits. " : ""}Admin only · Drafts
            included · Nothing is published by previewing.
          </p>
        </div>
        <div className="academy-inline">
          <button
            type="button"
            className="academy-secondary"
            aria-pressed={narrow}
            onClick={() => setNarrow(!narrow)}
          >
            {narrow ? "Full width" : "Mobile width"}
          </button>
          <button
            type="button"
            ref={closeButton}
            className="academy-button"
            onClick={onClose}
          >
            <X size={17} /> Close preview
          </button>
        </div>
      </header>
      <div className="academy-preview-scroll">
        <div
          ref={content}
          tabIndex={-1}
          className={`academy-preview-content ${narrow ? "is-narrow" : ""}`}
        >
          {data.pending && (
            <p className="academy-notice">
              Uploads are still pending. Finish uploading and reopen the preview
              to see the new files.
            </p>
          )}
          <span
            className={`academy-status ${selected?.status ?? data.course.status}`}
          >
            {selected?.status ?? data.course.status}
          </span>
          {selected ? (
            <>
              <button
                type="button"
                className="academy-back"
                onClick={() => navigate()}
              >
                <ArrowLeft size={15} /> Back to course
              </button>
              <div className="academy-lesson-layout">
                <article>
                  <LessonContent
                    lesson={selected}
                    moduleTitle={currentModule?.title ?? "New module"}
                    assets={data.assets.filter(
                      (asset) =>
                        resourceIds.includes(asset.id) &&
                        asset.status === "ready",
                    )}
                    preview
                  />
                  {next && (
                    <button
                      type="button"
                      className="academy-button"
                      onClick={() => navigate(next.id)}
                    >
                      Next lesson <ArrowRight size={17} />
                    </button>
                  )}
                </article>
                <aside className="academy-lesson-sidebar">
                  <span className="academy-eyebrow">IN THIS MODULE</span>
                  <h2>{currentModule?.title}</h2>
                  {siblings.map((lesson, index) => (
                    <button
                      type="button"
                      key={lesson.id}
                      className={lesson.id === lessonId ? "active" : ""}
                      aria-current={lesson.id === lessonId ? "page" : undefined}
                      onClick={() => navigate(lesson.id)}
                    >
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      {lesson.title}
                      {lesson.id === lessonId && <Play size={14} />}
                    </button>
                  ))}
                </aside>
              </div>
            </>
          ) : (
            <>
              <CourseHero course={data.course}>
                <span className="academy-pill">Learner preview</span>
              </CourseHero>
              <div className="academy-section-heading">
                <h2>Your curriculum</h2>
                <span>
                  {modules.length} modules · {lessons.length} lessons
                </span>
              </div>
              {!modules.length && (
                <div className="academy-empty">
                  <h2>No modules yet.</h2>
                  <p>
                    Add modules and lessons to preview your curriculum here.
                  </p>
                </div>
              )}
              <div className="academy-modules">
                {modules.map((module, index) => (
                  <section key={module.id} className="academy-module">
                    <div className="academy-module-heading">
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <h3>{module.title}</h3>
                      <small className={`academy-status ${module.status}`}>
                        {module.status}
                      </small>
                    </div>
                    {lessons
                      .filter((lesson) => lesson.module_id === module.id)
                      .map((lesson, i) => (
                        <button
                          type="button"
                          key={lesson.id}
                          className="academy-lesson-link"
                          onClick={() => navigate(lesson.id)}
                        >
                          <span>{String(i + 1).padStart(2, "0")}</span>
                          <strong>{lesson.title}</strong>
                          <small className={`academy-status ${lesson.status}`}>
                            {lesson.status}
                          </small>
                          <Play size={17} />
                        </button>
                      ))}
                    {!lessons.some(
                      (lesson) => lesson.module_id === module.id,
                    ) && (
                      <p className="academy-muted academy-preview-empty">
                        No lessons yet.
                      </p>
                    )}
                  </section>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </dialog>,
    document.body,
  );
}
