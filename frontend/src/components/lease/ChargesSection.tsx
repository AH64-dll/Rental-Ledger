import { useState } from "react";
import { Money } from "../Money";
import { StatusPill } from "../StatusPill";
import { useLeaseCharges, useCreateCharge, useDeleteCharge } from "../../hooks/useCharges";
import { PaymentsSection } from "./PaymentsSection";
import { useLanguage } from "../../context/LanguageContext";
import { useToast } from "../ui/Toast";
import { useConfirm } from "../ui/ConfirmDialog";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Modal } from "../ui/Modal";
import { Card, CardBody } from "../ui/Card";
import { EmptyState } from "../ui/EmptyState";
import { Plus, Receipt, Trash2, ChevronDown, ChevronUp } from "../ui/AppIcon";
import { getLocalDateString } from "../../utils/dateUtils";

export function ChargesSection({ leaseId }: { leaseId: number }) {
  const { data: charges } = useLeaseCharges(leaseId);
  const createCharge = useCreateCharge();
  const deleteCharge = useDeleteCharge();
  const { language, t } = useLanguage();
  const toast = useToast();
  const { confirm } = useConfirm();
  const [showForm, setShowForm] = useState(false);
  const [description, setDescription] = useState("");
  const [amountEgp, setAmountEgp] = useState("");
  const [category, setCategory] = useState("rent");
  const [expandedCharge, setExpandedCharge] = useState<number | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const today = getLocalDateString();
    createCharge.mutate(
      {
        leaseId,
        description,
        amount_cents: Math.round(Number(amountEgp) * 100),
        charge_date: today,
        due_date: today,
        category: category || undefined,
      },
      {
        onSuccess: () => {
          setShowForm(false);
          setDescription("");
          setAmountEgp("");
          setCategory("rent");
          toast.success(t("charge_added"));
        },
        onError: (err: { response?: { data?: { detail?: string } }; message?: string }) =>
          toast.error(err?.response?.data?.detail || err?.message || t("operation_failed")),
      }
    );
  };

  const handleDelete = async (id: number) => {
    const ok = await confirm({
      title: t("delete_confirm_title"),
      message: t("confirm_delete_charge"),
      confirmLabel: t("delete"),
      variant: "danger",
    });
    if (!ok) return;
    deleteCharge.mutate(
      { leaseId, chargeId: id },
      {
        onSuccess: () => toast.success(t("charge_deleted")),
        onError: (err: { response?: { data?: { detail?: string } }; message?: string }) =>
          toast.error(err?.response?.data?.detail || err?.message || t("operation_failed")),
      }
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900">{t("charges")}</h3>
        <Button leftIcon={<Plus size={16} />} onClick={() => setShowForm(true)}>
          {t("add_charge")}
        </Button>
      </div>

      {charges && charges.length > 0 ? (
        <div className="space-y-3">
          {charges.map((c) => (
            <Card key={c.id}>
              <CardBody>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <Receipt size={18} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-900">{c.description}</span>
                        <StatusPill status={c.status} />
                      </div>
                      <div className="text-xs text-slate-500">
                        {new Date(c.charge_date).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US")}
                        {c.due_date && ` — ${t("due_date")}: ${new Date(c.due_date).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US")}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div>
                      <div className="text-xs text-slate-500">{t("amount")}</div>
                      <div className="font-semibold text-slate-900"><Money cents={c.amount_cents} /></div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">{t("paid")}</div>
                      <div className="text-slate-900"><Money cents={c.paid_cents} /></div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">{t("balance")}</div>
                      <div className="font-semibold text-slate-900"><Money cents={c.balance_cents} /></div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        rightIcon={expandedCharge === c.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        onClick={() => setExpandedCharge(expandedCharge === c.id ? null : c.id)}
                      >
                        {t("payments")}
                      </Button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        aria-label={t("delete")}
                        className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
                {expandedCharge === c.id && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <PaymentsSection chargeId={c.id} />
                  </div>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState icon={<Receipt size={24} />} title={t("no_charges_yet")} />
      )}

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={t("add_charge")}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowForm(false)}>{t("cancel")}</Button>
            <Button onClick={handleCreate} loading={createCharge.isPending}>
              {createCharge.isPending ? t("saving") : t("save")}
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label={t("description")}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            autoFocus
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t("amount_cents")}
              type="number"
              step="0.01"
              value={amountEgp}
              onChange={(e) => setAmountEgp(e.target.value)}
              required
            />
            <Select label={t("category")} value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="rent">{t("rent_category")}</option>
              <option value="late_fee">{t("late_fee_category")}</option>
              <option value="other">{t("other_category")}</option>
            </Select>
          </div>
        </form>
      </Modal>
    </div>
  );
}
