"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "tus-js-client";
import { CheckCircle2, LoaderCircle, UploadCloud } from "lucide-react";
import { browserClient } from "@/lib/supabase/browser";
import { supabaseEnvironment } from "@/lib/supabase/env";
import { courseStorageConfig } from "@/lib/courses/config";
import { validateUpload } from "@/lib/courses/validation";
import type { Asset } from "@/lib/courses/types";
import { callApi } from "./ui";

export function Uploader({
  courseId,
  assets,
  onComplete,
  fixedKind,
  onPendingChange,
  disabled = false,
}: {
  courseId: string;
  assets: Asset[];
  onComplete: (asset: Asset) => void;
  fixedKind?: Asset["kind"];
  onPendingChange?: (pending: boolean) => void;
  disabled?: boolean;
}) {
  const [kind, setKind] = useState<"video" | "image" | "attachment">(
      fixedKind ?? "video",
    ),
    [file, setFile] = useState<File | null>(null),
    [busy, setBusy] = useState(false),
    [progress, setProgress] = useState(0),
    [error, setError] = useState("");
  const [inputVersion, setInputVersion] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [canPause, setCanPause] = useState(false);
  const [paused, setPaused] = useState(false);
  const [completedName, setCompletedName] = useState("");
  const inFlight = useRef(false);
  function setUploading(value: boolean) {
    inFlight.current = value;
    setBusy(value);
  }
  useEffect(() => {
    onPendingChange?.(busy || file !== null);
  }, [busy, file, onPendingChange]);
  const upload = useRef<Upload | null>(null);
  const completed = useRef(onComplete);
  useEffect(() => {
    completed.current = onComplete;
  }, [onComplete]);
  const active = useRef(true);
  const pendingAsset = useRef<Asset | null>(null),
    uploaded = useRef(false),
    router = useRouter();
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
      void upload.current?.abort();
    };
  }, []);
  async function start(file: File) {
    if (inFlight.current || disabled) return;
    setUploading(true);
    onPendingChange?.(true);
    setCanPause(false);
    setPaused(false);
    setCompletedName("");
    setError("");
    try {
      validateUpload(file.name, kind, file.size);
      const resumeKey = `course-upload:${supabaseEnvironment().url}:${courseStorageConfig().bucket}:${courseId}:${kind}:${file.name}:${file.size}:${file.lastModified}`;
      function clearResume() {
        try {
          localStorage.removeItem(resumeKey);
        } catch {}
      }
      let storedId: string | null = null;
      try {
        storedId = localStorage.getItem(resumeKey);
      } catch {}
      const previousAsset =
        pendingAsset.current ??
        assets.find(
          (asset) =>
            asset.id === storedId &&
            asset.course_id === courseId &&
            asset.kind === kind &&
            asset.status !== "archived",
        );
      if (previousAsset?.status === "ready") {
        completed.current(previousAsset);
        setCompletedName(file.name);
        clearResume();
        setFile(null);
        setInputVersion((value) => value + 1);
        setUploading(false);
        pendingAsset.current = null;
        uploaded.current = false;
        return;
      }
      const pending =
        previousAsset &&
        previousAsset.name === file.name &&
        previousAsset.size_bytes === file.size &&
        previousAsset.kind === kind
          ? previousAsset
          : undefined;
      const asset: Asset =
        pending ??
        (
          await callApi("/api/admin/assets", {
            courseId,
            name: file.name,
            kind,
            size: file.size,
          })
        ).asset;
      if (!active.current) return;
      if (pendingAsset.current?.id !== asset.id) uploaded.current = false;
      pendingAsset.current = asset;
      try {
        localStorage.setItem(resumeKey, asset.id);
      } catch {}
      if (uploaded.current) {
        await callApi(
          "/api/admin/assets",
          { id: asset.id, action: "complete" },
          "PATCH",
        );
        if (!active.current) return;
        completed.current({ ...asset, status: "ready" });
        setCompletedName(file.name);
        clearResume();
        setFile(null);
        setInputVersion((value) => value + 1);
        setUploading(false);
        pendingAsset.current = null;
        uploaded.current = false;
        return;
      }
      const db = browserClient(),
        {
          data: { session },
        } = await db.auth.getSession();
      if (!session)
        throw new Error("Your session has expired. Sign in and retry.");
      if (!active.current) return;
      const { url, key } = supabaseEnvironment(),
        host = new URL(url);
      if (host.hostname.endsWith(".supabase.co"))
        host.hostname = host.hostname.replace(
          ".supabase.co",
          ".storage.supabase.co",
        );
      const task = new Upload(file, {
        endpoint: `${host.origin}/storage/v1/upload/resumable`,
        headers: {
          authorization: `Bearer ${session.access_token}`,
          apikey: key,
        },
        retryDelays: [0, 3000, 5000, 10000, 20000],
        chunkSize: 6 * 1024 * 1024,
        uploadDataDuringCreation: true,
        removeFingerprintOnSuccess: true,
        fingerprint: async () =>
          `course:${host.origin}:${courseStorageConfig().bucket}:${asset.path}:${file.size}:${file.lastModified}`,
        metadata: {
          bucketName: courseStorageConfig().bucket,
          objectName: asset.path,
          contentType: asset.mime_type,
          cacheControl: "3600",
        },
        onProgress: (sent, total) =>
          setProgress(Math.round((sent / total) * 100)),
        onError: () => {
          if (!active.current) return;
          setCanPause(false);
          setError(
            "Upload interrupted. Retry to continue. Your edits are kept.",
          );
          setUploading(false);
        },
        onSuccess: async () => {
          if (!active.current) return;
          setCanPause(false);
          uploaded.current = true;
          try {
            await callApi(
              "/api/admin/assets",
              { id: asset.id, action: "complete" },
              "PATCH",
            );
            if (!active.current) return;
            completed.current({ ...asset, status: "ready" });
            setCompletedName(file.name);
            clearResume();
            setFile(null);
            setInputVersion((value) => value + 1);
            setProgress(0);
            pendingAsset.current = null;
            uploaded.current = false;
          } catch (err) {
            setError(
              err instanceof Error
                ? err.message
                : "Upload could not be confirmed.",
            );
            router.refresh();
          } finally {
            setUploading(false);
          }
        },
      });
      upload.current = task;
      const previous = await task.findPreviousUploads();
      if (!active.current) return;
      if (previous.length) task.resumeFromPreviousUpload(previous[0]);
      setCanPause(true);
      task.start();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
      setUploading(false);
    }
  }
  function chooseFile(next: File | null) {
    if (inFlight.current || disabled) return;
    if (!next) return;
    setError("");
    setCompletedName("");
    setPaused(false);
    try {
      validateUpload(next.name, kind, next.size);
      if (
        !file ||
        file.name !== next.name ||
        file.size !== next.size ||
        file.lastModified !== next.lastModified
      ) {
        pendingAsset.current = null;
        uploaded.current = false;
      }
      setProgress(0);
      setFile(next);
      void start(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unsupported file.");
      setFile(null);
      setInputVersion((value) => value + 1);
    }
  }
  return (
    <div
      className={`academy-upload ${fixedKind ? "academy-upload-inline" : ""} ${dragging ? "is-dragging" : ""}`}
      onDragOver={(event) => {
        event.preventDefault();
        if (!busy && !disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        if (inFlight.current || disabled) return;
        if (event.dataTransfer.files.length > 1) {
          setError("Choose one file at a time.");
          return;
        }
        chooseFile(event.dataTransfer.files[0] ?? null);
      }}
    >
      <div>
        <UploadCloud size={26} />
        <h3>
          {fixedKind === "video"
            ? "Upload a video"
            : fixedKind === "image"
              ? "Upload an image"
              : fixedKind === "attachment"
                ? "Add a resource"
                : "Add a file"}
        </h3>
        <p>
          {kind === "video"
            ? "Drop an MP4 here, or choose a file. Up to 5 GB."
            : kind === "image"
              ? "Drop a JPG or PNG here, or choose a file. Up to 25 MB."
              : "Drop a PDF, Word document, or image here. Up to 25 MB per file."}
        </p>
        <p className="academy-small academy-muted">
          Upload starts automatically when you choose a file.
        </p>
      </div>
      <div className="academy-upload-fields">
        {!fixedKind && (
          <label>
            File type
            <select
              value={kind}
              disabled={busy || disabled}
              onChange={(e) => {
                setKind(e.target.value as typeof kind);
                setFile(null);
                pendingAsset.current = null;
                uploaded.current = false;
                setError("");
                setProgress(0);
                setPaused(false);
                setCompletedName("");
              }}
            >
              <option value="video">Lesson video</option>
              <option value="image">Image / thumbnail</option>
              <option value="attachment">Lesson resource</option>
            </select>
          </label>
        )}
        <label
          className={`academy-file-picker ${busy || disabled ? "is-disabled" : ""}`}
        >
          <span>Choose file</span>
          <input
            key={`${kind}-${inputVersion}`}
            type="file"
            disabled={busy || disabled}
            accept={
              kind === "video"
                ? ".mp4"
                : kind === "image"
                  ? ".jpg,.jpeg,.png"
                  : ".doc,.docx,.pdf,.jpg,.jpeg,.png"
            }
            onChange={(e) => chooseFile(e.target.files?.[0] ?? null)}
          />
        </label>
        {file && (
          <p className="academy-upload-status" role="status">
            {file.name} · {(file.size / 1024 ** 2).toFixed(1)} MB
            {paused ? " · Paused" : ""}
          </p>
        )}
        {completedName && (
          <p
            className="academy-upload-status academy-save-success"
            role="status"
          >
            <CheckCircle2 size={17} aria-hidden="true" /> {completedName} ·
            Uploaded
          </p>
        )}
        {busy && (
          <>
            <p className="academy-upload-status" role="status">
              <LoaderCircle
                size={17}
                className="academy-spin"
                aria-hidden="true"
              />{" "}
              {progress === 100
                ? "Finishing upload…"
                : canPause
                  ? `Uploading ${progress}%`
                  : "Starting upload…"}
            </p>
            <progress value={progress} max={100} aria-label="Upload progress" />
            <button
              type="button"
              className="academy-text-link"
              disabled={!canPause}
              onClick={() => {
                if (!upload.current) return;
                setCanPause(false);
                void upload.current
                  .abort()
                  .then(() => {
                    if (!active.current) return;
                    setUploading(false);
                    setPaused(true);
                    setError("");
                  })
                  .catch(() => {
                    if (!active.current) return;
                    setCanPause(true);
                    setError("Unable to pause. Please try again.");
                  });
              }}
            >
              Pause upload
            </button>
          </>
        )}
        {file && !busy && (
          <button
            className="academy-button"
            type="button"
            disabled={disabled}
            onClick={() => void start(file)}
          >
            {paused ? "Resume upload" : "Retry upload"}
          </button>
        )}
        {file && !busy && (
          <button
            type="button"
            className="academy-text-link"
            onClick={() => {
              setFile(null);
              setError("");
              setProgress(0);
              setPaused(false);
              pendingAsset.current = null;
              uploaded.current = false;
              setInputVersion((value) => value + 1);
            }}
          >
            Discard pending upload
          </button>
        )}
        {error && (
          <p className="academy-error" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
