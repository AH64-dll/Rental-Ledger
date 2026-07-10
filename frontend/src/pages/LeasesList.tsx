import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  useLeases,
  useCreateLease,
  useDeleteLease,
  useEndLease,
} from "../hooks/useLeases";
import { useProperties } from "../hooks/useProperties";
import { useTenants } from "../hooks/useTenants";
import { Money } from "../components/Money";
import { StatusPill } from "../components/StatusPill";
import { useLanguage } from "../context/LanguageContext";
import { useToast } from "../components/ui/Toast";
import { useConfirm } from "../components/ui/ConfirmDialog";
import { PageHeader } from "../components/ui/PageHeader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Table, THead, TBody, TR, TH, TD } from "../components/ui/Table";
import { EmptyState } from "../components/ui/EmptyState";
import { Skeleton } from "../components/ui/Skeleton";
import { Plus, FileText, ChevronRight, ChevronLeft, Check, Trash2, Filter } from "../components/ui/AppIcon";
import { getLocalDateString, getLocalOneYearLaterDateString } from "../utils/dateUtils";

type StatusFilter = "all" | "active" | "ended" | "expired";

export function LeasesList() {
  const { data, isLoading, error } = useLeases();
  const createMutation = useCreateLease();
  const deleteMutation = useDeleteLease();
  const endMutation = useEndLease();
  const { language, t } = useLanguage();
  const toast = useToast();
  const { confirm } = useConfirm();
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const { data: properties } = useProperties();
  const { data: tenants } = useTenants();

  const [propertyId, setPropertyId] = useState<number | null>(null);
  const [tenantId, setTenantId] = useState<number | null>(null);
  const [startDate, setStartDate] = useState(getLocalDateString());
  const [endDate, setEndDate] = useState(getLocalOneYearLaterDateString());
  const [monthlyRentEgp, setMonthlyRentEgp] = useState("");
  const [dueDay, setDueDay] = useState(1);
  const [lateFeePercent, setLateFeePercent] = useState(0);
  const [securityDepositEgp, setSecurityDepositEgp] = useState("");

  const Chevron = language === "ar" ? ChevronLeft : ChevronRight;

  const filtered = useMemo(() => {
    if (!data) return [];
    if (statusFilter === "all") return data;
    return data.filter((l) => l.status === statusFilter);
  }, [data, statusFilter]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyId || !tenantId) return;
    createMutation.mutate(
      {
        property_id: propertyId,
        tenant_id: tenantId,
        start_date: startDate,
        end_date: endDate,
        monthly_rent_cents: Math.round(Number(monthlyRentEgp) * 100),
        rent_due_day_of_month: dueDay,
        late_fee_percent: lateFeePercent || undefined,
        security_deposit_cents: securityDepositEgp ? Math.round(Number(securityDepositEgp) * 100) : undefined,
      },
      {
        onSuccess: () => {
          setShowForm(false);
          setPropertyId(null);
          setTenantId(null);
          setStartDate(getLocalDateString());
          setEndDate(getLocalOneYearLaterDateString());
          setMonthlyRentEgp("");
          setDueDay(1);
          setLateFeePercent(0);
          setSecurityDepositEgp("");
          toast.success(t("lease_created"));
        },
        onError: (err: { response?: { data?: { detail?: string } }; message?: string }) =>
          toast.error(err?.response?.data?.detail || err?.message || t("operation_failed")),
      }
    );
  };

  const handleEnd = async (id: number) => {
    const ok = await confirm({
      title: t("end"),
      message: t("confirm_end_lease"),
      confirmLabel: t("end"),
      variant: "primary",
    });
    if (!ok) return;
    endMutation.mutate(id, {
      onSuccess: () => toast.success(t("lease_ended")),
      onError: (err: { response?: { data?: { detail?: string } }; message?: string }) =>
        toast.error(err?.response?.data?.detail || err?.message || t("operation_failed")),
    });
  };

  const handleDelete = async (id: number) => {
    const ok = await confirm({
      title: t("delete_confirm_title"),
      message: t("confirm_delete_lease"),
      confirmLabel: t("delete"),
      variant: "danger",
    });
    if (!ok) return;
    deleteMutation.mutate(id, {
      onSuccess: () => toast.success(t("lease_deleted")),
      onError: (err: { response?: { data?: { detail?: string } }; message?: string }) =>
        toast.error(err?.response?.data?.detail || err?.message || t("operation_failed")),
    });
  };

  if (error) {
    return (
      <div>
        <PageHeader title={t("leases")} description={t("leases_desc")} />
        <Card>
          <div className="p-6 text-sm text-rose-600">{t("failed_load_leases")}</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("leases")}
        description={t("leases_desc")}
        actions={
          <Button leftIcon={<Plus size={16} />} onClick={() => setShowForm(true)}>
            {t("add_lease")}
          </Button>
        }
      />

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-slate-500 inline-flex items-center gap-1">
          <Filter size={12} /> {t("status")}:
        </span>
        {(["all", "active", "ended", "expired"] as StatusFilter[]).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={[
              "text-xs px-2.5 py-1 rounded-full border transition-colors cursor-pointer",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
              statusFilter === s
                ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50",
            ].join(" ")}
          >
            {s === "all" ? t("all_statuses") : t(`status_${s}`)}
          </button>
        ))}
      </div>

      <Card>
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (<Skeleton key={i} className="h-10 w-full" />))}
          </div>
        ) : filtered.length > 0 ? (
          <Table>
            <THead>
              <TR>
                <TH>{t("tenant")}</TH>
                <TH>{t("property")}</TH>
                <TH>{t("period")}</TH>
                <TH>{t("rent")}</TH>
                <TH>{t("status")}</TH>
                <TH className="w-32">{t("actions")}</TH>
              </TR>
            </THead>
            <TBody>
              {filtered.map((l) => (
                <TR key={l.id}>
                  <TD>
                    <Link
                      to={`/leases/${l.id}`}
                      className="font-medium text-slate-900 hover:text-indigo-600 transition-colors inline-flex items-center gap-1"
                    >
                      {l.tenant_name}
                      <Chevron size={14} className="text-slate-400" />
                    </Link>
                  </TD>
                  <TD className="text-slate-600">{l.property_name}</TD>
                  <TD className="text-slate-600">
                    {new Date(l.start_date).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US")} —{" "}
                    {new Date(l.end_date).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US")}
                  </TD>
                  <TD><Money cents={l.monthly_rent_cents} /></TD>
                  <TD><StatusPill status={l.status} /></TD>
                  <TD>
                    <div className="flex items-center gap-1">
                      {l.status === "active" && (
                        <button
                          onClick={() => handleEnd(l.id)}
                          aria-label={t("end")}
                          className="p-1.5 rounded text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                          title={t("end")}
                        >
                          <Check size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(l.id)}
                        aria-label={t("delete")}
                        className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        ) : (
          <EmptyState
            icon={<FileText size={24} />}
            title={t("no_leases")}
            description={t("add_first_lease")}
            action={
              <Button leftIcon={<Plus size={16} />} onClick={() => setShowForm(true)}>
                {t("add_lease")}
              </Button>
            }
          />
        )}
      </Card>

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={t("add_lease")}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowForm(false)}>{t("cancel")}</Button>
            <Button onClick={handleCreate} loading={createMutation.isPending}>
              {createMutation.isPending ? t("saving") : t("save")}
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label={t("property")}
              value={propertyId ?? ""}
              onChange={(e) => setPropertyId(e.target.value ? Number(e.target.value) : null)}
              required
            >
              <option value="">{t("select_property")}</option>
              {properties?.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
            </Select>
            <Select
              label={t("tenant")}
              value={tenantId ?? ""}
              onChange={(e) => setTenantId(e.target.value ? Number(e.target.value) : null)}
              required
            >
              <option value="">{t("select_tenant")}</option>
              {tenants?.map((tn) => (<option key={tn.id} value={tn.id}>{tn.name}</option>))}
            </Select>
            <Input label={t("start_date")} type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
            <Input label={t("end_date")} type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
            <Input label={t("monthly_rent_egp")} type="number" step="0.01" value={monthlyRentEgp} onChange={(e) => setMonthlyRentEgp(e.target.value)} required />
            <Input label={t("due_day")} type="number" min={1} max={28} value={dueDay} onChange={(e) => setDueDay(Number(e.target.value))} />
            <Input label={t("late_fee_percent")} type="number" value={lateFeePercent || ""} onChange={(e) => setLateFeePercent(Number(e.target.value))} />
            <Input label={t("security_deposit_egp")} type="number" step="0.01" value={securityDepositEgp} onChange={(e) => setSecurityDepositEgp(e.target.value)} />
          </div>
        </form>
      </Modal>
    </div>
  );
}
