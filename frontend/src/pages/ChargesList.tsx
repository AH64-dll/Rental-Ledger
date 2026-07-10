import { useState } from "react";
import { useAllCharges, useDeleteCharge, useDeleteGeneralCharge } from "../hooks/useCharges";
import { useTenants } from "../hooks/useTenants";
import { useCreatePayment } from "../hooks/usePayments";
import { Money } from "../components/Money";
import { StatusPill } from "../components/StatusPill";
import { ErrorBanner } from "../components/ErrorBanner";
import { useLanguage } from "../context/LanguageContext";

export function ChargesList() {
  const [tenantFilter, setTenantFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [overdueFilter, setOverdueFilter] = useState<boolean | undefined>(undefined);

  const filters = {
    tenant_id: tenantFilter ? Number(tenantFilter) : undefined,
    status: statusFilter || undefined,
    overdue: overdueFilter,
  };

  const { data, isLoading, error } = useAllCharges(filters);
  const { data: tenants } = useTenants();
  const createPayment = useCreatePayment();
  const deleteCharge = useDeleteCharge();
  const deleteGeneralCharge = useDeleteGeneralCharge();
  const { language, t } = useLanguage();
  const [mutationError, setMutationError] = useState<string | null>(null);

  const [paymentChargeId, setPaymentChargeId] = useState<number | null>(null);
  const [amountEgp, setAmountEgp] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [method, setMethod] = useState("");
  const [notes, setNotes] = useState("");

  const handlePayment = (e: React.FormEvent, chargeId: number) => {
    e.preventDefault();
    setMutationError(null);
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
          setPaymentDate("");
          setMethod("");
          setNotes("");
        },
        onError: (err: any) => {
          setMutationError(err?.response?.data?.detail || err?.message || t("operation_failed"));
        },
      }
    );
  };

  if (error) return <p className="text-red-600">{t("failed_load_charges")}</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">{t("charges")}</h2>

      <ErrorBanner error={mutationError} />

      <div className="flex flex-wrap gap-3 mb-4">
        <select
          value={tenantFilter}
          onChange={(e) => setTenantFilter(e.target.value)}
          className="border rounded px-3 py-2 text-sm bg-white"
        >
          <option value="">{t("all_tenants")}</option>
          {tenants?.map((tRef) => (
            <option key={tRef.id} value={tRef.id}>{tRef.name}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded px-3 py-2 text-sm bg-white"
        >
          <option value="">{t("all_statuses")}</option>
          <option value="paid">{t("status_paid")}</option>
          <option value="partial">{t("status_partial")}</option>
          <option value="unpaid">{t("status_unpaid")}</option>
          <option value="overdue">{t("status_overdue")}</option>
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={overdueFilter === true}
            onChange={(e) =>
              setOverdueFilter(e.target.checked ? true : undefined)
            }
          />
          {t("overdue_only")}
        </label>
      </div>

      {isLoading && <p className="text-gray-500">{t("loading")}</p>}

      <div className="bg-white rounded shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-start">
            <tr>
              <th className="px-4 py-3 font-medium text-start">{t("tenant")}</th>
              <th className="px-4 py-3 font-medium text-start">{t("description")}</th>
              <th className="px-4 py-3 font-medium text-start">{t("amount")}</th>
              <th className="px-4 py-3 font-medium text-start">{t("paid")}</th>
              <th className="px-4 py-3 font-medium text-start">{t("balance")}</th>
              <th className="px-4 py-3 font-medium text-start">{t("status")}</th>
              <th className="px-4 py-3 font-medium text-start">{t("due_date")}</th>
              <th className="px-4 py-3 font-medium text-start w-28">{t("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {data?.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                  {t("no_charges_found")}
                </td>
              </tr>
            )}
            {data?.map((c) => (
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
                <td className="px-4 py-3">
                  <StatusPill status={c.status} />
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {c.due_date
                    ? new Date(c.due_date).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US")
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {paymentChargeId === c.id ? (
                      <form
                        onSubmit={(e) => handlePayment(e, c.id)}
                        className="flex flex-col gap-1"
                      >
                        <input
                          type="number"
                          step="0.01"
                          placeholder={t("amount")}
                          value={amountEgp}
                          onChange={(e) => setAmountEgp(e.target.value)}
                          className="border rounded px-1 py-0.5 text-xs w-20"
                          required
                        />
                        <input
                          type="date"
                          value={paymentDate}
                          onChange={(e) => setPaymentDate(e.target.value)}
                          className="border rounded px-1 py-0.5 text-xs"
                          required
                        />
                        <div className="flex gap-1">
                          <button
                            type="submit"
                            disabled={createPayment.isPending}
                            className="text-green-600 text-xs"
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
                          onClick={() => setPaymentChargeId(c.id)}
                          className="text-blue-600 hover:underline text-xs"
                        >
                          {t("pay")}
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(t("confirm_delete_charge"))) {
                              setMutationError(null);
                              if (c.lease_id) {
                                deleteCharge.mutate({
                                  leaseId: c.lease_id,
                                  chargeId: c.id,
                                }, {
                                  onError: (err: any) => {
                                    setMutationError(err?.response?.data?.detail || err?.message || t("operation_failed"));
                                  },
                                });
                              } else {
                                deleteGeneralCharge.mutate(c.id, {
                                  onError: (err: any) => {
                                    setMutationError(err?.response?.data?.detail || err?.message || t("operation_failed"));
                                  },
                                });
                              }
                            }
                          }}
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

