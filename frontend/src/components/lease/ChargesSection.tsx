import { useState } from "react";
import { Money } from "../Money";
import { StatusPill } from "../StatusPill";
import { useLeaseCharges, useCreateCharge, useDeleteCharge } from "../../hooks/useCharges";
import { PaymentsSection } from "./PaymentsSection";

export function ChargesSection({ leaseId }: { leaseId: number }) {
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
