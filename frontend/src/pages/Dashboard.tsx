import { useDashboard } from "../hooks/useDashboard";
import { Money } from "../components/Money";

export function Dashboard() {
  const { data, isLoading, error } = useDashboard();

  if (isLoading) return <p className="text-gray-500">Loading dashboard...</p>;
  if (error) return <p className="text-red-600">Failed to load dashboard.</p>;
  if (!data) return null;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Dashboard</h2>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card label="Active Leases" value={String(data.active_leases)} />
        <Card label="Overdue Charges" value={String(data.overdue_charges)} />
        <Card
          label="Total Owed to You"
          value={<Money cents={data.total_owed_to_you_cents} />}
        />
        <Card
          label="Deposits Held"
          value={<Money cents={data.deposits_held_cents} />}
        />
        <Card
          label="Expiring Soon"
          value={`${data.expiring_leases} lease${data.expiring_leases !== 1 ? "s" : ""}`}
        />
      </div>
    </div>
  );
}

function Card({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-white rounded shadow-sm p-4">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-lg font-semibold mt-1">{value}</p>
    </div>
  );
}
