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
import type { Lease } from "../types";

export function LeasesList() {
  const { data, isLoading, error } = useLeases();
  const createMutation = useCreateLease();
  const deleteMutation = useDeleteLease();
  const endMutation = useEndLease();

  const [showForm, setShowForm] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);

  const [unitId, setUnitId] = useState<number | null>(null);
  const [tenantId, setTenantId] = useState<number | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [monthlyRentCents, setMonthlyRentCents] = useState(0);
  const [dueDay, setDueDay] = useState(1);
  const [lateFeePercent, setLateFeePercent] = useState(0);
  const [securityDepositCents, setSecurityDepositCents] = useState(0);

  const { data: properties } = useProperties();
  const { data: units } = useUnits(selectedPropertyId);
  const { data: tenants } = useTenants();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitId || !tenantId) return;
    createMutation.mutate(
      {
        unit_id: unitId,
        tenant_id: tenantId,
        start_date: startDate,
        end_date: endDate,
        monthly_rent_cents: monthlyRentCents,
        rent_due_day_of_month: dueDay,
        late_fee_percent: lateFeePercent || undefined,
        security_deposit_cents: securityDepositCents || undefined,
      },
      {
        onSuccess: () => {
          setShowForm(false);
          setUnitId(null);
          setTenantId(null);
          setStartDate("");
          setEndDate("");
          setMonthlyRentCents(0);
          setDueDay(1);
          setLateFeePercent(0);
          setSecurityDepositCents(0);
        },
      }
    );
  };

  const statusStyle = (status: Lease["status"]) => {
    if (status === "active") return "bg-green-100 text-green-800";
    if (status === "ended") return "bg-gray-100 text-gray-800";
    return "bg-red-100 text-red-800";
  };

  if (isLoading) return <p className="text-gray-500">Loading...</p>;
  if (error) return <p className="text-red-600">Failed to load leases.</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Leases</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white rounded px-4 py-2 text-sm font-medium"
        >
          Add Lease
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white rounded shadow-sm p-4 mb-6 grid grid-cols-2 gap-3"
        >
          <div>
            <label className="block text-xs font-medium mb-1">Property</label>
            <select
              value={selectedPropertyId ?? ""}
              onChange={(e) => {
                const v = e.target.value ? Number(e.target.value) : null;
                setSelectedPropertyId(v);
                setUnitId(null);
              }}
              className="border rounded px-3 py-2 text-sm w-full"
            >
              <option value="">Select property</option>
              {properties?.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Unit</label>
            <select
              value={unitId ?? ""}
              onChange={(e) => setUnitId(e.target.value ? Number(e.target.value) : null)}
              className="border rounded px-3 py-2 text-sm w-full"
            >
              <option value="">Select unit</option>
              {units?.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Tenant</label>
            <select
              value={tenantId ?? ""}
              onChange={(e) => setTenantId(e.target.value ? Number(e.target.value) : null)}
              className="border rounded px-3 py-2 text-sm w-full"
            >
              <option value="">Select tenant</option>
              {tenants?.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border rounded px-3 py-2 text-sm w-full"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border rounded px-3 py-2 text-sm w-full"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Monthly Rent (&cent;)</label>
            <input
              type="number"
              value={monthlyRentCents || ""}
              onChange={(e) => setMonthlyRentCents(Number(e.target.value))}
              className="border rounded px-3 py-2 text-sm w-full"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Due Day</label>
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
            <label className="block text-xs font-medium mb-1">Late Fee %</label>
            <input
              type="number"
              value={lateFeePercent || ""}
              onChange={(e) => setLateFeePercent(Number(e.target.value))}
              className="border rounded px-3 py-2 text-sm w-full"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Security Deposit (&cent;)</label>
            <input
              type="number"
              value={securityDepositCents || ""}
              onChange={(e) => setSecurityDepositCents(Number(e.target.value))}
              className="border rounded px-3 py-2 text-sm w-full"
            />
          </div>
          <div className="col-span-2 flex gap-2">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-green-600 text-white rounded px-4 py-2 text-sm disabled:opacity-50"
            >
              {createMutation.isPending ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-gray-600 text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Tenant</th>
              <th className="px-4 py-3 font-medium">Unit</th>
              <th className="px-4 py-3 font-medium">Period</th>
              <th className="px-4 py-3 font-medium">Rent</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium w-32">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                  No leases yet.
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
                  {new Date(l.start_date).toLocaleDateString()} —{" "}
                  {new Date(l.end_date).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <Money cents={l.monthly_rent_cents} />
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusStyle(l.status)}`}>
                    {l.status}
                  </span>
                </td>
                <td className="px-4 py-3 flex gap-2">
                  {l.status === "active" && (
                    <button
                      onClick={() => {
                        if (window.confirm("End this lease?")) endMutation.mutate(l.id);
                      }}
                      className="text-yellow-600 hover:underline text-xs"
                    >
                      End
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (window.confirm("Delete this lease?")) deleteMutation.mutate(l.id);
                    }}
                    className="text-red-600 hover:underline text-xs"
                  >
                    Delete
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
