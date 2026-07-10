import { useState } from "react";
import { useAllCharges, useDeleteCharge, useDeleteGeneralCharge } from "../hooks/useCharges";
import { useTenants } from "../hooks/useTenants";
import { useCreatePayment } from "../hooks/usePayments";
import { Money } from "../components/Money";
import { StatusPill } from "../components/StatusPill";
import { useLanguage } from "../context/LanguageContext";
import { useToast } from "../components/ui/Toast";
import { useConfirm } from "../components/ui/ConfirmDialog";
import { PageHeader } from "../components/ui/PageHeader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Table, THead, TBody, TR, TH, TD } from "../components/ui/Table";
import { EmptyState } from "../components/ui/EmptyState";
import { Skeleton } from "../components/ui/Skeleton";
import { Receipt, DollarSign } from "../components/ui/AppIcon";

export function ChargesList() {
  const [tenantFilter, setTenantFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [overdueFilter, setOverdueFilter] = useState<boolean>(false);

  const filters = {
    tenant_id: tenantFilter ? Number(tenantFilter) : undefined,
    status: statusFilter || undefined,
    overdue: overdueFilter ? true : undefined,
  };

  const { data, isLoading, error } = useAllCharges(filters);
  const { data: tenants } = useTenants();
  const createPayment = useCreatePayment();
  const deleteCharge = useDeleteCharge();
  const deleteGeneralCharge = useDeleteGeneralCharge();
  const { language, t } = useLanguage();
  const toast = useToast();
  const { confirm } = useConfirm();

  const [paymentChargeId, setPaymentChargeId] = useState<number | null>(null);
  const [amountEgp, setAmountEgp] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [method, setMethod] = useState("");
  const [notes, setNotes] = useState("");

  const handlePayment = (e: React.FormEvent, chargeId: number) => {
    e.preventDefault();
    createPayment.mutate(
      {
        chargeId,
        amount_cents: Math.round(Number(amountEgp) * 100),
        payment_date: paymentDate,
        method: method || undefined,
        notes: notes || undefined,
      },
      {
        onSuccess: () => {
          setPaymentChargeId(null);
          setAmountEgp("");
          setPaymentDate(new Date().toISOString().slice(0, 10));
          setMethod("");
          setNotes("");
          toast.success(t("payment_logged"));
        },
        onError: (err: { response?: { data?: { detail?: string } }; message?: string }) =>
          toast.error(err?.response?.data?.detail || err?.message || t("operation_failed")),
      }
    );
  };

  const handleDelete = async (c: { id: number; lease_id: number | null }) => {
    const ok = await confirm({
      title: t("delete_confirm_title"),
      message: t("confirm_delete_charge"),
      confirmLabel: t("delete"),
      variant: "danger",
    });
    if (!ok) return;
    if (c.lease_id) {
      deleteCharge.mutate(
        { leaseId: c.lease_id, chargeId: c.id },
        {
          onSuccess: () => toast.success(t("charge_deleted")),
          onError: (err: { response?: { data?: { detail?: string } }; message?: string }) =>
            toast.error(err?.response?.data?.detail || err?.message || t("operation_failed")),
        }
      );
    } else {
      deleteGeneralCharge.mutate(c.id, {
        onSuccess: () => toast.success(t("charge_deleted")),
        onError: (err: { response?: { data?: { detail?: string } }; message?: string }) =>
          toast.error(err?.response?.data?.detail || err?.message || t("operation_failed")),
      });
    }
  };

  if (error) {
    return (
      <div>
        <PageHeader title={t("charges")} description={t("charges_desc")} />
        <Card>
          <div className="p-6 text-sm text-rose-600">{t("failed_load_charges")}</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t("charges")} description={t("charges_desc")} />

      <Card>
        <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center gap-3">
          <Select
            value={tenantFilter}
            onChange={(e) => setTenantFilter(e.target.value)}
            className="w-auto min-w-[160px]"
          >
            <option value="">{t("all_tenants")}</option>
            {tenants?.map((tn) => (
              <option key={tn.id} value={tn.id}>{tn.name}</option>
            ))}
          </Select>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-auto min-w-[160px]"
          >
            <option value="">{t("all_statuses")}</option>
            <option value="paid">{t("status_paid")}</option>
            <option value="partial">{t("status_partial")}</option>
            <option value="unpaid">{t("status_unpaid")}</option>
            <option value="overdue">{t("status_overdue")}</option>
          </Select>
          <button
            onClick={() => setOverdueFilter(!overdueFilter)}
            aria-pressed={overdueFilter}
            className={[
              "text-xs px-3 py-2 rounded-lg border transition-colors cursor-pointer",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
              overdueFilter
                ? "bg-rose-50 border-rose-200 text-rose-700"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50",
            ].join(" ")}
          >
            {t("overdue_only")}
          </button>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (<Skeleton key={i} className="h-10 w-full" />))}
          </div>
        ) : data && data.length > 0 ? (
          <Table>
            <THead>
              <TR>
                <TH>{t("tenant")}</TH>
                <TH>{t("description")}</TH>
                <TH>{t("amount")}</TH>
                <TH>{t("paid")}</TH>
                <TH>{t("balance")}</TH>
                <TH>{t("status")}</TH>
                <TH>{t("due_date")}</TH>
                <TH className="w-28">{t("actions")}</TH>
              </TR>
            </THead>
            <TBody>
              {data.map((c) => (
                <TR key={c.id}>
                  <TD className="text-slate-600">{c.tenant_name}</TD>
                  <TD className="font-medium text-slate-900">{c.description}</TD>
                  <TD><Money cents={c.amount_cents} /></TD>
                  <TD><Money cents={c.paid_cents} /></TD>
                  <TD className="font-semibold text-slate-900"><Money cents={c.balance_cents} /></TD>
                  <TD><StatusPill status={c.status} /></TD>
                  <TD className="text-slate-500">
                    {c.due_date ? new Date(c.due_date).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US") : "—"}
                  </TD>
                  <TD>
                    {paymentChargeId === c.id ? (
                      <form onSubmit={(e) => handlePayment(e, c.id)} className="space-y-2 min-w-[180px]">
                        <Input
                          type="number"
                          step="0.01"
                          placeholder={t("amount")}
                          value={amountEgp}
                          onChange={(e) => setAmountEgp(e.target.value)}
                          required
                        />
                        <Input
                          type="date"
                          value={paymentDate}
                          onChange={(e) => setPaymentDate(e.target.value)}
                          required
                        />
                        <Input
                          placeholder={t("method")}
                          value={method}
                          onChange={(e) => setMethod(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <Button type="submit" size="sm" leftIcon={<DollarSign size={14} />} loading={createPayment.isPending}>
                            {t("save")}
                          </Button>
                          <Button type="button" size="sm" variant="ghost" onClick={() => setPaymentChargeId(null)}>
                            {t("cancel")}
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" onClick={() => setPaymentChargeId(c.id)}>
                          {t("pay")}
                        </Button>
                        <button
                          onClick={() => handleDelete(c)}
                          aria-label={t("delete")}
                          className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                        >
                          <Receipt size={16} />
                        </button>
                      </div>
                    )}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        ) : (
          <EmptyState icon={<Receipt size={24} />} title={t("no_charges_found")} />
        )}
      </Card>
    </div>
  );
}
