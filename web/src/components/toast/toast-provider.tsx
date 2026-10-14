import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { X } from "@phosphor-icons/react/X";

import { ToastContext, type ToastInput, type ToastStatus } from "@/components/toast/use-toast";
import { cn } from "@/lib/utils";

const TOAST_DURATION = 4000;

const STATUS_CLASS: Record<ToastStatus, string> = {
  info: "bg-muted-foreground",
  success: "bg-success",
  error: "bg-destructive",
};

type Toast = ToastInput & { id: number };

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (input: ToastInput) => {
      const id = nextId.current++;
      setToasts((current) => [...current, { ...input, id }]);
      window.setTimeout(() => dismissToast(id), TOAST_DURATION);
    },
    [dismissToast],
  );

  const actions = useMemo(() => ({ showToast, dismissToast }), [showToast, dismissToast]);

  return (
    <ToastContext value={actions}>
      {children}
      <ol aria-live="polite" className="fixed right-4 bottom-6 z-50 flex w-80 flex-col gap-2">
        {toasts.map((toast) => (
          <li
            key={toast.id}
            role="status"
            className="flex items-start gap-2.5 border border-border bg-card px-3 py-2.5 text-sm shadow-md"
          >
            <span className={cn("mt-1.5 size-1.5 shrink-0", STATUS_CLASS[toast.status ?? "info"])} />
            <div className="min-w-0 flex-1">
              <p className="font-medium">{toast.title}</p>
              {toast.description && (
                <p className="mt-0.5 text-xs text-muted-foreground">{toast.description}</p>
              )}
            </div>
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => dismissToast(toast.id)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          </li>
        ))}
      </ol>
    </ToastContext>
  );
}
