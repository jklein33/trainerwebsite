"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type {
  Course,
  Module,
  Lesson,
  Asset,
  RichNode,
  ContentStatus,
} from "@/lib/courses/types";
import { callApi } from "./ui";
import { DescriptionEditor } from "./editor";
export function ContentForm({
  type,
  item,
  parentId,
  assets = [],
  onDone,
}: {
  type: "course" | "module" | "lesson";
  item?: Course | Module | Lesson;
  parentId?: string;
  assets?: Asset[];
  onDone: () => void;
}) {
  const router = useRouter(),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [description, setDescription] = useState<RichNode>(
    item && "description" in item
      ? item.description
      : { type: "doc", content: [] },
  );
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
            thumbnail_asset_id: form.get("thumbnail") || null,
          }
        : type === "module"
          ? { ...common, course_id: parentId }
          : {
              ...common,
              module_id: parentId,
              video_asset_id: form.get("video") || null,
              description,
            };
    try {
      await callApi(
        "/api/admin/content",
        { type, id: item?.id, data },
        item ? "PATCH" : "POST",
      );
      onDone();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="academy-content-form" onSubmit={submit}>
      <div className="academy-section-heading">
        <h2>
          {item ? "Edit" : "New"} {type}
        </h2>
        <button type="button" onClick={onDone} className="academy-text-link">
          Close
        </button>
      </div>
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
          <select name="status" defaultValue={item?.status ?? "draft"}>
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
          <label>
            Thumbnail
            <select
              name="thumbnail"
              defaultValue={
                item && "thumbnail_asset_id" in item
                  ? (item.thumbnail_asset_id ?? "")
                  : ""
              }
            >
              <option value="">Brand placeholder</option>
              {assets
                .filter((a) => a.kind === "image" && a.status === "ready")
                .map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
            </select>
          </label>
        </>
      )}
      {type === "lesson" && (
        <>
          <label>
            Video
            <select
              name="video"
              defaultValue={
                item && "video_asset_id" in item
                  ? (item.video_asset_id ?? "")
                  : ""
              }
            >
              <option value="">Select an uploaded video</option>
              {assets
                .filter((a) => a.kind === "video" && a.status === "ready")
                .map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
            </select>
            <small>
              A video is required before publishing. Upload files in the media
              library below.
            </small>
          </label>
          <div>
            <p className="academy-field-label">Lesson description</p>
            <DescriptionEditor value={description} onChange={setDescription} />
          </div>
        </>
      )}
      {error && (
        <p className="academy-error" role="alert">
          {error}
        </p>
      )}
      <div className="academy-inline">
        <button className="academy-button" disabled={busy}>
          {busy ? "Saving…" : "Save changes"}
        </button>
        <button type="button" className="academy-secondary" onClick={onDone}>
          Cancel
        </button>
      </div>
    </form>
  );
}
