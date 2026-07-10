import { useState } from "react";
import { Money } from "../Money";
import { useLeaseDeposits, useCreateDeposit } from "../../hooks/useDeposits";
import { useLanguage } from "../../context/LanguageContext";
import { useToast } from "../ui/Toast";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Modal } from "../ui/Modal";
import { Card, CardBody } from "../ui/Card";
import { EmptyState } from "../ui/EmptyState";
import { Plus, Wallet } from "../ui/AppIcon";

export function DepositsSection({ leaseId }: { leaseId: number }) {
  const { data: deposits } = useLeaseDeposits(leaseId);
  const createDeposit = useCreateDeposit();
  const { language, t } = useLanguage();
  const toast = useToast();
  const [showForm, setShowForm] = useState(false);
  const [amountEgp, setAmountEgp] = useState("");
  const [collectedDate, setCollectedDate] = useState("");
  const [notes, setNotes] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createDeposit.mutate(
      {
        leaseId,
        amount_held_cents: Math.round(Number(amountEgp) * 100),
        collected_date: collectedDate,
        notes: notes || undefined,
      },
      {
        onSuccess: () => {
          setShowForm(false);
          setAmountEgp("");
          setCollectedDate("");
          setNotes("");
          toast.success(t("deposit_added"));
        },
        onError: (err: { response?: { data?: { detail?: string } }; message?: string }) =>
          toast.error(err?.response?.data?.detail || err?.message || t("operation_failed")),
      }
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900">{t("deposits")}</h3>
        <Button leftIcon={<Plus size={16} />} onClick={() => setShowForm(true)}>
          {t("add_deposit")}
        </Button>
      </div>

      {deposits && deposits.length > 0 ? (
        <div className="space-y-3">
          {deposits.map((d) => (
            <Card key={d.id}>
              <CardBody>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Wallet size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900">
                      <Money cents={d.amount_held_cents} />
                    </div>
                    <div className="text-xs text-slate-500">
                      {t("collected")}: {new Date(d.collected_date).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US")}
                      {d.notes && ` — ${d.notes}`}
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState icon={<Wallet size={24} />} title={t("no_deposits")} />
      )}

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={t("add_deposit")}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowForm(false)}>{t("cancel")}</Button>
            <Button onClick={handleCreate} loading={createDeposit.isPending}>
              {createDeposit.isPending ? t("saving") : t("save")}
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label={t("amount_cents")}
            type="number"
            step="0.01"
            value={amountEgp}
            onChange={(e) => setAmountEgp(e.target.value)}
            required
            autoFocus
          />
          <Input
            label={t("debt_date")}
            type="date"
            value={collectedDate}
            onChange={(e) => setCollectedDate(e.target.value)}
            required
          />
          <Input
            label={`${t("notes")} ${t("optional")}`}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </form>
      </Modal>
    </div>
  );
}
