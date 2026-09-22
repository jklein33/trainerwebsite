"use client";
import { useEffect, useRef, useState } from "react";
import { Download, RefreshCw } from "lucide-react";
export function CoursePlayer({
  assetId,
  title,
}: {
  assetId: string;
  title: string;
}) {
  const video = useRef<HTMLVideoElement>(null),
    [url, setUrl] = useState(""),
    [error, setError] = useState(""),
    [attempt, setAttempt] = useState(0);
  const position = useRef(0),
    playing = useRef(false);
  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        if (video.current) {
          position.current = video.current.currentTime;
          playing.current = !video.current.paused;
        }
        const response = await fetch(`/api/courses/assets/${assetId}`, {
          cache: "no-store",
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        if (alive) {
          setUrl(data.url);
          setError("");
        }
      } catch (err) {
        if (alive)
          setError(
            err instanceof Error ? err.message : "Unable to load video.",
          );
      }
    }
    void load();
    const timer = setInterval(load, 45 * 60 * 1000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [assetId, attempt]);
  return (
    <div className="academy-player">
      {url && (
        <video
          ref={video}
          src={url}
          controls
          playsInline
          preload="metadata"
          controlsList="nodownload"
          aria-label={title}
          onLoadedMetadata={() => {
            if (video.current) {
              video.current.currentTime = position.current;
              if (playing.current) void video.current.play().catch(() => {});
            }
          }}
          onError={() =>
            setError(
              video.current?.error?.code === 3 ||
                video.current?.error?.code === 4
                ? "Your browser cannot play this video. Please contact the course administrator for an MP4 version."
                : "Playback was interrupted. Check your connection and reload the video.",
            )
          }
        />
      )}{" "}
      {!url && !error && <p role="status">Loading your lesson…</p>}
      {error && (
        <div className="academy-player-error">
          <p role="alert">{error}</p>
          <button
            type="button"
            className="academy-secondary"
            onClick={() => setAttempt(attempt + 1)}
          >
            <RefreshCw size={15} /> Reload video
          </button>
        </div>
      )}
    </div>
  );
}
export function DownloadAsset({ id, name }: { id: string; name: string }) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function download() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/courses/assets/${id}?download=1`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      const link = document.createElement("a");
      link.href = data.url;
      link.download = name;
      link.rel = "noopener";
      link.click();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div>
      <button
        type="button"
        className="academy-resource"
        disabled={busy}
        onClick={download}
      >
        <Download size={17} />
        <span>{name}</span>
        <small>{busy ? "Preparing…" : "Download"}</small>
      </button>
      {error && (
        <p role="alert" className="academy-error">
          {error}
        </p>
      )}
    </div>
  );
}
