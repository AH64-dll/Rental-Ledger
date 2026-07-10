import type { ReactNode } from "react";

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabsProps {
  items: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
}

export function Tabs({ items, activeId, onChange }: TabsProps) {
  return (
    <div>
      <div className="flex gap-1 border-b border-slate-200 mb-4 overflow-x-auto" role="tablist">
        {items.map((item) => {
          const active = item.id === activeId;
          return (
            <button
              key={item.id}
              role="tab"
              aria-selected={active}
              onClick={() => onChange(item.id)}
              className={[
                "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors cursor-pointer whitespace-nowrap",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                active
                  ? "border-indigo-600 text-indigo-700"
                  : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300",
              ].join(" ")}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {items.find((i) => i.id === activeId)?.content}
    </div>
  );
}
