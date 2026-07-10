import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { AlertCircle } from "./AppIcon";

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
}

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextValue | undefined>(undefined);

interface PendingConfirm extends ConfirmOptions {
  resolve: (value: boolean) => void;
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<PendingConfirm | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setPending({ ...options, resolve });
    });
  }, []);

  const handleClose = (value: boolean) => {
    if (pending) {
      pending.resolve(value);
      setPending(null);
    }
  };

  const value = useMemo<ConfirmContextValue>(() => ({ confirm }), [confirm]);

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      <Modal
        open={pending !== null}
        onClose={() => handleClose(false)}
        title={pending?.title ?? ""}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => handleClose(false)}>
              {pending?.cancelLabel ?? "Cancel"}
            </Button>
            <Button
              variant={pending?.variant === "danger" ? "danger" : "primary"}
              onClick={() => handleClose(true)}
            >
              {pending?.confirmLabel ?? "Confirm"}
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-3">
          <span className="shrink-0 mt-0.5 text-rose-500">
            <AlertCircle size={20} />
          </span>
          <p className="text-sm text-slate-600">{pending?.message}</p>
        </div>
      </Modal>
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): ConfirmContextValue {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return ctx;
}
