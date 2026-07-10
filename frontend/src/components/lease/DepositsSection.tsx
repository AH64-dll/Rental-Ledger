import { useState } from "react";
import { Money } from "../Money";
import { useLeaseDeposits, useCreateDeposit } from "../../hooks/useDeposits";

export function DepositsSection({ leaseId }: { leaseId: number }) {
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
