import { useState } from "react";
import { useAllCharges, useDeleteGeneralCharge } from "../hooks/useCharges";
import { useTenants } from "../hooks/useTenants";
import { useCreatePayment } from "../hooks/usePayments";
import { Money } from "../components/Money";
import { StatusPill } from "../components/StatusPill";
import { DebtForm } from "../components/debts/DebtForm";
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
import { Plus, AlertCircle, DollarSign, Trash2 } from "../components/ui/AppIcon";
import { getElapsedDuration, getLocalDateString } from "../utils/dateUtils";

export function DebtsList() {
  const { data: charges, isLoading: chargesLoading, error: chargesError } = useAllCharges();
  const { data: tenants } = useTenants();
  const deleteDebtMutation = useDeleteGeneralCharge();
  const createPaymentMutation = useCreatePayment();
  const { language, t } = useLanguage();
  const toast = useToast();
  const { confirm } = useConfirm();
  const [mutationError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [selectedTenantId, setSelectedTenantId] = useState<number | null>(null);

  const [paymentChargeId, setPaymentChargeId] = useState<number | null>(null);
  const [paymentAmountEgp, setPaymentAmountEgp] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");

  const activeDebts = charges?.filter((c) => c.lease_id === null && c.balance_cents > 0) || [];

  const handleDeleteDebt = async (id: number) => {
    const ok = await confirm({
      title: t("delete_confirm_title"),
      message: t("confirm_delete_debt"),
      confirmLabel: t("delete"),
      variant: "danger",
    });
    if (!ok) return;
    deleteDebtMutation.mutate(id, {
      onSuccess: () => toast.success(t("debt_deleted")),
      onError: (err: { response?: { data?: { detail?: string } }; message?: string }) =>
        toast.error(err?.response?.data?.detail || err?.message || t("operation_failed")),
    });
  };

  const handlePayment = (e: React.FormEvent, chargeId: number) => {
    e.preventDefault();
    if (!paymentAmountEgp) return;
    const today = getLocalDateString();
    createPaymentMutation.mutate(
      {
        chargeId,
        amount_cents: Math.round(Number(paymentAmountEgp) * 100),
        payment_date: today,
        method: paymentMethod || undefined,
        notes: paymentNotes || undefined,
      },
      {
        onSuccess: () => {
          setPaymentChargeId(null);
          setPaymentAmountEgp("");
          setPaymentMethod("");
          setPaymentNotes("");
          toast.success(t("payment_logged"));
        },
        onError: (err: { response?: { data?: { detail?: string } }; message?: string }) =>
          toast.error(err?.response?.data?.detail || err?.message || t("operation_failed")),
      }
    );
  };

  if (chargesError) {
    return (
      <div>
        <PageHeader title={t("debts")} description={t("debts_desc")} />
        <Card>
          <div className="p-6 text-sm text-rose-600">{t("failed_load_charges")}</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("debts")}
        description={t("debts_desc")}
        actions={
          <Button leftIcon={<Plus size={16} />} onClick={() => setShowForm(true)}>
            {t("add_debt")}
          </Button>
        }
      />

      <Card>
        {chargesLoading ? (
          <div className="p-6 space-y-3" aria-busy="true" aria-live="polite">
            {[1, 2, 3].map((i) => (<Skeleton key={i} className="h-10 w-full" />))}
          </div>
        ) : activeDebts.length > 0 ? (
          <Table>
            <THead>
              <TR>
                <TH>{t("tenant")}</TH>
                <TH>{t("description")}</TH>
                <TH>{t("amount")}</TH>
                <TH>{t("paid")}</TH>
                <TH>{t("remaining")}</TH>
                <TH>{t("debt_date")}</TH>
                <TH>{t("elapsed_duration")}</TH>
                <TH>{t("status")}</TH>
                <TH className="w-32">{t("actions")}</TH>
              </TR>
            </THead>
            <TBody>
              {activeDebts.map((c) => (
                <TR key={c.id}>
                  <TD className="text-slate-600">{c.tenant_name}</TD>
                  <TD className="font-medium text-slate-900">{c.description}</TD>
                  <TD><Money cents={c.amount_cents} /></TD>
                  <TD><Money cents={c.paid_cents} /></TD>
                  <TD className="font-semibold text-slate-900"><Money cents={c.balance_cents} /></TD>
                  <TD className="text-slate-500">
                    {c.charge_date ? new Date(c.charge_date).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US") : "—"}
                  </TD>
                  <TD className="text-slate-500">{getElapsedDuration(c.charge_date, new Date(), language)}</TD>
                  <TD><StatusPill status={c.status} /></TD>
                  <TD>
                    {paymentChargeId === c.id ? (
                      <form onSubmit={(e) => handlePayment(e, c.id)} className="space-y-2 min-w-[180px]">
                        <Input
                          type="number"
                          step="0.01"
                          placeholder={t("amount")}
                          value={paymentAmountEgp}
                          onChange={(e) => setPaymentAmountEgp(e.target.value)}
                          required
                        />
                        <Input
                          placeholder={t("method")}
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <Button type="submit" size="sm" leftIcon={<DollarSign size={14} />} loading={createPaymentMutation.isPending}>
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
                          onClick={() => handleDeleteDebt(c.id)}
                          aria-label={t("delete")}
                          className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        ) : (
          <EmptyState icon={<AlertCircle size={24} />} title={t("no_debts_found")} />
        )}
      </Card>

      <Modal
        open={showForm}
        onClose={() => { setShowForm(false); setSelectedTenantId(null); }}
        title={t("add_debt")}
        size="md"
      >
        <div className="space-y-4">
          <Select
            label={t("tenant")}
            value={selectedTenantId ?? ""}
            onChange={(e) => setSelectedTenantId(Number(e.target.value) || null)}
            required
          >
            <option value="">{t("select_tenant")}</option>
            {tenants?.map((tn) => (
              <option key={tn.id} value={tn.id}>{tn.name}</option>
            ))}
          </Select>
          {selectedTenantId && (
            <DebtForm
              tenantId={selectedTenantId}
              onSuccess={() => {
                setShowForm(false);
                setSelectedTenantId(null);
                toast.success(t("debt_added"));
              }}
            />
          )}
        </div>
      </Modal>
      {mutationError && null}
    </div>
  );
}
