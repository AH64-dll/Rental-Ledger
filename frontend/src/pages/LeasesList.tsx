import { useState } from "react";
import { Link } from "react-router-dom";
import {
  useLeases,
  useCreateLease,
  useDeleteLease,
  useEndLease,
} from "../hooks/useLeases";
import { useProperties } from "../hooks/useProperties";
import { useUnits } from "../hooks/useUnits";
import { useTenants } from "../hooks/useTenants";
import { Money } from "../components/Money";
import { ErrorBanner } from "../components/ErrorBanner";
import type { Lease } from "../types";
import { useLanguage } from "../context/LanguageContext";
import { getLocalDateString, getLocalOneYearLaterDateString } from "../utils/dateUtils";

export function LeasesList() {
  const { data, isLoading, error } = useLeases();
  const createMutation = useCreateLease();
  const deleteMutation = useDeleteLease();
  const endMutation = useEndLease();
  const { language, t } = useLanguage();
  const [mutationError, setMutationError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);

  const [unitId, setUnitId] = useState<number | null>(null);
  const [tenantId, setTenantId] = useState<number | null>(null);
  const [startDate, setStartDate] = useState(getLocalDateString());
  const [endDate, setEndDate] = useState(getLocalOneYearLaterDateString());
  const [monthlyRentEgp, setMonthlyRentEgp] = useState("");
  const [dueDay, setDueDay] = useState(1);
  const [lateFeePercent, setLateFeePercent] = useState(0);
  const [securityDepositEgp, setSecurityDepositEgp] = useState("");

  const { data: properties } = useProperties();
  const { data: units } = useUnits(selectedPropertyId);
  const { data: tenants } = useTenants();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitId || !tenantId) return;
    setMutationError(null);
    createMutation.mutate(
      {
        unit_id: unitId,
        tenant_id: tenantId,
        start_date: startDate,
        end_date: endDate,
        monthly_rent_cents: Math.round(Number(monthlyRentEgp) * 100),
        rent_due_day_of_month: dueDay,
        late_fee_percent: lateFeePercent || undefined,
        security_deposit_cents: securityDepositEgp ? Math.round(Number(securityDepositEgp) * 100) : undefined,
      },
      {
        onSuccess: () => {
          setShowForm(false);
          setUnitId(null);
          setTenantId(null);
          setStartDate(getLocalDateString());
          setEndDate(getLocalOneYearLaterDateString());
          setMonthlyRentEgp("");
          setDueDay(1);
          setLateFeePercent(0);
          setSecurityDepositEgp("");
        },
        onError: (err: any) => {
          setMutationError(err?.response?.data?.detail || err?.message || t("operation_failed"));
        },
      }
    );
  };

  const statusStyle = (status: Lease["status"]) => {
    if (status === "active") return "bg-green-100 text-green-800";
    if (status === "ended") return "bg-gray-100 text-gray-800";
    return "bg-red-100 text-red-800";
  };

  if (isLoading) return <p className="text-gray-500">{t("loading")}</p>;
  if (error) return <p className="text-red-600">{t("failed_load_leases")}</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">{t("leases")}</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white rounded px-4 py-2 text-sm font-medium"
        >
          {t("add_lease")}
        </button>
      </div>

      <ErrorBanner error={mutationError} />

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white rounded shadow-sm p-4 mb-6 grid grid-cols-2 gap-3"
        >
          <div>
            <label className="block text-xs font-medium mb-1">{t("property")}</label>
            <select
              value={selectedPropertyId ?? ""}
              onChange={(e) => {
                const v = e.target.value ? Number(e.target.value) : null;
                setSelectedPropertyId(v);
                setUnitId(null);
              }}
              className="border rounded px-3 py-2 text-sm w-full"
            >
              <option value="">{t("select_property")}</option>
              {properties?.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">{t("unit")}</label>
            <select
              value={unitId ?? ""}
              onChange={(e) => setUnitId(e.target.value ? Number(e.target.value) : null)}
              className="border rounded px-3 py-2 text-sm w-full"
            >
              <option value="">{t("select_unit")}</option>
              {units?.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">{t("tenant")}</label>
            <select
              value={tenantId ?? ""}
              onChange={(e) => setTenantId(e.target.value ? Number(e.target.value) : null)}
              className="border rounded px-3 py-2 text-sm w-full"
            >
              <option value="">{t("select_tenant")}</option>
              {tenants?.map((tRef) => (
                <option key={tRef.id} value={tRef.id}>{tRef.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">{t("start_date")}</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border rounded px-3 py-2 text-sm w-full"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">{t("end_date")}</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border rounded px-3 py-2 text-sm w-full"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">{t("monthly_rent_egp")}</label>
            <input
              type="number"
              step="0.01"
              value={monthlyRentEgp}
              onChange={(e) => setMonthlyRentEgp(e.target.value)}
              className="border rounded px-3 py-2 text-sm w-full"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">{t("due_day")}</label>
            <input
              type="number"
              min={1}
              max={28}
              value={dueDay}
              onChange={(e) => setDueDay(Number(e.target.value))}
              className="border rounded px-3 py-2 text-sm w-full"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">{t("late_fee_percent")}</label>
            <input
              type="number"
              value={lateFeePercent || ""}
              onChange={(e) => setLateFeePercent(Number(e.target.value))}
              className="border rounded px-3 py-2 text-sm w-full"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">{t("security_deposit_egp")}</label>
            <input
              type="number"
              step="0.01"
              value={securityDepositEgp}
              onChange={(e) => setSecurityDepositEgp(e.target.value)}
              className="border rounded px-3 py-2 text-sm w-full"
            />
          </div>
          <div className="col-span-2 flex gap-2">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-green-600 text-white rounded px-4 py-2 text-sm disabled:opacity-50"
            >
              {createMutation.isPending ? t("saving") : t("save")}
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

      <div className="bg-white rounded shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-start">
            <tr>
              <th className="px-4 py-3 font-medium text-start">{t("tenant")}</th>
              <th className="px-4 py-3 font-medium text-start">{t("unit")}</th>
              <th className="px-4 py-3 font-medium text-start">{t("period")}</th>
              <th className="px-4 py-3 font-medium text-start">{t("rent")}</th>
              <th className="px-4 py-3 font-medium text-start">{t("status")}</th>
              <th className="px-4 py-3 font-medium text-start w-32">{t("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {data?.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                  {t("no_leases")}
                </td>
              </tr>
            )}
            {data?.map((l) => (
              <tr key={l.id} className="border-t">
                <td className="px-4 py-3">
                  <Link
                    to={`/leases/${l.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {l.tenant_name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-600">{l.unit_name}</td>
                <td className="px-4 py-3 text-gray-600">
                  {new Date(l.start_date).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US")} —{" "}
                  {new Date(l.end_date).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US")}
                </td>
                <td className="px-4 py-3">
                  <Money cents={l.monthly_rent_cents} />
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusStyle(l.status)}`}>
                    {t(`status_${l.status}`)}
                  </span>
                </td>
                <td className="px-4 py-3 flex gap-2">
                  {l.status === "active" && (
                    <button
                      onClick={() => {
                        if (window.confirm(t("confirm_end_lease"))) {
                          setMutationError(null);
                          endMutation.mutate(l.id, {
                            onError: (err: any) => {
                              setMutationError(err?.response?.data?.detail || err?.message || t("operation_failed"));
                            },
                          });
                        }
                      }}
                      className="text-yellow-600 hover:underline text-xs"
                    >
                      {t("end")}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (window.confirm(t("confirm_delete_lease"))) {
                        setMutationError(null);
                        deleteMutation.mutate(l.id, {
                          onError: (err: any) => {
                            setMutationError(err?.response?.data?.detail || err?.message || t("operation_failed"));
                          },
                        });
                      }
                    }}
                    className="text-red-600 hover:underline text-xs"
                  >
                    {t("delete")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

