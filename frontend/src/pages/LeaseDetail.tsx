import { useState } from "react";
import { useParams } from "react-router-dom";
import { useLease } from "../hooks/useLeases";
import { useLeaseCharges, useCreateCharge, useDeleteCharge } from "../hooks/useCharges";
import { useChargePayments, useCreatePayment, useDeletePayment } from "../hooks/usePayments";
import { useLeaseDeposits, useCreateDeposit } from "../hooks/useDeposits";
import { Money } from "../components/Money";
import { StatusPill } from "../components/StatusPill";

type Tab = "charges" | "deposits";

export function LeaseDetail() {
  const { id } = useParams<{ id: string }>();
  const leaseId = id ? Number(id) : null;
  const { data: lease, isLoading, error } = useLease(leaseId);
  const [tab, setTab] = useState<Tab>("charges");

  if (isLoading) return <p className="text-gray-500">Loading...</p>;
  if (error) return <p className="text-red-600">Failed to load lease.</p>;
  if (!lease) return null;

  return (
    <div>
      <div className="bg-white rounded shadow-sm p-4 mb-6">
        <h2 className="text-xl font-semibold mb-2">
          {lease.tenant_name} — {lease.unit_name}
        </h2>
        <div className="text-sm text-gray-600 flex flex-wrap gap-x-6 gap-y-1">
          <span>
            Period: {new Date(lease.start_date).toLocaleDateString()} —{" "}
            {new Date(lease.end_date).toLocaleDateString()}
          </span>
          <span>
            Rent: <Money cents={lease.monthly_rent_cents} /> / month
          </span>
          <span>Due day: {lease.rent_due_day_of_month}</span>
          <span>Deposit: <Money cents={lease.security_deposit_cents} /></span>
          <span>Late fee: {lease.late_fee_percent}%</span>
        </div>
      </div>

      <div className="flex gap-1 mb-4 border-b">
        <button
          onClick={() => setTab("charges")}
          className={`px-4 py-2 text-sm font-medium ${
            tab === "charges"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500"
          }`}
        >
          Charges & Payments
        </button>
        <button
          onClick={() => setTab("deposits")}
          className={`px-4 py-2 text-sm font-medium ${
            tab === "deposits"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500"
          }`}
        >
          Deposits
        </button>
      </div>

      {tab === "charges" && <ChargesSection leaseId={leaseId!} />}
      {tab === "deposits" && <DepositsSection leaseId={leaseId!} />}
    </div>
  );
}

