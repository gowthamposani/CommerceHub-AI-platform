import { X } from "lucide-react";
import { useEffect, useState } from "react";

import type { ToastPayload } from "../../lib/api";

const toastStyles = {
  error: "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200",
  info: "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-200",
  success:
    "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
} satisfies Record<ToastPayload["variant"], string>;

export function ToastViewport() {
  const [toasts, setToasts] = useState<ToastPayload[]>([]);

  useEffect(() => {
    function handleToast(event: Event) {
      const toast = (event as CustomEvent<ToastPayload>).detail;
      setToasts((currentToasts) => [toast, ...currentToasts].slice(0, 3));
      window.setTimeout(() => {
        setToasts((currentToasts) => currentToasts.filter((item) => item.id !== toast.id));
      }, 5000);
    }

    window.addEventListener("commercehub:toast", handleToast);
    return () => window.removeEventListener("commercehub:toast", handleToast);
  }, []);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div
      className="fixed right-4 top-4 z-[80] flex w-[min(360px,calc(100vw-32px))] flex-col gap-3"
      role="status"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className={`rounded-admin border p-4 shadow-admin ${toastStyles[toast.variant]}`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              {toast.title ? <p className="text-sm font-semibold">{toast.title}</p> : null}
              <p className="mt-1 text-sm">{toast.message}</p>
            </div>
            <button
              className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-admin hover:bg-white/50 dark:hover:bg-black/20"
              type="button"
              aria-label="Dismiss notification"
              onClick={() => setToasts((currentToasts) => currentToasts.filter((item) => item.id !== toast.id))}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
