import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTenant, useTenantBalance, useUpdateTenant } from "../hooks/useTenants";
import { useAllCharges, useDeleteGeneralCharge } from "../hooks/useCharges";
import { useCreatePayment } from "../hooks/usePayments";
import { useLeases, useCreateLease } from "../hooks/useLeases";
import { useProperties } from "../hooks/useProperties";
import { useUnits } from "../hooks/useUnits";
import { Money } from "../components/Money";
import { StatusPill } from "../components/StatusPill";
import { ErrorBanner } from "../components/ErrorBanner";
import { useLanguage } from "../context/LanguageContext";
import { DebtForm } from "../components/debts/DebtForm";
import {
  getElapsedDuration,
  getLocalDateString,
  getLocalOneYearLaterDateString,
} from "../utils/dateUtils";

export function TenantProfile() {
  const { id } = useParams<{ id: string }>();
  const tenantId = id ? Number(id) : null;
  const { data: tenant, isLoading, error } = useTenant(tenantId);
  const { data: balance } = useTenantBalance(tenantId);
  const { data: allCharges } = useAllCharges({ tenant_id: tenantId || undefined });
  const { data: leases } = useLeases(tenantId || undefined);
  
  const updateMutation = useUpdateTenant();
  const deleteDebtMutation = useDeleteGeneralCharge();
  const createPaymentMutation = useCreatePayment();
  const createLeaseMutation = useCreateLease();

  const { language, t } = useLanguage();

  const [mutationError, setMutationError] = useState<string | null>(null);

  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const [activeTab, setActiveTab] = useState<"leases" | "debts">("leases");

  const [showDebtForm, setShowDebtForm] = useState(false);

  // Add Lease Form State
  const [showLeaseForm, setShowLeaseForm] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  const [leaseUnitId, setLeaseUnitId] = useState<number | null>(null);
  const [leaseStartDate, setLeaseStartDate] = useState(getLocalDateString());
  const [leaseEndDate, setLeaseEndDate] = useState(getLocalOneYearLaterDateString());
  const [leaseMonthlyRentEgp, setLeaseMonthlyRentEgp] = useState("");
  const [leaseDueDay, setLeaseDueDay] = useState(1);
  const [leaseLateFeePercent, setLeaseLateFeePercent] = useState(0);
  const [leaseSecurityDepositEgp, setLeaseSecurityDepositEgp] = useState("");

  const { data: properties } = useProperties();
  const { data: units } = useUnits(selectedPropertyId);

  // Inline Payment Form State
  const [paymentChargeId, setPaymentChargeId] = useState<number | null>(null);
  const [paymentAmountEgp, setPaymentAmountEgp] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  const personalDebts = allCharges?.filter((c) => c.lease_id === null) || [];
  const tenantLeases = leases || [];

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
      },
      {
        onSuccess: () => {
          setPaymentChargeId(null);
          setPaymentAmountEgp("");
          setPaymentMethod("");
        },
        onError: (err: any) => {
          setMutationError(err?.response?.data?.detail || err?.message || t("operation_failed"));
        },
      }
    );
  };

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

  const handleCreateLease = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId || !leaseUnitId || !leaseStartDate || !leaseEndDate || !leaseMonthlyRentEgp) return;

    setMutationError(null);
    createLeaseMutation.mutate(
      {
        tenant_id: tenantId,
        unit_id: leaseUnitId,
        start_date: leaseStartDate,
        end_date: leaseEndDate,
        monthly_rent_cents: Math.round(Number(leaseMonthlyRentEgp) * 100),
        rent_due_day_of_month: leaseDueDay,
        late_fee_percent: leaseLateFeePercent || undefined,
        security_deposit_cents: leaseSecurityDepositEgp ? Math.round(Number(leaseSecurityDepositEgp) * 100) : undefined,
      },
      {
        onSuccess: () => {
          setShowLeaseForm(false);
          setSelectedPropertyId(null);
          setLeaseUnitId(null);
          setLeaseStartDate(getLocalDateString());
          setLeaseEndDate(getLocalOneYearLaterDateString());
          setLeaseMonthlyRentEgp("");
          setLeaseDueDay(1);
          setLeaseLateFeePercent(0);
          setLeaseSecurityDepositEgp("");
        },
        onError: (err: any) => {
          setMutationError(err?.response?.data?.detail || err?.message || t("operation_failed"));
        },
      }
    );
  };

  const startEdit = () => {
    if (!tenant) return;
    setName(tenant.name);
    setEmail(tenant.email || "");
    setPhone(tenant.phone || "");
    setNotes(tenant.notes || "");
    setEditMode(true);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) return;
    setMutationError(null);
    updateMutation.mutate(
      {
        id: tenantId,
        name: name || undefined,
        email: email || undefined,
        phone: phone || undefined,
        notes: notes || undefined,
      },
      {
        onSuccess: () => setEditMode(false),
        onError: (err: any) => {
          setMutationError(err?.response?.data?.detail || err?.message || t("operation_failed"));
        },
      }
    );
  };

  if (isLoading) return <p className="text-gray-500">{t("loading")}</p>;
  if (error) return <p className="text-red-600">{t("failed_load_tenant")}</p>;
  if (!tenant) return null;

  return (
    <div>
      <div className="mb-4">
        <Link to=".." className="text-blue-600 hover:underline text-sm">← {t("back")}</Link>
      </div>

      <ErrorBanner error={mutationError} />

      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-xs text-gray-500 uppercase tracking-wider">{t("person_profile")}</span>
          <h2 className="text-xl font-semibold text-gray-800">{tenant.name}</h2>
        </div>
        <button
          onClick={() => (editMode ? setEditMode(false) : startEdit())}
          className="bg-blue-600 text-white rounded px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          {editMode ? t("cancel") : t("edit")}
        </button>
      </div>

      {editMode && (
        <form
          onSubmit={handleUpdate}
          className="bg-white rounded shadow-sm p-4 mb-6 flex flex-col gap-3"
        >
          <input
            type="text"
            placeholder={t("name")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
            required
          />
          <input
            type="email"
            placeholder={t("email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder={t("phone")}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder={t("notes")}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="bg-green-600 text-white rounded px-4 py-2 text-sm self-start disabled:opacity-50 hover:bg-green-700"
          >
            {updateMutation.isPending ? t("saving") : t("save_changes")}
          </button>
        </form>
      )}

      {!editMode && (
        <div className="bg-white rounded shadow-sm p-4 mb-6 text-sm text-gray-600 grid grid-cols-1 md:grid-cols-3 gap-4">
          <p>
            <strong>{t("email")}:</strong> {tenant.email || "—"}
          </p>
          <p>
            <strong>{t("phone")}:</strong> {tenant.phone || "—"}
          </p>
          <p>
            <strong>{t("notes")}:</strong> {tenant.notes || "—"}
          </p>
        </div>
      )}

      {balance && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded shadow-sm p-4 border-l-4 border-blue-500">
            <p className="text-xs text-gray-500 uppercase">{t("net_balance")}</p>
            <p className="text-lg font-semibold">
              <Money cents={balance.net_balance_cents} />
            </p>
          </div>
          <div className="bg-white rounded shadow-sm p-4 border-l-4 border-green-500">
            <p className="text-xs text-gray-500 uppercase">{t("deposits_held")}</p>
            <p className="text-lg font-semibold">
              <Money cents={balance.deposits_held_cents} />
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => setActiveTab("leases")}
          className={`py-2 px-4 font-medium text-sm border-b-2 transition-colors ${
            activeTab === "leases"
              ? "border-blue-600 text-blue-600 font-semibold"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          {t("rental_leases")}
        </button>
        <button
          onClick={() => setActiveTab("debts")}
          className={`py-2 px-4 font-medium text-sm border-b-2 transition-colors ${
            activeTab === "debts"
              ? "border-blue-600 text-blue-600 font-semibold"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          {t("personal_debts")}
        </button>
      </div>

      {activeTab === "leases" && (
        <div className="space-y-6">
          {/* Leases Table */}
          <div className="bg-white rounded shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold">{t("rental_leases")}</h3>
              <button
                onClick={() => setShowLeaseForm(!showLeaseForm)}
                className="bg-blue-600 text-white rounded px-3 py-1.5 text-xs font-medium hover:bg-blue-700"
              >
                {t("add_lease")}
              </button>
            </div>

            {showLeaseForm && (
              <form onSubmit={handleCreateLease} className="border p-4 rounded mb-4 flex flex-col gap-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">{t("property")}</label>
                    <select
                      value={selectedPropertyId || ""}
                      onChange={(e) => {
                        setSelectedPropertyId(Number(e.target.value) || null);
                        setLeaseUnitId(null);
                      }}
                      className="border rounded px-3 py-2 text-sm w-full bg-white"
                      required
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
                      value={leaseUnitId || ""}
                      onChange={(e) => setLeaseUnitId(Number(e.target.value) || null)}
                      className="border rounded px-3 py-2 text-sm w-full bg-white"
                      required
                    >
                      <option value="">{t("select_unit")}</option>
                      {units?.map((u) => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">{t("start_date")}</label>
                    <input
                      type="date"
                      value={leaseStartDate}
                      onChange={(e) => setLeaseStartDate(e.target.value)}
                      className="border rounded px-3 py-2 text-sm w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">{t("end_date")}</label>
                    <input
                      type="date"
                      value={leaseEndDate}
                      onChange={(e) => setLeaseEndDate(e.target.value)}
                      className="border rounded px-3 py-2 text-sm w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">{t("monthly_rent_egp")}</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={leaseMonthlyRentEgp}
                      onChange={(e) => setLeaseMonthlyRentEgp(e.target.value)}
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
                      value={leaseDueDay}
                      onChange={(e) => setLeaseDueDay(Number(e.target.value))}
                      className="border rounded px-3 py-2 text-sm w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">{t("late_fee_percent")}</label>
                    <input
                      type="number"
                      step="0.01"
                      value={leaseLateFeePercent}
                      onChange={(e) => setLeaseLateFeePercent(Number(e.target.value))}
                      className="border rounded px-3 py-2 text-sm w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">{t("security_deposit_egp")}</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={leaseSecurityDepositEgp}
                      onChange={(e) => setLeaseSecurityDepositEgp(e.target.value)}
                      className="border rounded px-3 py-2 text-sm w-full"
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    type="submit"
                    disabled={createLeaseMutation.isPending}
                    className="bg-green-600 text-white rounded px-4 py-1.5 text-xs font-semibold hover:bg-green-700"
                  >
                    {t("save")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowLeaseForm(false)}
                    className="text-gray-600 text-xs"
                  >
                    {t("cancel")}
                  </button>
                </div>
              </form>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 text-start">
                  <tr>
                    <th className="px-3 py-2 font-medium text-start">{t("unit")}</th>
                    <th className="px-3 py-2 font-medium text-start">{t("start_date")}</th>
                    <th className="px-3 py-2 font-medium text-start">{t("end_date")}</th>
                    <th className="px-3 py-2 font-medium text-start">{t("monthly_rent_egp")}</th>
                    <th className="px-3 py-2 font-medium text-start">{t("status")}</th>
                  </tr>
                </thead>
                <tbody>
                  {tenantLeases.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-3 py-4 text-center text-gray-500">
                        {t("no_leases")}
                      </td>
                    </tr>
                  )}
                  {tenantLeases.map((l) => (
                    <tr key={l.id} className="border-t">
                      <td className="px-3 py-2">{l.unit_name}</td>
                      <td className="px-3 py-2">{new Date(l.start_date).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US")}</td>
                      <td className="px-3 py-2">{new Date(l.end_date).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US")}</td>
                      <td className="px-3 py-2"><Money cents={l.monthly_rent_cents} /></td>
                      <td className="px-3 py-2"><StatusPill status={l.status as any} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Rental Ledger / Charges Table */}
          <div className="bg-white rounded shadow-sm p-4">
            <h3 className="text-base font-semibold mb-4">{t("charges_ledger")}</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 text-start">
                  <tr>
                    <th className="px-4 py-3 font-medium text-start">{t("description")}</th>
                    <th className="px-4 py-3 font-medium text-start">{t("amount")}</th>
                    <th className="px-4 py-3 font-medium text-start">{t("paid")}</th>
                    <th className="px-4 py-3 font-medium text-start">{t("balance")}</th>
                    <th className="px-4 py-3 font-medium text-start">{t("status")}</th>
                    <th className="px-4 py-3 font-medium text-start">{t("due_date")}</th>
                  </tr>
                </thead>
                <tbody>
                  {balance.charges.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                        {t("no_charges")}
                      </td>
                    </tr>
                  )}
                  {balance.charges.map((c, i) => (
                    <tr key={i} className="border-t">
                      <td className="px-4 py-3">{c.description}</td>
                      <td className="px-4 py-3">
                        <Money cents={c.amount_cents} />
                      </td>
                      <td className="px-4 py-3">
                        <Money cents={c.paid_cents} />
                      </td>
                      <td className="px-4 py-3">
                        <Money cents={c.balance_cents} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill status={c.status as any} />
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {c.due_date
                          ? new Date(c.due_date).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US")
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "debts" && (
        <div className="bg-white rounded shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold">{t("personal_debts")}</h3>
            <button
              onClick={() => setShowDebtForm(!showDebtForm)}
              className="bg-blue-600 text-white rounded px-3 py-1.5 text-xs font-medium hover:bg-blue-700"
            >
              {t("add_debt")}
            </button>
          </div>

          {showDebtForm && (
            <DebtForm tenantId={tenantId!} onSuccess={() => setShowDebtForm(false)} />
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 text-start">
                <tr>
                  <th className="px-4 py-3 font-medium text-start">{t("debt_date")}</th>
                  <th className="px-4 py-3 font-medium text-start">{t("elapsed_duration")}</th>
                  <th className="px-4 py-3 font-medium text-start">{t("amount")}</th>
                  <th className="px-4 py-3 font-medium text-start">{t("paid")}</th>
                  <th className="px-4 py-3 font-medium text-start">{t("remaining")}</th>
                  <th className="px-4 py-3 font-medium text-start">{t("status")}</th>
                  <th className="px-4 py-3 font-medium text-start w-32">{t("actions")}</th>
                </tr>
              </thead>
              <tbody>
                {personalDebts.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                      {t("no_debts_found")}
                    </td>
                  </tr>
                )}
                {personalDebts.map((c) => (
                  <tr key={c.id} className="border-t">
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
                                className="text-green-600 text-xs font-semibold hover:text-green-700"
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
      )}
    </div>
  );
}
