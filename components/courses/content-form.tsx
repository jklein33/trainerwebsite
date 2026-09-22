"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type {
  Course,
  Module,
  Lesson,
  Asset,
  RichNode,
  ContentStatus,
  Attachment,
} from "@/lib/courses/types";
import { callApi } from "./ui";
import { DescriptionEditor } from "./editor";
import { MediaField } from "./media-field";
import { CheckCircle2, Eye, LoaderCircle } from "lucide-react";
import { AuthorPreview, type AuthorPreviewData } from "./author-preview";
export function ContentForm({
  type,
  item,
  parentId,
  assets = [],
  courseId,
  attachments = [],
  previewContext,
  onDone,
}: {
  type: "course" | "module" | "lesson";
  item?: Course | Module | Lesson;
  parentId?: string;
  assets?: Asset[];
  courseId?: string;
  attachments?: Attachment[];
  previewContext?: { course: Course; modules: Module[]; lessons: Lesson[] };
  onDone: () => void;
}) {
  const router = useRouter(),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [savedId, setSavedId] = useState(item?.id);
  const formRef = useRef<HTMLFormElement>(null);
  const [preview, setPreview] = useState<AuthorPreviewData | null>(null);
  const [creationId] = useState(() => crypto.randomUUID());
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const [videoPending, setVideoPending] = useState(false);
  const [resourcesPending, setResourcesPending] = useState(false);
  const pending = videoPending || resourcesPending;
  const discardDialog = useRef<HTMLDialogElement>(null);
  const leaveAction = useRef<(() => void) | null>(null);
  const allowLeave = useRef(false);
  const [localAssets, setLocalAssets] = useState<Asset[]>([]);
  const allAssets = [
    ...localAssets,
    ...assets.filter(
      (asset) => !localAssets.some((local) => local.id === asset.id),
    ),
  ];
  const [videoId, setVideoId] = useState(
    item && "video_asset_id" in item ? item.video_asset_id : null,
  );
  const [thumbnailId, setThumbnailId] = useState(
    item && "thumbnail_asset_id" in item ? item.thumbnail_asset_id : null,
  );
  const [resourceIds, setResourceIds] = useState(
    attachments
      .filter((link) => link.lesson_id === item?.id)
      .map((link) => link.asset_id),
  );
  const [publishStatus, setPublishStatus] = useState<ContentStatus>(
    item?.status ?? "draft",
  );
  const resolvedCourseId =
    courseId ?? (type === "course" ? savedId : undefined);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);
  useEffect(() => {
    if (!dirty && !pending && !busy) return;
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (allowLeave.current) return;
      event.preventDefault();
      event.returnValue = "";
    };
    const followLink = (event: MouseEvent) => {
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const anchor =
        event.target instanceof Element
          ? event.target.closest("a[href]")
          : null;
      if (
        !anchor ||
        anchor.hasAttribute("download") ||
        anchor.getAttribute("target") === "_blank"
      )
        return;
      event.preventDefault();
      event.stopImmediatePropagation();
      // A save cannot be cancelled by navigating away once the request is sent.
      if (busy) return;
      const url = new URL(anchor.getAttribute("href")!, window.location.href);
      leaveAction.current = () => {
        if (url.origin === window.location.origin)
          router.push(url.pathname + url.search + url.hash);
        else window.location.assign(url.href);
      };
      discardDialog.current?.showModal();
    };
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", followLink, true);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("click", followLink, true);
    };
  }, [dirty, pending, busy, router]);
  function close() {
    if (busy) return;
    if (dirty || pending) {
      leaveAction.current = () => {
        onDone();
        router.refresh();
      };
      discardDialog.current?.showModal();
      return;
    }
    onDone();
    router.refresh();
  }
  function changed() {
    allowLeave.current = false;
    setDirty(true);
    setSaved(false);
  }
  function uploaded(asset: Asset) {
    setLocalAssets((previous) => [
      asset,
      ...previous.filter((entry) => entry.id !== asset.id),
    ]);
    changed();
  }
  const [description, setDescription] = useState<RichNode>(
    item && "description" in item
      ? item.description
      : { type: "doc", content: [] },
  );
  function openPreview() {
    if (!formRef.current || busy) return;
    // Keep the editor's player from playing behind the preview's player.
    formRef.current.querySelectorAll("video").forEach((video) => video.pause());
    const form = new FormData(formRef.current);
    const id = savedId ?? creationId;
    const title = String(form.get("title") ?? "").trim() || `Untitled ${type}`;
    const position = Number(form.get("position")) || 0;
    const course = previewContext?.course ?? {
      title: "Untitled course",
      summary: "",
      thumbnail_asset_id: null,
      status: "draft" as const,
    };
    let modules = previewContext?.modules ?? [];
    let lessons = previewContext?.lessons ?? [];
    let links = attachments;
    if (type === "module") {
      modules = [
        ...modules.filter((entry) => entry.id !== id),
        {
          id,
          course_id: resolvedCourseId ?? "",
          title,
          position,
          status: publishStatus,
          created_at: item?.created_at ?? new Date().toISOString(),
        },
      ];
    }
    if (type === "lesson") {
      if (!modules.some((entry) => entry.id === parentId))
        modules = [
          ...modules,
          {
            id: parentId ?? "new-module",
            course_id: resolvedCourseId ?? "",
            title: "New module",
            position: 0,
            status: "draft",
            created_at: "",
          },
        ];
      lessons = [
        ...lessons.filter((entry) => entry.id !== id),
        {
          id,
          module_id: parentId ?? "new-module",
          title,
          description,
          video_asset_id: videoId,
          status: publishStatus,
          position,
          created_at: item?.created_at ?? new Date().toISOString(),
        },
      ];
      links = [
        ...attachments.filter((entry) => entry.lesson_id !== id),
        ...resourceIds.map((assetId) => ({
          id: `${id}-${assetId}`,
          lesson_id: id,
          asset_id: assetId,
        })),
      ];
    }
    setPreview({
      course:
        type === "course"
          ? {
              title,
              summary: String(form.get("summary") ?? ""),
              thumbnail_asset_id: thumbnailId,
              status: publishStatus,
            }
          : course,
      modules,
      lessons,
      assets: allAssets,
      attachments: links,
      initialLessonId: type === "lesson" ? id : undefined,
      unsaved: dirty || !savedId,
      pending,
    });
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || busy) return;
    if (type === "lesson" && publishStatus === "published" && !videoId) {
      setError(
        "Add a video before publishing, or save this lesson as a draft.",
      );
      return;
    }
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const common = {
      title: String(form.get("title")),
      status: form.get("status") as ContentStatus,
      position: Number(form.get("position")),
    };
    const data =
      type === "course"
        ? {
            ...common,
            summary: form.get("summary"),
            stripe_price_id: form.get("price") || null,
            thumbnail_asset_id: thumbnailId,
          }
        : type === "module"
          ? { ...common, course_id: parentId }
          : {
              ...common,
              module_id: parentId,
              video_asset_id: videoId,
              description,
            };
    try {
      const result =
        type === "lesson"
          ? await callApi(
              "/api/admin/lessons",
              {
                id: savedId ?? creationId,
                data,
                resourceIds,
              },
              "PUT",
            )
          : await callApi(
              "/api/admin/content",
              { type, id: savedId, data },
              savedId ? "PATCH" : "POST",
            );
      setSavedId(result.item.id);
      setDirty(false);
      setSaved(true);
      setError("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form
      ref={formRef}
      className="academy-content-form academy-authoring"
      onSubmit={submit}
      onChangeCapture={changed}
    >
      <div className="academy-section-heading">
        <h2>
          {savedId ? "Edit" : "New"} {type}
        </h2>
        <div className="academy-inline">
          <button
            type="button"
            className="academy-secondary"
            disabled={busy}
            onClick={openPreview}
          >
            <Eye size={17} /> Preview
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={close}
            className="academy-text-link"
          >
            Back
          </button>
        </div>
      </div>
      <p className="academy-muted academy-small">
        {type === "lesson"
          ? "Everything for this lesson, in one place. Save to apply your video, description, and resource changes."
          : "Changes are applied when you save."}
      </p>
      <fieldset disabled={busy} className="academy-authoring-fields">
        <label>
          Title
          <input
            name="title"
            defaultValue={item?.title ?? ""}
            required
            maxLength={160}
          />
        </label>
        <div className="academy-form-grid">
          <label>
            Status
            <select
              name="status"
              value={publishStatus}
              onChange={(event) =>
                setPublishStatus(event.target.value as ContentStatus)
              }
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </label>
          <label>
            Position
            <input
              name="position"
              type="number"
              min={0}
              max={100000}
              defaultValue={item?.position ?? 0}
            />
          </label>
        </div>
        {type === "course" && (
          <>
            <label>
              Short description
              <textarea
                name="summary"
                maxLength={2000}
                rows={3}
                defaultValue={item && "summary" in item ? item.summary : ""}
              />
            </label>
            <label>
              Stripe price ID
              <input
                name="price"
                placeholder="price_…"
                defaultValue={
                  item && "stripe_price_id" in item
                    ? (item.stripe_price_id ?? "")
                    : ""
                }
              />
              <small>
                Use an active, one-time price. Leave blank to grant access
                manually.
              </small>
            </label>
            {resolvedCourseId ? (
              <MediaField
                disabled={busy}
                kind="image"
                courseId={resolvedCourseId}
                assets={allAssets}
                selected={thumbnailId ? [thumbnailId] : []}
                onChange={(ids) => {
                  setThumbnailId(ids[0] ?? null);
                  changed();
                }}
                onUploaded={uploaded}
                onPendingChange={setVideoPending}
              />
            ) : (
              <p className="academy-notice">
                Save the course once to add its thumbnail here.
              </p>
            )}
          </>
        )}
        {type === "lesson" && (
          <>
            {resolvedCourseId && (
              <MediaField
                disabled={busy}
                kind="video"
                courseId={resolvedCourseId}
                assets={allAssets}
                selected={videoId ? [videoId] : []}
                onChange={(ids) => {
                  setVideoId(ids[0] ?? null);
                  changed();
                }}
                onUploaded={uploaded}
                onPendingChange={setVideoPending}
              />
            )}
            <div>
              <p className="academy-field-label">Lesson description</p>
              <DescriptionEditor
                value={description}
                disabled={busy}
                onChange={(value) => {
                  setDescription(value);
                  changed();
                }}
              />
            </div>
            {resolvedCourseId && (
              <MediaField
                disabled={busy}
                kind="attachment"
                courseId={resolvedCourseId}
                assets={allAssets}
                selected={resourceIds}
                onChange={(ids) => {
                  setResourceIds(ids);
                  changed();
                }}
                onUploaded={uploaded}
                onPendingChange={setResourcesPending}
              />
            )}
          </>
        )}
      </fieldset>
      {error && (
        <p className="academy-error" role="alert">
          {error}
        </p>
      )}
      <div className="academy-save-bar">
        <span
          role="status"
          aria-live="polite"
          className={saved && !dirty ? "academy-save-success" : "academy-muted"}
        >
          {busy ? (
            <>
              <LoaderCircle className="academy-spin" size={17} /> Saving
              changes…
            </>
          ) : pending ? (
            "Finish or discard pending uploads before saving."
          ) : dirty ? (
            "Unsaved changes"
          ) : saved ? (
            <>
              <CheckCircle2 size={17} />{" "}
              {publishStatus === "published"
                ? "Saved · Published"
                : publishStatus === "archived"
                  ? "Saved · Archived"
                  : "Saved · Draft"}
            </>
          ) : savedId ? (
            "No unsaved changes"
          ) : (
            "Not saved yet"
          )}
        </span>
        <div className="academy-inline">
          <button
            type="button"
            className="academy-secondary"
            disabled={busy}
            onClick={openPreview}
          >
            <Eye size={17} /> Preview
          </button>
          <button
            type="submit"
            className="academy-button"
            disabled={busy || pending}
          >
            {busy
              ? "Saving…"
              : publishStatus === "published"
                ? "Save & publish"
                : "Save changes"}
          </button>
          <button
            type="button"
            disabled={busy}
            className="academy-secondary"
            onClick={close}
          >
            {dirty ? "Cancel" : "Done"}
          </button>
        </div>
      </div>
      {preview && (
        <AuthorPreview data={preview} onClose={() => setPreview(null)} />
      )}
      <dialog
        ref={discardDialog}
        className="academy-discard-dialog"
        aria-labelledby="discard-editor-title"
        aria-describedby="discard-editor-description"
      >
        <h2 id="discard-editor-title">Leave without saving?</h2>
        <p id="discard-editor-description">
          Your unsaved edits will be discarded and pending uploads will stop.
          Completed uploads stay in the media library.
        </p>
        <div className="academy-inline">
          <button
            type="button"
            className="academy-button"
            onClick={() => discardDialog.current?.close()}
          >
            Keep editing
          </button>
          <button
            type="button"
            className="academy-secondary"
            onClick={() => {
              allowLeave.current = true;
              discardDialog.current?.close();
              leaveAction.current?.();
            }}
          >
            Discard changes
          </button>
        </div>
      </dialog>
    </form>
  );
}
