"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  ArrowLeft,
  ChevronUp,
  ChevronDown,
  Pencil,
  Archive,
  Trash2,
  Paperclip,
} from "lucide-react";
import type {
  Course,
  Module,
  Lesson,
  Asset,
  Attachment,
} from "@/lib/courses/types";
import { callApi } from "./ui";
import { ContentForm } from "./content-form";
import { Uploader } from "./uploader";

type Editing = {
  type: "course" | "module" | "lesson";
  item?: Course | Module | Lesson;
  parentId?: string;
};
export function AdminCourse({
  course,
  modules,
  lessons,
  assets,
  attachments,
}: {
  course: Course;
  modules: Module[];
  lessons: Lesson[];
  assets: Asset[];
  attachments: Attachment[];
}) {
  const router = useRouter(),
    [editing, setEditing] = useState<Editing | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState("");
  async function action(task: () => Promise<unknown>) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await task();
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to complete action.",
      );
    } finally {
      setBusy(false);
    }
  }
  const tableData = (item: Course | Module | Lesson) =>
    "summary" in item
      ? {
          title: item.title,
          summary: item.summary,
          status: item.status,
          position: item.position,
          stripe_price_id: item.stripe_price_id,
          thumbnail_asset_id: item.thumbnail_asset_id,
        }
      : "course_id" in item
        ? {
            title: item.title,
            course_id: item.course_id,
            status: item.status,
            position: item.position,
          }
        : {
            title: item.title,
            module_id: item.module_id,
            status: item.status,
            position: item.position,
            video_asset_id: item.video_asset_id,
            description: item.description,
          };
  function archive(type: Editing["type"], item: Course | Module | Lesson) {
    void action(() =>
      callApi(
        "/api/admin/content",
        { type, id: item.id, data: { ...tableData(item), status: "archived" } },
        "PATCH",
      ),
    );
  }
  function remove(type: Editing["type"], item: Course | Module | Lesson) {
    if (
      !window.confirm(
        `Permanently delete “${item.title}” and its child items? Uploaded files stay in the media library. This cannot be undone.`,
      )
    )
      return;
    void action(async () => {
      await callApi("/api/admin/content", { type, id: item.id }, "DELETE");
      if (type === "course") router.push("/admin");
    });
  }
  async function reorder(
    type: "module" | "lesson",
    items: (Module | Lesson)[],
    index: number,
    direction: number,
  ) {
    const reordered = [...items];
    [reordered[index], reordered[index + direction]] = [
      reordered[index + direction],
      reordered[index],
    ];
    await callApi("/api/admin/reorder", {
      type,
      ids: reordered.map((item) => item.id),
    });
  }
  const controls = (
    type: "module" | "lesson",
    item: Module | Lesson,
    items: (Module | Lesson)[],
    index: number,
  ) => (
    <div className="academy-row-actions">
      <button
        title="Move up"
        aria-label={`Move ${item.title} up`}
        disabled={busy || index === 0}
        onClick={() => void action(() => reorder(type, items, index, -1))}
      >
        <ChevronUp size={16} />
      </button>
      <button
        title="Move down"
        aria-label={`Move ${item.title} down`}
        disabled={busy || index === items.length - 1}
        onClick={() => void action(() => reorder(type, items, index, 1))}
      >
        <ChevronDown size={16} />
      </button>
      <button
        title="Edit"
        aria-label={`Edit ${item.title}`}
        onClick={() =>
          setEditing({
            type,
            item,
            parentId:
              type === "module"
                ? course.id
                : "module_id" in item
                  ? item.module_id
                  : "",
          })
        }
      >
        <Pencil size={15} />
      </button>
      <button
        title="Archive"
        aria-label={`Archive ${item.title}`}
        disabled={busy}
        onClick={() => archive(type, item)}
      >
        <Archive size={15} />
      </button>
      <button
        title="Delete"
        aria-label={`Delete ${item.title}`}
        disabled={busy}
        onClick={() => remove(type, item)}
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
  return (
    <main>
      <Link className="academy-back" href="/admin">
        <ArrowLeft size={15} /> All courses
      </Link>
      <div className="academy-page-heading">
        <div>
          <span className={`academy-status ${course.status}`}>
            {course.status}
          </span>
          <h1>{course.title}</h1>
          <p className="academy-muted">
            Your curriculum, in the order you want to teach it.
          </p>
        </div>
        <div className="academy-inline">
          <button
            className="academy-secondary"
            onClick={() => setEditing({ type: "course", item: course })}
          >
            Course settings
          </button>
          <Link className="academy-secondary" href={`/learn/${course.id}`}>
            Open learner view
          </Link>
        </div>
      </div>
      {error && (
        <p className="academy-error" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="academy-notice" role="status">
          {notice}
        </p>
      )}
      {editing && (
        <ContentForm
          key={`${editing.type}-${editing.item?.id ?? editing.parentId ?? "new"}`}
          {...editing}
          assets={assets}
          onDone={() => setEditing(null)}
        />
      )}
      <div className="academy-section-heading">
        <h2>Curriculum</h2>
        <button
          className="academy-secondary"
          onClick={() => setEditing({ type: "module", parentId: course.id })}
        >
          <Plus size={16} /> Add module
        </button>
      </div>
      {modules.length === 0 && (
        <div className="academy-empty">
          <h3>Give your course its first chapter.</h3>
          <p>Add a module, upload a video, then create a lesson.</p>
        </div>
      )}
      {modules.map((module, index) => {
        const rows = lessons.filter((l) => l.module_id === module.id);
        return (
          <section className="academy-admin-module" key={module.id}>
            <div className="academy-admin-module-heading">
              <div>
                <span className="academy-eyebrow">
                  MODULE {index + 1} · {module.status}
                </span>
                <h3>{module.title}</h3>
              </div>
              {controls("module", module, modules, index)}
            </div>
            {rows.map((lesson, i) => (
              <div className="academy-admin-lesson" key={lesson.id}>
                <div className="academy-admin-lesson-heading">
                  <div>
                    <span className={`academy-status ${lesson.status}`}>
                      {lesson.status}
                    </span>
                    <strong>{lesson.title}</strong>
                  </div>
                  {controls("lesson", lesson, rows, i)}
                </div>
                <details>
                  <summary>
                    <Paperclip size={14} /> Resources (
                    {
                      attachments.filter((a) => a.lesson_id === lesson.id)
                        .length
                    }
                    )
                  </summary>
                  <div className="academy-attachment-edit">
                    {attachments
                      .filter((a) => a.lesson_id === lesson.id)
                      .map((a) => (
                        <div key={a.id} className="academy-inline">
                          <span>
                            {assets.find((asset) => asset.id === a.asset_id)
                              ?.name ?? "Resource"}
                          </span>
                          <button
                            className="academy-text-link"
                            disabled={busy}
                            onClick={() =>
                              void action(() =>
                                callApi(
                                  "/api/admin/content",
                                  { type: "attachment", id: a.id },
                                  "DELETE",
                                ),
                              )
                            }
                          >
                            Detach
                          </button>
                        </div>
                      ))}
                    <label>
                      Add a resource
                      <select
                        value=""
                        disabled={busy}
                        onChange={(e) => {
                          if (e.target.value)
                            void action(() =>
                              callApi("/api/admin/content", {
                                type: "attachment",
                                data: {
                                  lesson_id: lesson.id,
                                  asset_id: e.target.value,
                                },
                              }),
                            );
                        }}
                      >
                        <option value="">Choose an uploaded file</option>
                        {assets
                          .filter(
                            (a) =>
                              a.kind !== "video" &&
                              a.status === "ready" &&
                              !attachments.some(
                                (link) =>
                                  link.lesson_id === lesson.id &&
                                  link.asset_id === a.id,
                              ),
                          )
                          .map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.name}
                            </option>
                          ))}
                      </select>
                    </label>
                  </div>
                </details>
              </div>
            ))}
            <button
              className="academy-add-lesson"
              onClick={() =>
                setEditing({ type: "lesson", parentId: module.id })
              }
            >
              <Plus size={16} /> Add lesson
            </button>
          </section>
        );
      })}
      <div className="academy-section-heading">
        <h2>Media library</h2>
        <span>{assets.length} files</span>
      </div>
      <Uploader
        courseId={course.id}
        assets={assets}
        onComplete={(asset) => {
          setNotice(
            `${asset.name} is ready. Select it in a lesson or course settings.`,
          );
          router.refresh();
        }}
      />
      <div className="academy-assets">
        {assets.map((asset) => (
          <div key={asset.id}>
            <div>
              <strong>{asset.name}</strong>
              <span>
                {asset.kind} · {(asset.size_bytes / 1024 ** 2).toFixed(1)} MB ·{" "}
                {asset.status}
              </span>
            </div>
            <div className="academy-row-actions">
              <button
                disabled={busy}
                onClick={() =>
                  void action(() =>
                    callApi(
                      "/api/admin/assets",
                      {
                        id: asset.id,
                        action:
                          asset.status === "archived"
                            ? "restore"
                            : asset.status === "uploading"
                              ? "complete"
                              : "archive",
                      },
                      "PATCH",
                    ),
                  )
                }
              >
                {asset.status === "archived"
                  ? "Restore"
                  : asset.status === "uploading"
                    ? "Check upload"
                    : "Archive"}
              </button>
              <button
                aria-label={`Delete ${asset.name}`}
                disabled={busy}
                onClick={() => {
                  if (
                    window.confirm(
                      `Delete “${asset.name}” permanently from storage?`,
                    )
                  )
                    void action(() =>
                      callApi("/api/admin/assets", { id: asset.id }, "DELETE"),
                    );
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <details className="academy-danger">
        <summary>Archive or delete this course</summary>
        <p>
          Archiving hides this course from learners. Courses with purchase or
          access history cannot be deleted.
        </p>
        <div className="academy-inline">
          <button disabled={busy} onClick={() => archive("course", course)}>
            Archive course
          </button>
          <button disabled={busy} onClick={() => remove("course", course)}>
            Delete empty course
          </button>
        </div>
      </details>
    </main>
  );
}
