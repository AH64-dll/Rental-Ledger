import { useDashboard } from "../hooks/useDashboard";
import { Money } from "../components/Money";
import { useLanguage } from "../context/LanguageContext";
import { PageHeader } from "../components/ui/PageHeader";
import { Card, CardBody } from "../components/ui/Card";
import { Skeleton } from "../components/ui/Skeleton";
import {
  FileText,
  AlertCircle,
  Wallet,
  TrendingUp,
  Clock,
} from "../components/ui/AppIcon";
import type { ReactNode } from "react";

export function Dashboard() {
  const { data, isLoading, error } = useDashboard();
  const { language, t } = useLanguage();

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title={t("dashboard")} />
        <Card>
          <CardBody>
            <p className="text-sm text-rose-600">{t("failed_load_dashboard")}</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  const locale = language === "ar" ? "ar-EG" : "en-US";

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("dashboard")}
        description={new Date().toLocaleDateString(locale, {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<FileText size={20} />}
          label={t("active_leases")}
          value={data ? String(data.active_leases) : undefined}
          tone="indigo"
        />
        <StatCard
          icon={<AlertCircle size={20} />}
          label={t("overdue_charges")}
          value={data ? String(data.overdue_charges) : undefined}
          tone="rose"
        />
        <StatCard
          icon={<Wallet size={20} />}
          label={t("total_owed_to_you")}
          value={data ? <Money cents={data.total_owed_to_you_cents} /> : undefined}
          tone="emerald"
        />
        <StatCard
          icon={<TrendingUp size={20} />}
          label={t("deposits_held")}
          value={data ? <Money cents={data.deposits_held_cents} /> : undefined}
          tone="emerald"
        />
      </div>

      <Card>
        <CardBody>
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Clock size={18} />
            </div>
            <h2 className="text-base font-semibold text-slate-900">{t("expiring_soon")}</h2>
          </div>
          {isLoading ? (
            <Skeleton className="h-7 w-40" />
          ) : data ? (
            <p className="text-2xl font-semibold text-slate-900" aria-label={`${data.expiring_leases} ${t(data.expiring_leases === 1 ? "lease_count_singular" : "lease_count_plural")}`}>
              {data.expiring_leases}{" "}
              <span className="text-sm font-normal text-slate-500">
                {t(data.expiring_leases === 1 ? "lease_count_singular" : "lease_count_plural")}
              </span>
            </p>
          ) : null}
        </CardBody>
      </Card>
    </div>
  );
}

type Tone = "indigo" | "rose" | "emerald" | "amber";

const toneClasses: Record<Tone, { bg: string; text: string }> = {
  indigo: { bg: "bg-indigo-50", text: "text-indigo-600" },
  rose: { bg: "bg-rose-50", text: "text-rose-600" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-600" },
  amber: { bg: "bg-amber-50", text: "text-amber-600" },
};

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  tone: Tone;
}) {
  const tones = toneClasses[tone];
  return (
    <Card>
      <CardBody className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            {label}
          </span>
          <div className={`h-9 w-9 rounded-lg ${tones.bg} ${tones.text} flex items-center justify-center`}>
            {icon}
          </div>
        </div>
        {value === undefined ? (
          <Skeleton className="h-7 w-24" />
        ) : (
          <div className="text-2xl font-semibold text-slate-900 tracking-tight">{value}</div>
        )}
      </CardBody>
    </Card>
  );
}
