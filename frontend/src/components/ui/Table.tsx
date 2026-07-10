import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";

export function Table({ className = "", children, ...rest }: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto">
      <table className={["w-full text-sm", className].join(" ")} {...rest}>
        {children}
      </table>
    </div>
  );
}

export function THead({ className = "", children, ...rest }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={["bg-slate-50 text-slate-500 text-xs uppercase tracking-wider", className].join(" ")}
      {...rest}
    >
      {children}
    </thead>
  );
}

export function TBody({ className = "", children, ...rest }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={["divide-y divide-slate-200", className].join(" ")} {...rest}>
      {children}
    </tbody>
  );
}

export function TR({ className = "", children, ...rest }: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={["transition-colors hover:bg-slate-50", className].join(" ")}
      {...rest}
    >
      {children}
    </tr>
  );
}

export function TH({ className = "", children, ...rest }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={["px-4 py-3 font-semibold text-start", className].join(" ")}
      {...rest}
    >
      {children}
    </th>
  );
}

export function TD({ className = "", children, ...rest }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={["px-4 py-3 text-slate-700", className].join(" ")} {...rest}>
      {children}
    </td>
  );
}
