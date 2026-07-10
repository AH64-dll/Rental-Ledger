import { useState } from "react";
import { useParams } from "react-router-dom";
import { useLease } from "../hooks/useLeases";
import { Money } from "../components/Money";
import { ChargesSection } from "../components/lease/ChargesSection";
import { DepositsSection } from "../components/lease/DepositsSection";

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
