"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, LogOut, Menu, X } from "lucide-react";

export async function callApi(url: string, body: unknown, method = "POST") {
  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.error ?? "Unable to complete this request.");
  return data;
}
export function AcademyNav({
  admin,
  signedIn,
}: {
  admin: boolean;
  signedIn: boolean;
}) {
  const [open, setOpen] = useState(false),
    [error, setError] = useState("");
  const router = useRouter();
  async function signout() {
    try {
      await callApi("/api/auth/action", { action: "signout" });
      router.push("/login");
      router.refresh();
    } catch (err) {
      setError(String(err));
    }
  }
  return (
    <header className="academy-nav">
      <Link href="/learn" className="academy-brand">
        DAWG<span>STRENGTH</span>
        <small>THE COURSE ROOM</small>
      </Link>
      <button
        className="academy-mobile-toggle"
        aria-label="Toggle navigation"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {open ? <X /> : <Menu />}
      </button>
      <nav className={open ? "is-open" : ""} onClick={() => setOpen(false)}>
        <Link href="/learn">Courses</Link>
        {admin && <Link href="/admin">Manage</Link>}
        <Link href={process.env.NEXT_PUBLIC_SITE_URL || "/"}>
          Main website <ArrowUpRight size={14} />
        </Link>
        {signedIn ? (
          <button onClick={signout}>
            <LogOut size={15} /> Sign out
          </button>
        ) : (
          <Link href="/login">Sign in</Link>
        )}
      </nav>
      {error && <p role="alert">Sign out failed. Please retry.</p>}
    </header>
  );
}
export function MediaImage({
  id,
  alt,
  className = "",
}: {
  id: string | null;
  alt: string;
  className?: string;
}) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    if (!id) return;
    let alive = true;
    fetch(`/api/courses/assets/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (alive && data) setUrl(data.url);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [id]);
  // A signed private URL must bypass the public image optimizer/cache.
  return url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt={alt} className={className} />
  ) : (
    <div
      className={`academy-image-placeholder ${className}`}
      aria-hidden="true"
    >
      <span>DS</span>
    </div>
  );
}
export function PurchaseButton({ courseId }: { courseId: string }) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [requestId] = useState(() => crypto.randomUUID());
  async function buy() {
    setBusy(true);
    setError("");
    try {
      const data = await callApi("/api/courses/checkout", {
        courseId,
        requestId,
      });
      window.location.assign(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to open checkout.");
      setBusy(false);
    }
  }
  return (
    <div>
      <button className="academy-button" disabled={busy} onClick={buy}>
        {busy ? "Opening secure checkout…" : "Get course access"}{" "}
        <ArrowUpRight size={18} />
      </button>
      <p className="academy-muted academy-small">
        One payment. Lifetime access.
      </p>
      {error && (
        <p className="academy-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
