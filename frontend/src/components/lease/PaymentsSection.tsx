import { useState } from "react";
import { Money } from "../Money";
import { useChargePayments, useCreatePayment, useDeletePayment } from "../../hooks/usePayments";

export function PaymentsSection({ chargeId }: { chargeId: number }) {
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
