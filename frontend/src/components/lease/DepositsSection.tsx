import { useState } from "react";
import { Money } from "../Money";
import { ErrorBanner } from "../ErrorBanner";
import { useLeaseDeposits, useCreateDeposit } from "../../hooks/useDeposits";
import { useLanguage } from "../../context/LanguageContext";

export function DepositsSection({ leaseId }: { leaseId: number }) {
  const { data: deposits } = useLeaseDeposits(leaseId);
  const createDeposit = useCreateDeposit();
  const { language, t } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [amountEgp, setAmountEgp] = useState("");
  const [collectedDate, setCollectedDate] = useState("");
  const [notes, setNotes] = useState("");
  const [mutationError, setMutationError] = useState<string | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setMutationError(null);
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
        },
        onError: (err: any) => {
          setMutationError(err?.response?.data?.detail || err?.message || t("operation_failed"));
        },
      }
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">{t("deposits")}</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white rounded px-4 py-2 text-sm font-medium"
        >
          {t("add_deposit")}
        </button>
      </div>

      <ErrorBanner error={mutationError} />

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white rounded shadow-sm p-4 mb-4 flex flex-col gap-3"
        >
          <input
            type="number"
            step="0.01"
            placeholder={t("amount_cents")}
            value={amountEgp}
            onChange={(e) => setAmountEgp(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
            required
          />
          <input
            type="date"
            value={collectedDate}
            onChange={(e) => setCollectedDate(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
            required
          />
          <input
            type="text"
            placeholder={t("notes_optional")}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={createDeposit.isPending}
              className="bg-green-600 text-white rounded px-4 py-2 text-sm disabled:opacity-50"
            >
              {createDeposit.isPending ? t("saving") : t("save")}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-gray-600 text-sm"
            >
              {t("cancel")}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {deposits?.length === 0 && (
          <p className="text-gray-500 text-sm">{t("no_deposits")}</p>
        )}
        {deposits?.map((d) => (
          <div
            key={d.id}
            className="bg-white rounded shadow-sm p-3 flex justify-between items-center"
          >
            <div>
              <span className="font-medium text-sm">
                <Money cents={d.amount_held_cents} />
              </span>
              <span className="text-xs text-gray-500 ml-3">
                {t("collected")}: {new Date(d.collected_date).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US")}
                {d.notes && ` — ${d.notes}`}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

