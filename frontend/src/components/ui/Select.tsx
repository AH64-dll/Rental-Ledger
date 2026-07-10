import { forwardRef, type SelectHTMLAttributes, type ReactNode } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, className = "", id, children, ...rest },
  ref
) {
  const selectId = id || `select-${Math.random().toString(36).slice(2, 9)}`;
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        className={[
          "w-full h-10 rounded-lg border bg-white text-sm text-slate-900 px-3",
          "transition-colors duration-200",
          "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
          "disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
          error ? "border-rose-300 focus:ring-rose-500 focus:border-rose-500" : "border-slate-200",
          className,
        ].join(" ")}
        {...rest}
      >
        {children}
      </select>
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  );
});
