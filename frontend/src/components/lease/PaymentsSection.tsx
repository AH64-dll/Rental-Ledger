import { useState } from "react";
import { Money } from "../Money";
import { useChargePayments, useCreatePayment, useDeletePayment } from "../../hooks/usePayments";
import { useLanguage } from "../../context/LanguageContext";
import { useToast } from "../ui/Toast";
import { useConfirm } from "../ui/ConfirmDialog";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { DollarSign, Trash2, Plus } from "../ui/AppIcon";
import { getLocalDateString } from "../../utils/dateUtils";

export function PaymentsSection({ chargeId }: { chargeId: number }) {
  const { data: payments } = useChargePayments(chargeId);
  const createPayment = useCreatePayment();
  const deletePayment = useDeletePayment();
  const { language, t } = useLanguage();
  const toast = useToast();
  const { confirm } = useConfirm();
  const [showForm, setShowForm] = useState(false);
  const [amountEgp, setAmountEgp] = useState("");
  const [method, setMethod] = useState("");
  const [notes, setNotes] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const today = getLocalDateString();
    createPayment.mutate(
      {
        chargeId,
        amount_cents: Math.round(Number(amountEgp) * 100),
        payment_date: today,
        method: method || undefined,
        notes: notes || undefined,
      },
      {
        onSuccess: () => {
          setShowForm(false);
          setAmountEgp("");
          setMethod("");
          setNotes("");
          toast.success(t("payment_logged"));
        },
        onError: (err: { response?: { data?: { detail?: string } }; message?: string }) =>
          toast.error(err?.response?.data?.detail || err?.message || t("operation_failed")),
      }
    );
  };

  const handleDelete = async (id: number) => {
    const ok = await confirm({
      title: t("delete_confirm_title"),
      message: t("confirm_delete_payment"),
      confirmLabel: t("delete"),
      variant: "danger",
    });
    if (!ok) return;
    deletePayment.mutate(id, {
      onSuccess: () => toast.success(t("payment_logged")),
      onError: (err: { response?: { data?: { detail?: string } }; message?: string }) =>
        toast.error(err?.response?.data?.detail || err?.message || t("operation_failed")),
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
          {t("payments")}
        </span>
        <Button
          size="sm"
          variant="ghost"
          leftIcon={showForm ? undefined : <Plus size={14} />}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? t("cancel") : t("log_payment")}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            type="number"
            step="0.01"
            placeholder={t("amount_cents")}
            value={amountEgp}
            onChange={(e) => setAmountEgp(e.target.value)}
            required
          />
          <Input
            placeholder={t("method")}
            value={method}
            onChange={(e) => setMethod(e.target.value)}
          />
          <Input
            placeholder={t("notes")}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <div className="sm:col-span-3 flex justify-end">
            <Button
              type="submit"
              size="sm"
              leftIcon={<DollarSign size={14} />}
              loading={createPayment.isPending}
            >
              {t("save")}
            </Button>
          </div>
        </form>
      )}

      {payments && payments.length > 0 ? (
        <div className="space-y-2">
          {payments.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between gap-2 bg-slate-50 rounded-lg px-3 py-2 text-sm"
            >
              <div className="flex-1 min-w-0">
                <span className="font-semibold text-slate-900">
                  <Money cents={p.amount_cents} />
                </span>
                <span className="text-xs text-slate-500 ms-2">
                  {new Date(p.payment_date).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US")}
                  {p.method && ` — ${p.method}`}
                  {p.notes && ` — ${p.notes}`}
                </span>
              </div>
              <button
                onClick={() => handleDelete(p.id)}
                aria-label={t("delete")}
                className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-400">{t("no_payments")}</p>
      )}
    </div>
  );
}
