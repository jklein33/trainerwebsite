"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section className="academy-empty">
      <h1>We couldn’t load this page.</h1>
      <p>
        Please try again. If this continues, contact support about your account.
      </p>
      <button className="academy-button" onClick={reset}>
        Try again
      </button>
    </section>
  );
}
