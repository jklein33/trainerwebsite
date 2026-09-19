"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "tus-js-client";
import { UploadCloud } from "lucide-react";
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
}: {
  courseId: string;
  assets: Asset[];
  onComplete: (asset: Asset) => void;
}) {
  const [kind, setKind] = useState<"video" | "image" | "attachment">("video"),
    [file, setFile] = useState<File | null>(null),
    [busy, setBusy] = useState(false),
    [progress, setProgress] = useState(0),
    [error, setError] = useState("");
  const upload = useRef<Upload | null>(null);
  const pendingAsset = useRef<Asset | null>(null),
    uploaded = useRef(false),
    router = useRouter();
  useEffect(
    () => () => {
      void upload.current?.abort();
    },
    [],
  );
  async function start() {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      validateUpload(file.name, kind, file.size);
      const previousAsset = pendingAsset.current;
      const pending =
        previousAsset &&
        previousAsset.name === file.name &&
        previousAsset.size_bytes === file.size &&
        previousAsset.kind === kind
          ? previousAsset
          : assets.find(
              (a) =>
                a.status === "uploading" &&
                a.name === file.name &&
                a.size_bytes === file.size &&
                a.kind === kind,
            );
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
      if (pendingAsset.current?.id !== asset.id) uploaded.current = false;
      pendingAsset.current = asset;
      if (uploaded.current) {
        await callApi(
          "/api/admin/assets",
          { id: asset.id, action: "complete" },
          "PATCH",
        );
        onComplete({ ...asset, status: "ready" });
        setFile(null);
        setBusy(false);
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
          setError(
            "Upload interrupted. Choose the same file and retry to resume.",
          );
          setBusy(false);
        },
        onSuccess: async () => {
          uploaded.current = true;
          try {
            await callApi(
              "/api/admin/assets",
              { id: asset.id, action: "complete" },
              "PATCH",
            );
            onComplete({ ...asset, status: "ready" });
            setFile(null);
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
            setBusy(false);
          }
        },
      });
      upload.current = task;
      const previous = await task.findPreviousUploads();
      if (previous.length) task.resumeFromPreviousUpload(previous[0]);
      task.start();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
      setBusy(false);
    }
  }
  return (
    <div className="academy-upload">
      <div>
        <UploadCloud size={26} />
        <h3>Add a file</h3>
        <p>MP4 video up to 5 GB. Images and resources up to 25 MB.</p>
      </div>
      <div className="academy-upload-fields">
        <label>
          File type
          <select
            value={kind}
            disabled={busy}
            onChange={(e) => {
              setKind(e.target.value as typeof kind);
              setFile(null);
            }}
          >
            <option value="video">Lesson video</option>
            <option value="image">Image / thumbnail</option>
            <option value="attachment">Lesson resource</option>
          </select>
        </label>
        <label>
          Choose file
          <input
            key={kind}
            type="file"
            disabled={busy}
            accept={
              kind === "video"
                ? ".mp4"
                : kind === "image"
                  ? ".jpg,.jpeg,.png"
                  : ".doc,.docx,.pdf,.jpg,.jpeg,.png"
            }
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>
        <button
          className="academy-button"
          type="button"
          disabled={!file || busy}
          onClick={start}
        >
          {busy ? `Uploading ${progress}%` : "Upload file"}
        </button>
        {busy && (
          <>
            <progress value={progress} max={100} aria-label="Upload progress" />
            <button
              type="button"
              className="academy-text-link"
              onClick={() => {
                void upload.current?.abort();
                setBusy(false);
                setError("Upload paused. Retry to continue.");
              }}
            >
              Pause upload
            </button>
          </>
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
