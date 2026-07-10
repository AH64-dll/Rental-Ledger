import { useState } from "react";
import { useAllCharges, useDeleteCharge } from "../hooks/useCharges";
import { useTenants } from "../hooks/useTenants";
import { useCreatePayment } from "../hooks/usePayments";
import { Money } from "../components/Money";
import { StatusPill } from "../components/StatusPill";

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

  const [paymentChargeId, setPaymentChargeId] = useState<number | null>(null);
  const [amountCents, setAmountCents] = useState(0);
  const [paymentDate, setPaymentDate] = useState("");
  const [method, setMethod] = useState("");
  const [notes, setNotes] = useState("");

  const handlePayment = (e: React.FormEvent, chargeId: number) => {
    e.preventDefault();
    createPayment.mutate(
      {
        chargeId,
        amount_cents: amountCents,
        payment_date: paymentDate,
        method: method || undefined,
        notes: notes || undefined,
      },
      {
        onSuccess: () => {
          setPaymentChargeId(null);
          setAmountCents(0);
          setPaymentDate("");
          setMethod("");
          setNotes("");
        },
      }
    );
  };

  if (error) return <p className="text-red-600">Failed to load charges.</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Charges</h2>

      <div className="flex flex-wrap gap-3 mb-4">
        <select
          value={tenantFilter}
          onChange={(e) => setTenantFilter(e.target.value)}
          className="border rounded px-3 py-2 text-sm bg-white"
        >
          <option value="">All tenants</option>
          {tenants?.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded px-3 py-2 text-sm bg-white"
        >
          <option value="">All statuses</option>
          <option value="paid">Paid</option>
          <option value="partial">Partial</option>
          <option value="unpaid">Unpaid</option>
          <option value="overdue">Overdue</option>
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={overdueFilter === true}
            onChange={(e) =>
              setOverdueFilter(e.target.checked ? true : undefined)
            }
          />
          Overdue only
        </label>
      </div>

      {isLoading && <p className="text-gray-500">Loading...</p>}

      <div className="bg-white rounded shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Tenant</th>
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Paid</th>
              <th className="px-4 py-3 font-medium">Balance</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Due Date</th>
              <th className="px-4 py-3 font-medium w-28">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                  No charges found.
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
                    ? new Date(c.due_date).toLocaleDateString()
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
                          placeholder="Amount"
                          value={amountCents || ""}
                          onChange={(e) => setAmountCents(Number(e.target.value))}
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
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setPaymentChargeId(null)}
                            className="text-gray-500 text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setPaymentChargeId(c.id)}
                          className="text-blue-600 hover:underline text-xs"
                        >
                          Pay
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm("Delete this charge?"))
                              deleteCharge.mutate({
                                leaseId: c.lease_id,
                                chargeId: c.id,
                              });
                          }}
                          className="text-red-600 hover:underline text-xs"
                        >
                          Del
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
