"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
export function OrderStatus({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [status, setStatus] = useState("pending"),
    [course, setCourse] = useState(""),
    [waiting, setWaiting] = useState(false);
  useEffect(() => {
    let stopped = false,
      attempts = 0;
    let timer: ReturnType<typeof setTimeout>;
    async function poll() {
      try {
        const response = await fetch(
          `/api/courses/order?session_id=${encodeURIComponent(sessionId)}`,
          { cache: "no-store" },
        );
        if (response.status === 401) {
          router.replace(
            `/login?next=${encodeURIComponent(`/success?session_id=${sessionId}`)}`,
          );
          return;
        }
        const data = await response.json();
        if (stopped) return;
        if (data.order) {
          setStatus(data.order.status);
          setCourse(data.order.course_id);
          if (data.order.status !== "pending") return;
        }
      } catch {}
      if (!stopped && ++attempts < 30) timer = setTimeout(poll, 2000);
      else if (!stopped) setWaiting(true);
    }
    void poll();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [sessionId, router]);
  return (
    <section className="academy-empty">
      <span className="academy-eyebrow">DAWG STRENGTH</span>
      <h1>
        {status === "paid"
          ? "Your next chapter is ready."
          : status === "pending"
            ? "Confirming your payment."
            : "Check your purchase status."}
      </h1>
      <p role="status">
        {status === "paid"
          ? "Your course access is active. You’re ready to begin."
          : status === "pending"
            ? waiting
              ? "Confirmation is taking a little longer. Your course will unlock once payment is confirmed; you can safely return later."
              : "We’re waiting for secure payment confirmation. This page will update automatically."
            : "Please contact support if you need help with this purchase."}
      </p>
      <Link
        className="academy-button"
        href={status === "paid" && course ? `/learn/${course}` : "/learn"}
      >
        {status === "paid" ? "Start learning" : "Go to my courses"}
      </Link>
    </section>
  );
}