function ChargesSection({ leaseId }: { leaseId: number }) {
  const { data: charges } = useLeaseCharges(leaseId);
  const createCharge = useCreateCharge();
  const deleteCharge = useDeleteCharge();
  const [showForm, setShowForm] = useState(false);
  const [description, setDescription] = useState("");
  const [amountCents, setAmountCents] = useState(0);
  const [chargeDate, setChargeDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [category, setCategory] = useState("rent");
  const [expandedCharge, setExpandedCharge] = useState<number | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createCharge.mutate(
      {
        leaseId,
        description,
        amount_cents: amountCents,
        charge_date: chargeDate,
        due_date: dueDate || undefined,
        category: category || undefined,
      },
      {
        onSuccess: () => {
          setShowForm(false);
          setDescription("");
          setAmountCents(0);
          setChargeDate("");
          setDueDate("");
          setCategory("rent");
        },
      }
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Charges</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white rounded px-4 py-2 text-sm font-medium"
        >
          Add Charge
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white rounded shadow-sm p-4 mb-4 flex flex-col gap-3"
        >
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Amount (cents)</label>
              <input
                type="number"
                value={amountCents || ""}
                onChange={(e) => setAmountCents(Number(e.target.value))}
                className="border rounded px-3 py-2 text-sm w-full"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="border rounded px-3 py-2 text-sm w-full"
              >
                <option value="rent">Rent</option>
                <option value="late_fee">Late Fee</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Charge Date</label>
              <input
                type="date"
                value={chargeDate}
                onChange={(e) => setChargeDate(e.target.value)}
                className="border rounded px-3 py-2 text-sm w-full"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="border rounded px-3 py-2 text-sm w-full"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={createCharge.isPending}
              className="bg-green-600 text-white rounded px-4 py-2 text-sm disabled:opacity-50"
            >
              {createCharge.isPending ? "Saving..." : "Save"}
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

      <div className="space-y-3">
        {charges?.length === 0 && (
          <p className="text-gray-500 text-sm">No charges yet.</p>
        )}
        {charges?.map((c) => (
          <div key={c.id} className="bg-white rounded shadow-sm p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-medium text-sm">{c.description}</span>
                <span className="text-xs text-gray-500">
                  {new Date(c.charge_date).toLocaleDateString()}
                  {c.due_date && ` — Due: ${new Date(c.due_date).toLocaleDateString()}`}
                </span>
                <StatusPill status={c.status} />
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span>
                  <Money cents={c.amount_cents} /> charged
                </span>
                <span>
                  <Money cents={c.paid_cents} /> paid
                </span>
                <span className="font-medium">
                  Balance: <Money cents={c.balance_cents} />
                </span>
                <button
                  onClick={() =>
                    setExpandedCharge(expandedCharge === c.id ? null : c.id)
                  }
                  className="text-blue-600 hover:underline text-xs"
                >
                  {expandedCharge === c.id ? "Hide" : "Payments"}
                </button>
                <button
                  onClick={() => {
                    if (window.confirm("Delete this charge?"))
                      deleteCharge.mutate({ leaseId, chargeId: c.id });
                  }}
                  className="text-red-600 hover:underline text-xs"
                >
                  Delete
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

function PaymentsSection({ chargeId }: { chargeId: number }) {
  const { data: payments } = useChargePayments(chargeId);
  const createPayment = useCreatePayment();
  const deletePayment = useDeletePayment();
  const [showForm, setShowForm] = useState(false);
  const [amountCents, setAmountCents] = useState(0);
  const [paymentDate, setPaymentDate] = useState("");
  const [method, setMethod] = useState("");
  const [notes, setNotes] = useState("");

  const handleCreate = (e: React.FormEvent) => {
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
          setShowForm(false);
          setAmountCents(0);
          setPaymentDate("");
          setMethod("");
          setNotes("");
        },
      }
    );
  };

  return (
    <div className="mt-3 pt-3 border-t">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-500">Payments</span>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-blue-600 hover:underline text-xs"
        >
          Log Payment
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="flex flex-wrap gap-2 mb-2"
        >
          <input
            type="number"
            placeholder="Amount (cents)"
            value={amountCents || ""}
            onChange={(e) => setAmountCents(Number(e.target.value))}
            className="border rounded px-2 py-1 text-xs w-32"
            required
          />
          <input
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            className="border rounded px-2 py-1 text-xs"
            required
          />
          <input
            type="text"
            placeholder="Method"
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="border rounded px-2 py-1 text-xs w-24"
          />
          <input
            type="text"
            placeholder="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="border rounded px-2 py-1 text-xs w-32"
          />
          <button
            type="submit"
            disabled={createPayment.isPending}
            className="bg-green-600 text-white rounded px-3 py-1 text-xs disabled:opacity-50"
          >
            Save
          </button>
        </form>
      )}

      <div className="space-y-1">
        {payments?.length === 0 && (
          <p className="text-xs text-gray-400">No payments yet.</p>
        )}
        {payments?.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between text-xs bg-gray-50 rounded px-2 py-1"
          >
            <span>
              <Money cents={p.amount_cents} /> on{" "}
              {new Date(p.payment_date).toLocaleDateString()}
              {p.method && ` — ${p.method}`}
              {p.notes && ` — ${p.notes}`}
            </span>
            <button
              onClick={() => {
                if (window.confirm("Delete this payment?"))
                  deletePayment.mutate(p.id);
              }}
              className="text-red-600 hover:underline"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function DepositsSection({ leaseId }: { leaseId: number }) {
  const { data: deposits } = useLeaseDeposits(leaseId);
  const createDeposit = useCreateDeposit();
  const [showForm, setShowForm] = useState(false);
  const [amountCents, setAmountCents] = useState(0);
  const [collectedDate, setCollectedDate] = useState("");
  const [notes, setNotes] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createDeposit.mutate(
      {
        leaseId,
        amount_held_cents: amountCents,
        collected_date: collectedDate,
        notes: notes || undefined,
      },
      {
        onSuccess: () => {
          setShowForm(false);
          setAmountCents(0);
          setCollectedDate("");
          setNotes("");
        },
      }
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Deposits</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white rounded px-4 py-2 text-sm font-medium"
        >
          Add Deposit
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white rounded shadow-sm p-4 mb-4 flex flex-col gap-3"
        >
          <input
            type="number"
            placeholder="Amount (cents)"
            value={amountCents || ""}
            onChange={(e) => setAmountCents(Number(e.target.value))}
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
            placeholder="Notes (optional)"
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
              {createDeposit.isPending ? "Saving..." : "Save"}
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

      <div className="space-y-3">
        {deposits?.length === 0 && (
          <p className="text-gray-500 text-sm">No deposits yet.</p>
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
                Collected: {new Date(d.collected_date).toLocaleDateString()}
                {d.notes && ` — ${d.notes}`}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
