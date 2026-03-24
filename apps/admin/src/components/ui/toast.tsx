"use client";

import { CheckCircle2, CircleAlert, Info, X } from "lucide-react";
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { cn } from "@/lib/utils";

type ToastVariant = "error" | "info" | "success";

type ToastInput = {
  description?: string;
  title: string;
  variant?: ToastVariant;
};

type ToastRecord = ToastInput & {
  id: string;
};

type ToastContextValue = {
  toast: (input: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: PropsWithChildren) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const timeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((toastId: string) => {
    const timeout = timeoutsRef.current.get(toastId);

    if (timeout) {
      clearTimeout(timeout);
      timeoutsRef.current.delete(toastId);
    }

    setToasts((current) => current.filter((toast) => toast.id !== toastId));
  }, []);

  const toast = useCallback(
    (input: ToastInput) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setToasts((current) => [...current, { ...input, id, variant: input.variant ?? "info" }]);

      const timeout = setTimeout(() => {
        dismiss(id);
      }, 4000);

      timeoutsRef.current.set(id, timeout);
    },
    [dismiss]
  );

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
      timeoutsRef.current.clear();
    };
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed right-4 top-4 z-[100] flex w-full max-w-sm flex-col gap-3">
        {toasts.map((toastItem) => {
          const Icon = resolveToastIcon(toastItem.variant ?? "info");

          return (
            <div
              key={toastItem.id}
              role="status"
              className={cn(
                "pointer-events-auto rounded-2xl border bg-white p-4 shadow-soft",
                toastItem.variant === "success" && "border-emerald-200",
                toastItem.variant === "error" && "border-rose-200",
                toastItem.variant === "info" && "border-border"
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl",
                    toastItem.variant === "success" && "bg-emerald-50 text-emerald-700",
                    toastItem.variant === "error" && "bg-rose-50 text-rose-700",
                    toastItem.variant === "info" && "bg-slate-100 text-slate-600"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-950">{toastItem.title}</p>
                  {toastItem.description ? <p className="mt-1 text-sm text-slate-600">{toastItem.description}</p> : null}
                </div>
                <button
                  type="button"
                  aria-label={`Dismiss ${toastItem.title}`}
                  className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                  onClick={() => dismiss(toastItem.id)}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}

function resolveToastIcon(variant: ToastVariant) {
  if (variant === "success") {
    return CheckCircle2;
  }

  if (variant === "error") {
    return CircleAlert;
  }

  return Info;
}
