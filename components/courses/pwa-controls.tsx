"use client";
import { useEffect, useState } from "react";
type InstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
};
export function PwaControls() {
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null),
    [offline, setOffline] = useState(false),
    [waiting, setWaiting] = useState<ServiceWorker | null>(null);
  useEffect(() => {
    const install = (event: Event) => {
        event.preventDefault();
        setPrompt(event as InstallPrompt);
      },
      online = () => setOffline(!navigator.onLine);
    window.addEventListener("beforeinstallprompt", install);
    window.addEventListener("online", online);
    window.addEventListener("offline", online);
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production")
      void navigator.serviceWorker
        .register("/learn/sw.js", { scope: "/learn" })
        .then((registration) => {
          if (registration.waiting) setWaiting(registration.waiting);
          registration.addEventListener("updatefound", () => {
            const worker = registration.installing;
            worker?.addEventListener("statechange", () => {
              if (
                worker.state === "installed" &&
                navigator.serviceWorker.controller
              )
                setWaiting(worker);
            });
          });
        })
        .catch(() => {});
    return () => {
      window.removeEventListener("beforeinstallprompt", install);
      window.removeEventListener("online", online);
      window.removeEventListener("offline", online);
    };
  }, []);
  return (
    <div className="academy-pwa">
      {offline && (
        <span role="status">Offline — reconnect to watch lessons.</span>
      )}
      {prompt && (
        <button
          onClick={async () => {
            await prompt.prompt();
            await prompt.userChoice;
            setPrompt(null);
          }}
        >
          Install course app
        </button>
      )}
      {waiting && (
        <button
          onClick={() => {
            navigator.serviceWorker.addEventListener(
              "controllerchange",
              () => window.location.reload(),
              { once: true },
            );
            waiting.postMessage({ type: "SKIP_WAITING" });
          }}
        >
          Update available · Refresh
        </button>
      )}
    </div>
  );
}
