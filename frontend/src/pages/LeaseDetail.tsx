import { useState, type ReactNode } from "react";
import { useParams } from "react-router-dom";
import { useLease } from "../hooks/useLeases";
import { Money } from "../components/Money";
import { StatusPill } from "../components/StatusPill";
import { ChargesSection } from "../components/lease/ChargesSection";
import { DepositsSection } from "../components/lease/DepositsSection";
import { useLanguage } from "../context/LanguageContext";
import { PageHeader } from "../components/ui/PageHeader";
import { Card, CardBody } from "../components/ui/Card";
import { Tabs } from "../components/ui/Tabs";
import { Skeleton } from "../components/ui/Skeleton";
import { Calendar, DollarSign, Wallet, TrendingUp } from "../components/ui/AppIcon";

type Tab = "charges" | "deposits";

export function LeaseDetail() {
  const { id } = useParams<{ id: string }>();
  const leaseId = id ? Number(id) : null;
  const { data: lease, isLoading, error } = useLease(leaseId);
  const [tab, setTab] = useState<Tab>("charges");
  const { language, t } = useLanguage();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title={t("leases")} backTo="/leases" />
        <Card>
          <CardBody>
            <p className="text-sm text-rose-600">{t("failed_load_lease")}</p>
          </CardBody>
        </Card>
      </div>
    );
  }
  if (!lease || leaseId === null) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={lease.tenant_name}
        description={lease.property_name}
        backTo="/leases"
        actions={<StatusPill status={lease.status} />}
      />

      <Card>
        <CardBody>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <InfoTile
              icon={<Calendar size={16} />}
              label={t("period")}
              value={`${new Date(lease.start_date).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US")} — ${new Date(lease.end_date).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US")}`}
            />
            <InfoTile
              icon={<DollarSign size={16} />}
              label={t("rent")}
              value={<><Money cents={lease.monthly_rent_cents} /> / {t("month_short")}</>}
            />
            <InfoTile
              icon={<Calendar size={16} />}
              label={t("due_day_label")}
              value={String(lease.rent_due_day_of_month)}
            />
            <InfoTile
              icon={<Wallet size={16} />}
              label={t("deposit_label")}
              value={<Money cents={lease.security_deposit_cents} />}
            />
            <InfoTile
              icon={<TrendingUp size={16} />}
              label={t("late_fee_label")}
              value={`${lease.late_fee_percent}%`}
            />
          </div>
        </CardBody>
      </Card>

      <Tabs
        activeId={tab}
        onChange={(id) => setTab(id as Tab)}
        items={[
          { id: "charges", label: t("charges_payments"), content: <ChargesSection leaseId={leaseId} /> },
          { id: "deposits", label: t("deposits"), content: <DepositsSection leaseId={leaseId} /> },
        ]}
      />
    </div>
  );
}

function InfoTile({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 uppercase tracking-wider">
        {icon}
        {label}
      </div>
      <div className="text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}
