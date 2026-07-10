import { useState } from "react";
import { useParams } from "react-router-dom";
import { useTenant, useTenantBalance, useUpdateTenant } from "../hooks/useTenants";
import { Money } from "../components/Money";
import { StatusPill } from "../components/StatusPill";

export function TenantProfile() {
  const { id } = useParams<{ id: string }>();
  const tenantId = id ? Number(id) : null;
  const { data: tenant, isLoading, error } = useTenant(tenantId);
  const { data: balance } = useTenantBalance(tenantId);
  const updateMutation = useUpdateTenant();

  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

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
    updateMutation.mutate(
      {
        id: tenantId,
        name: name || undefined,
        email: email || undefined,
        phone: phone || undefined,
        notes: notes || undefined,
      },
      { onSuccess: () => setEditMode(false) }
    );
  };

  if (isLoading) return <p className="text-gray-500">Loading...</p>;
  if (error) return <p className="text-red-600">Failed to load tenant.</p>;
  if (!tenant) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">{tenant.name}</h2>
        <button
          onClick={() => (editMode ? setEditMode(false) : startEdit())}
          className="bg-blue-600 text-white rounded px-4 py-2 text-sm font-medium"
        >
          {editMode ? "Cancel" : "Edit"}
        </button>
      </div>

      {editMode && (
        <form
          onSubmit={handleUpdate}
          className="bg-white rounded shadow-sm p-4 mb-6 flex flex-col gap-3"
        >
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="bg-green-600 text-white rounded px-4 py-2 text-sm self-start disabled:opacity-50"
          >
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </button>
        </form>
      )}

      {!editMode && (
        <div className="bg-white rounded shadow-sm p-4 mb-6 text-sm text-gray-600">
          <p>
            <strong>Email:</strong> {tenant.email || "—"}
          </p>
          <p>
            <strong>Phone:</strong> {tenant.phone || "—"}
          </p>
          <p>
            <strong>Notes:</strong> {tenant.notes || "—"}
          </p>
        </div>
      )}

      {balance && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded shadow-sm p-4">
            <p className="text-xs text-gray-500 uppercase">Net Balance</p>
            <p className="text-lg font-semibold">
              <Money cents={balance.net_balance_cents} />
            </p>
          </div>
          <div className="bg-white rounded shadow-sm p-4">
            <p className="text-xs text-gray-500 uppercase">Deposits Held</p>
            <p className="text-lg font-semibold">
              <Money cents={balance.deposits_held_cents} />
            </p>
          </div>
        </div>
      )}

      {balance && (
        <div>
          <h3 className="text-lg font-medium mb-4">Charges Ledger</h3>
          <div className="bg-white rounded shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Description</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Paid</th>
                  <th className="px-4 py-3 font-medium">Balance</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Due Date</th>
                </tr>
              </thead>
              <tbody>
                {balance.charges.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                      No charges.
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
                      <StatusPill status={c.status as "paid" | "partial" | "unpaid" | "overdue"} />
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {c.due_date
                        ? new Date(c.due_date).toLocaleDateString()
                        : "—"}
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
