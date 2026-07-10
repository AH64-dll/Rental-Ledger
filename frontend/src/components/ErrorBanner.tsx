import { AlertCircle } from "./ui/AppIcon";

interface ErrorBannerProps {
  error: unknown;
}

export function ErrorBanner({ error }: ErrorBannerProps) {
  if (!error) return null;
  const message =
    (error as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail ||
    (error as { message?: string })?.message ||
    "An unexpected error occurred.";
  return (
    <div
      role="alert"
      className="flex items-start gap-2 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg px-4 py-3 text-sm mb-4"
    >
      <AlertCircle size={18} className="shrink-0 mt-0.5" />
      <span>{typeof message === "string" ? message : JSON.stringify(message)}</span>
    </div>
  );
}
