import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X, Check, AlertTriangle, Info } from "./AppIcon";

type ToastVariant = "success" | "error" | "info" | "warning";

interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const ICONS: Record<ToastVariant, ReactNode> = {
  success: <Check size={20} />,
  error: <X size={20} />,
  info: <Info size={20} />,
  warning: <AlertTriangle size={20} />,
};

const TONES: Record<ToastVariant, string> = {
  success: "bg-emerald-50 border-emerald-200 text-emerald-800",
  error: "bg-rose-50 border-rose-200 text-rose-800",
  info: "bg-indigo-50 border-indigo-200 text-indigo-800",
  warning: "bg-amber-50 border-amber-200 text-amber-800",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (variant: ToastVariant, message: string) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message, variant }]);
      setTimeout(() => remove(id), 4000);
    },
    [remove]
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      success: (m) => show("success", m),
      error: (m) => show("error", m),
      info: (m) => show("info", m),
      warning: (m) => show("warning", m),
    }),
    [show]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {typeof document !== "undefined" &&
        createPortal(
          <div className="fixed top-4 end-4 z-[100] flex flex-col gap-2 pointer-events-none">
            {toasts.map((t) => (
              <div
                key={t.id}
                role="alert"
                className={[
                  "pointer-events-auto min-w-[260px] max-w-sm rounded-lg shadow-md border px-4 py-3 text-sm font-medium flex items-center gap-3 animate-slide-up",
                  TONES[t.variant],
                ].join(" ")}
              >
                <span className="shrink-0">{ICONS[t.variant]}</span>
                <span className="flex-1">{t.message}</span>
                <button
                  onClick={() => remove(t.id)}
                  aria-label="Dismiss"
                  className="opacity-70 hover:opacity-100 transition-opacity cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current rounded"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}
