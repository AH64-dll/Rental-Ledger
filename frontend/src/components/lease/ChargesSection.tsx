import { useState } from "react";
import { Money } from "../Money";
import { StatusPill } from "../StatusPill";
import { ErrorBanner } from "../ErrorBanner";
import { useLeaseCharges, useCreateCharge, useDeleteCharge } from "../../hooks/useCharges";
import { PaymentsSection } from "./PaymentsSection";
import { useLanguage } from "../../context/LanguageContext";
import { getLocalDateString } from "../../utils/dateUtils";

export function ChargesSection({ leaseId }: { leaseId: number }) {
  const { data: charges } = useLeaseCharges(leaseId);
  const createCharge = useCreateCharge();
  const deleteCharge = useDeleteCharge();
  const { language, t } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [description, setDescription] = useState("");
  const [amountEgp, setAmountEgp] = useState("");
  const [category, setCategory] = useState("rent");
  const [expandedCharge, setExpandedCharge] = useState<number | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const today = getLocalDateString();
    setMutationError(null);
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
        <h3 className="text-lg font-medium">{t("charges")}</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white rounded px-4 py-2 text-sm font-medium"
        >
          {t("add_charge")}
        </button>
      </div>

      <ErrorBanner error={mutationError} />

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white rounded shadow-sm p-4 mb-4 flex flex-col gap-3"
        >
          <input
            type="text"
            placeholder={t("description")}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">{t("amount_cents")}</label>
              <input
                type="number"
                step="0.01"
                value={amountEgp}
                onChange={(e) => setAmountEgp(e.target.value)}
                className="border rounded px-3 py-2 text-sm w-full"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">{t("category")}</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="border rounded px-3 py-2 text-sm w-full"
              >
                <option value="rent">{t("rent_category")}</option>
                <option value="late_fee">{t("late_fee_category")}</option>
                <option value="other">{t("other_category")}</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={createCharge.isPending}
              className="bg-green-600 text-white rounded px-4 py-2 text-sm disabled:opacity-50"
            >
              {createCharge.isPending ? t("saving") : t("save")}
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
        {charges?.length === 0 && (
          <p className="text-gray-500 text-sm">{t("no_charges_yet")}</p>
        )}
        {charges?.map((c) => (
          <div key={c.id} className="bg-white rounded shadow-sm p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-medium text-sm">{c.description}</span>
                <span className="text-xs text-gray-500">
                  {new Date(c.charge_date).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US")}
                  {c.due_date && ` — ${t("due_date")}: ${new Date(c.due_date).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US")}`}
                </span>
                <StatusPill status={c.status} />
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span>
                  <Money cents={c.amount_cents} /> {t("charged")}
                </span>
                <span>
                  <Money cents={c.paid_cents} /> {t("paid")}
                </span>
                <span className="font-medium">
                  {t("balance")}: <Money cents={c.balance_cents} />
                </span>
                <button
                  onClick={() =>
                    setExpandedCharge(expandedCharge === c.id ? null : c.id)
                  }
                  className="text-blue-600 hover:underline text-xs"
                >
                  {expandedCharge === c.id ? t("hide") : t("payments")}
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(t("confirm_delete_charge"))) {
                      setMutationError(null);
                      deleteCharge.mutate(
                        { leaseId, chargeId: c.id },
                        {
                          onError: (err: any) => {
                            setMutationError(err?.response?.data?.detail || err?.message || t("operation_failed"));
                          },
                        }
                      );
                    }
                  }}
                  className="text-red-600 hover:underline text-xs"
                >
                  {t("delete")}
                </button>
              </div>
            </div>
            {expandedCharge === c.id && (
              <PaymentsSection chargeId={c.id} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

