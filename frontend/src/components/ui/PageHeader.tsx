import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "./AppIcon";
import { useLanguage } from "../../context/LanguageContext";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  backTo?: string;
}

export function PageHeader({ title, description, actions, backTo }: PageHeaderProps) {
  const { language, t } = useLanguage();
  const BackIcon = language === "ar" ? ArrowRight : ArrowLeft;
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3 min-w-0">
        {backTo && (
          <Link
            to={backTo}
            aria-label={t("back")}
            className="mt-1 p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <BackIcon size={20} />
          </Link>
        )}
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight truncate">{title}</h1>
          {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}
