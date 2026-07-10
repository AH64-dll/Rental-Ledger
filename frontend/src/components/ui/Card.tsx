import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  children: ReactNode;
}

export function Card({ hoverable, className = "", children, ...rest }: CardProps) {
  return (
    <div
      className={[
        "bg-white rounded-xl shadow-sm border border-slate-200",
        hoverable ? "transition-shadow duration-200 hover:shadow-md" : "",
        className,
      ].join(" ")}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = "", children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={["px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-3", className].join(" ")}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardBody({ className = "", children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={["p-6", className].join(" ")} {...rest}>
      {children}
    </div>
  );
}

export function CardFooter({ className = "", children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={["px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-xl", className].join(" ")}
      {...rest}
    >
      {children}
    </div>
  );
}
