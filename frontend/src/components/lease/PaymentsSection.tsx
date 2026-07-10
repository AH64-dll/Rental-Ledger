import { useState } from "react";
import { Money } from "../Money";
import { ErrorBanner } from "../ErrorBanner";
import { useChargePayments, useCreatePayment, useDeletePayment } from "../../hooks/usePayments";
import { useLanguage } from "../../context/LanguageContext";
import { getLocalDateString } from "../../utils/dateUtils";

export function PaymentsSection({ chargeId }: { chargeId: number }) {
  const { data: payments } = useChargePayments(chargeId);
  const createPayment = useCreatePayment();
  const deletePayment = useDeletePayment();
  const { language, t } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [amountEgp, setAmountEgp] = useState("");
  const [method, setMethod] = useState("");
  const [notes, setNotes] = useState("");
  const [mutationError, setMutationError] = useState<string | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const today = getLocalDateString();
    setMutationError(null);
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
        },
        onError: (err: any) => {
          setMutationError(err?.response?.data?.detail || err?.message || t("operation_failed"));
        },
      }
    );
  };

  return (
    <div className="mt-3 pt-3 border-t">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-500">{t("payments")}</span>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-blue-600 hover:underline text-xs"
        >
          {t("log_payment")}
        </button>
      </div>

      <ErrorBanner error={mutationError} />

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="flex flex-wrap gap-2 mb-2"
        >
          <input
            type="number"
            step="0.01"
            placeholder={t("amount_cents")}
            value={amountEgp}
            onChange={(e) => setAmountEgp(e.target.value)}
            className="border rounded px-2 py-1 text-xs w-32"
            required
          />

          <input
            type="text"
            placeholder={t("method")}
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="border rounded px-2 py-1 text-xs w-24"
          />
          <input
            type="text"
            placeholder={t("notes")}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="border rounded px-2 py-1 text-xs w-32"
          />
          <button
            type="submit"
            disabled={createPayment.isPending}
            className="bg-green-600 text-white rounded px-3 py-1 text-xs disabled:opacity-50"
          >
            {t("save")}
          </button>
        </form>
      )}

      <div className="space-y-1">
        {payments?.length === 0 && (
          <p className="text-xs text-gray-400">{t("no_payments")}</p>
        )}
        {payments?.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between text-xs bg-gray-50 rounded px-2 py-1"
          >
            <span>
              <Money cents={p.amount_cents} /> {t("on")}{" "}
              {new Date(p.payment_date).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US")}
              {p.method && ` — ${p.method}`}
              {p.notes && ` — ${p.notes}`}
            </span>
            <button
              onClick={() => {
                if (window.confirm(t("confirm_delete_payment"))) {
                  setMutationError(null);
                  deletePayment.mutate(p.id, {
                    onError: (err: any) => {
                      setMutationError(err?.response?.data?.detail || err?.message || t("operation_failed"));
                    },
                  });
                }
              }}
              className="text-red-600 hover:underline"
            >
              {t("delete")}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

