import { useState } from "react";
import {
  useAllCharges,
  useDeleteGeneralCharge,
} from "../hooks/useCharges";
import { useTenants } from "../hooks/useTenants";
import { useCreatePayment } from "../hooks/usePayments";
import { Money } from "../components/Money";
import { StatusPill } from "../components/StatusPill";
import { ErrorBanner } from "../components/ErrorBanner";
import { DebtForm } from "../components/debts/DebtForm";
import { useLanguage } from "../context/LanguageContext";
import { getElapsedDuration, getLocalDateString } from "../utils/dateUtils";

export function DebtsList() {
  const { data: charges, isLoading: chargesLoading, error: chargesError } = useAllCharges();
  const { data: tenants } = useTenants();
  const deleteDebtMutation = useDeleteGeneralCharge();
  const createPaymentMutation = useCreatePayment();
  const { language, t } = useLanguage();
  const [mutationError, setMutationError] = useState<string | null>(null);

  // Add Debt Form State
  const [showForm, setShowForm] = useState(false);
  const [selectedTenantId, setSelectedTenantId] = useState<number | null>(null);

  // Inline Payment Form State
  const [paymentChargeId, setPaymentChargeId] = useState<number | null>(null);
  const [paymentAmountEgp, setPaymentAmountEgp] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");

  // Filter charges for active general debts: lease_id === null and balance_cents > 0
  const activeDebts = charges?.filter(
    (c) => c.lease_id === null && c.balance_cents > 0
  ) || [];

  const handleDeleteDebt = (id: number) => {
    if (window.confirm(t("confirm_delete_debt"))) {
      setMutationError(null);
      deleteDebtMutation.mutate(id, {
        onError: (err: any) => {
          setMutationError(err?.response?.data?.detail || err?.message || t("operation_failed"));
        },
      });
    }
  };

  const handlePayment = (e: React.FormEvent, chargeId: number) => {
    e.preventDefault();
    if (!paymentAmountEgp) return;
    const today = getLocalDateString();

    setMutationError(null);
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
        },
        onError: (err: any) => {
          setMutationError(err?.response?.data?.detail || err?.message || t("operation_failed"));
        },
      }
    );
  };

  if (chargesError) return <p className="text-red-600">{t("failed_load_charges")}</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">{t("debts")}</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white rounded px-4 py-2 text-sm font-medium"
        >
          {t("add_debt")}
        </button>
      </div>

      <ErrorBanner error={mutationError} />

      {showForm && (
        <div className="bg-white rounded shadow-sm p-4 mb-6 flex flex-col gap-3 max-w-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("tenant")}
            </label>
            <select
              value={selectedTenantId ?? ""}
              onChange={(e) => setSelectedTenantId(Number(e.target.value) || null)}
              className="w-full border rounded px-3 py-2 text-sm bg-white"
              required
            >
              <option value="">{t("select_tenant")}</option>
              {tenants?.map((tRef) => (
                <option key={tRef.id} value={tRef.id}>
                  {tRef.name}
                </option>
              ))}
            </select>
          </div>
          {selectedTenantId && <DebtForm tenantId={selectedTenantId} />}
          <button
            type="button"
            onClick={() => { setShowForm(false); setSelectedTenantId(null); }}
            className="text-gray-600 text-sm self-start"
          >
            {t("cancel")}
          </button>
        </div>
      )}

      {chargesLoading && <p className="text-gray-500">{t("loading")}</p>}

      <div className="bg-white rounded shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-start">
            <tr>
              <th className="px-4 py-3 font-medium text-start">{t("tenant")}</th>
              <th className="px-4 py-3 font-medium text-start">{t("description")}</th>
              <th className="px-4 py-3 font-medium text-start">{t("amount")}</th>
              <th className="px-4 py-3 font-medium text-start">{t("paid")}</th>
              <th className="px-4 py-3 font-medium text-start">{t("remaining")}</th>
              <th className="px-4 py-3 font-medium text-start">{t("debt_date")}</th>
              <th className="px-4 py-3 font-medium text-start">{t("elapsed_duration")}</th>
              <th className="px-4 py-3 font-medium text-start">{t("status")}</th>
              <th className="px-4 py-3 font-medium text-start w-32">{t("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {activeDebts.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-6 text-center text-gray-500">
                  {t("no_debts_found")}
                </td>
              </tr>
            )}
            {activeDebts.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="px-4 py-3 text-gray-600">{c.tenant_name}</td>
                <td className="px-4 py-3">{c.description}</td>
                <td className="px-4 py-3">
                  <Money cents={c.amount_cents} />
                </td>
                <td className="px-4 py-3">
                  <Money cents={c.paid_cents} />
                </td>
                <td className="px-4 py-3 font-medium">
                  <Money cents={c.balance_cents} />
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {c.charge_date
                    ? new Date(c.charge_date).toLocaleDateString(
                        language === "ar" ? "ar-EG" : "en-US"
                      )
                    : "—"}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {getElapsedDuration(c.charge_date, new Date(), language)}
                </td>
                <td className="px-4 py-3">
                  <StatusPill status={c.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {paymentChargeId === c.id ? (
                      <form
                        onSubmit={(e) => handlePayment(e, c.id)}
                        className="flex flex-col gap-1 w-full"
                      >
                        <input
                          type="number"
                          step="0.01"
                          placeholder={t("amount")}
                          value={paymentAmountEgp}
                          onChange={(e) => setPaymentAmountEgp(e.target.value)}
                          className="border rounded px-1 py-0.5 text-xs w-24"
                          required
                        />
                        <input
                          type="text"
                          placeholder={t("method")}
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="border rounded px-1 py-0.5 text-xs"
                        />
                        <div className="flex gap-1">
                          <button
                            type="submit"
                            disabled={createPaymentMutation.isPending}
                            className="text-green-600 text-xs font-semibold"
                          >
                            {t("save")}
                          </button>
                          <button
                            type="button"
                            onClick={() => setPaymentChargeId(null)}
                            className="text-gray-500 text-xs"
                          >
                            {t("cancel")}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setPaymentChargeId(c.id);
                          }}
                          className="text-blue-600 hover:underline text-xs"
                        >
                          {t("pay")}
                        </button>
                        <button
                          onClick={() => handleDeleteDebt(c.id)}
                          className="text-red-600 hover:underline text-xs"
                        >
                          {t("del")}
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
