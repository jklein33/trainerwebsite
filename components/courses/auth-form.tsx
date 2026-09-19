"use client";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { callApi } from "./ui";
export function AuthForm({
  mode,
  next,
  configured,
  errorHint,
}: {
  mode: "signin" | "signup" | "reset" | "update";
  next: string;
  configured: boolean;
  errorHint?: string;
}) {
  const router = useRouter(),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  const titles = {
    signin: "Welcome back.",
    signup: "Make room for progress.",
    reset: "Let’s get you back in.",
    update: "Set a new password.",
  };
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const data = await callApi("/api/auth/action", {
        action: mode,
        email: form.get("email") ?? undefined,
        password: form.get("password") ?? undefined,
        name: form.get("name") ?? undefined,
        next,
      });
      if (data.redirect) {
        router.push(data.redirect);
        router.refresh();
      } else setMessage(data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="academy-auth">
      <div className="academy-auth-story">
        <span className="academy-eyebrow">DAWG STRENGTH / COURSES</span>
        <h1>
          Your next chapter
          <br />
          starts here<span>.</span>
        </h1>
        <p>
          Practical lessons. A clear direction.
          <br />
          The work is yours to put in.
        </p>
        <Link href={process.env.NEXT_PUBLIC_SITE_URL || "/"}>
          Explore Dawg Strength <ArrowRight size={17} />
        </Link>
      </div>
      <section className="academy-auth-panel">
        <span className="academy-eyebrow">
          {mode === "signup" ? "CREATE YOUR ACCOUNT" : "YOUR COURSE ROOM"}
        </span>
        <h2>{titles[mode]}</h2>
        <p className="academy-muted">
          {mode === "signup"
            ? "Create an account before purchasing a course."
            : mode === "signin"
              ? "Sign in to pick up where you left off."
              : "Use the email address connected to your account."}
        </p>
        {!configured && (
          <div className="academy-notice">
            The course platform is being prepared. Account access will be
            available soon.
          </div>
        )}
        {errorHint && (
          <p className="academy-error">
            {errorHint === "access"
              ? "Account access is unavailable. Please contact support."
              : errorHint === "link-browser"
                ? "We could not complete verification in this browser. Open the latest email link in the browser where you requested it. If you were confirming your account, try signing in below: your email may already be confirmed."
                : "We could not complete this email link. It may have already been used, expired, or opened in a different browser. If you were confirming your account, try signing in below before requesting another email."}
          </p>
        )}
        <form onSubmit={submit}>
          {mode === "signup" && (
            <label>
              Your name
              <input name="name" autoComplete="name" maxLength={120} />
            </label>
          )}
          {mode !== "update" && (
            <label>
              Email address
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                maxLength={254}
              />
            </label>
          )}
          {mode !== "reset" && (
            <label>
              Password
              <input
                name="password"
                type="password"
                required
                minLength={10}
                maxLength={128}
                autoComplete={
                  mode === "signin" ? "current-password" : "new-password"
                }
              />
              <small>At least 10 characters.</small>
            </label>
          )}
          {mode === "signin" && (
            <Link className="academy-text-link" href="/forgot-password">
              Forgot your password?
            </Link>
          )}
          <button className="academy-button" disabled={busy || !configured}>
            {busy
              ? "Please wait…"
              : mode === "signin"
                ? "Sign in"
                : mode === "signup"
                  ? "Create account"
                  : mode === "reset"
                    ? "Send reset link"
                    : "Save password"}
            <ArrowRight size={17} />
          </button>
          {error && (
            <p role="alert" className="academy-error">
              {error}
            </p>
          )}
          {message && (
            <p role="status" className="academy-notice">
              {message}
            </p>
          )}
        </form>
        <p className="academy-small academy-muted">
          {mode === "signin" ? (
            <>
              New here?{" "}
              <Link href={`/register?next=${encodeURIComponent(next)}`}>
                Create an account
              </Link>
            </>
          ) : (
            <Link href={`/login?next=${encodeURIComponent(next)}`}>
              Back to sign in
            </Link>
          )}
        </p>
      </section>
    </main>
  );
}
