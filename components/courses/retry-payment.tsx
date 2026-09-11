"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { callApi } from "./ui";
export function RetryPayment({ eventId }: { eventId: string }) {
  const router = useRouter(),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <div>
      <button
        className="academy-secondary"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setMessage("");
          try {
            await callApi("/api/admin/payments/retry", { eventId });
            router.refresh();
          } catch (err) {
            setMessage(err instanceof Error ? err.message : "Retry failed.");
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? "Retrying…" : "Retry event"}
      </button>
      {message && <p role="alert">{message}</p>}
    </div>
  );
}
