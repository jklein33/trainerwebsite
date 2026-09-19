"use client";
import { CheckCircle2, Film, ImageIcon, Paperclip, X } from "lucide-react";
import type { Asset } from "@/lib/courses/types";
import { Uploader } from "./uploader";
import { CoursePlayer, DownloadAsset } from "./player";
import { MediaImage } from "./ui";

export function MediaField({
  kind,
  courseId,
  assets,
  selected,
  onChange,
  onUploaded,
  onPendingChange,
}: {
  kind: Asset["kind"];
  courseId: string;
  assets: Asset[];
  selected: string[];
  onChange: (ids: string[]) => void;
  onUploaded: (asset: Asset) => void;
  onPendingChange: (pending: boolean) => void;
}) {
  const available = assets.filter(
    (asset) =>
      asset.course_id === courseId &&
      asset.status === "ready" &&
      (kind === "attachment" ? asset.kind !== "video" : asset.kind === kind) &&
      !selected.includes(asset.id),
  );
  const Icon =
    kind === "video" ? Film : kind === "image" ? ImageIcon : Paperclip;
  const title =
    kind === "video"
      ? "Lesson video"
      : kind === "image"
        ? "Course thumbnail"
        : "Lesson resources";
  function select(id: string) {
    onChange(kind === "attachment" ? [...new Set([...selected, id])] : [id]);
  }
  return (
    <section className="academy-media-field" aria-label={title}>
      <div className="academy-media-heading">
        <Icon size={20} aria-hidden="true" />
        <h3>{title}</h3>
        <span>
          {kind === "attachment"
            ? `${selected.length} attached`
            : selected.length
              ? "Selected"
              : kind === "video"
                ? "Required to publish"
                : "Optional"}
        </span>
      </div>
      <p className="academy-muted academy-small">
        {kind === "video"
          ? "Upload, preview, and choose the video for this lesson. Changes go live when you save."
          : kind === "image"
            ? "Choose the image learners will see on the course card."
            : "Add supporting files here. They will be attached when you save the lesson."}
      </p>
      {selected.map((id) => {
        const asset = assets.find((entry) => entry.id === id);
        return (
          <div className="academy-selected-media" key={id}>
            {kind === "video" && asset?.status === "ready" && (
              <CoursePlayer key={id} assetId={id} title={asset.name} />
            )}
            {kind === "image" && asset?.status === "ready" && (
              <MediaImage
                key={id}
                id={id}
                alt={asset.name}
                className="academy-thumbnail-preview"
              />
            )}
            <div className="academy-file-row">
              <CheckCircle2 size={17} aria-hidden="true" />
              <div>
                <strong>{asset?.name ?? "Unavailable file"}</strong>
                <small>
                  {asset
                    ? `${(asset.size_bytes / 1024 ** 2).toFixed(1)} MB · ${asset.status === "ready" ? "Ready" : "Unavailable — replace or remove this file"}`
                    : "Replace or remove this file"}
                </small>
              </div>
              <button
                type="button"
                className="academy-secondary"
                aria-label={`Remove ${asset?.name ?? "file"} from this ${kind === "image" ? "course" : "lesson"}`}
                onClick={() =>
                  onChange(selected.filter((value) => value !== id))
                }
              >
                <X size={16} aria-hidden="true" /> Remove
              </button>
            </div>
            {kind === "attachment" && asset?.status === "ready" && (
              <DownloadAsset id={id} name={asset.name} />
            )}
          </div>
        );
      })}
      <Uploader
        courseId={courseId}
        assets={assets}
        fixedKind={kind}
        onPendingChange={onPendingChange}
        onComplete={(asset) => {
          onUploaded(asset);
          select(asset.id);
        }}
      />
      {available.length > 0 && (
        <details className="academy-reuse-media">
          <summary>
            Choose an existing {kind === "attachment" ? "file" : kind}
          </summary>
          <label>
            Files in this course
            <select
              value=""
              onChange={(event) => {
                if (event.target.value) select(event.target.value);
              }}
            >
              <option value="">Choose a file…</option>
              {available.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.name}
                </option>
              ))}
            </select>
          </label>
        </details>
      )}
      {selected.length > 0 && (
        <p className="academy-small academy-muted">
          Removing a file here only removes it from this{" "}
          {kind === "image" ? "course" : "lesson"} when you save. The original
          stays in the media library.
        </p>
      )}
    </section>
  );
}
