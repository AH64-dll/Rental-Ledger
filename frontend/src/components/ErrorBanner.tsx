interface ErrorBannerProps {
  error: unknown;
}

export function ErrorBanner({ error }: ErrorBannerProps) {
  if (!error) return null;
  const message =
    (error as any)?.response?.data?.detail ||
    (error as any)?.message ||
    "An unexpected error occurred.";
  return (
    <div className="bg-red-50 border border-red-200 text-red-800 rounded px-4 py-3 text-sm mb-4">
      {typeof message === "string" ? message : JSON.stringify(message)}
    </div>
  );
}
