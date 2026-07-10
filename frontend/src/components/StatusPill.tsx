type Status = "paid" | "partial" | "unpaid" | "overdue";

const COLORS: Record<Status, string> = {
  paid: "bg-green-100 text-green-800",
  partial: "bg-yellow-100 text-yellow-800",
  unpaid: "bg-gray-100 text-gray-800",
  overdue: "bg-red-100 text-red-800",
};

export function StatusPill({ status }: { status: Status }) {
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${COLORS[status]}`}>
      {status}
    </span>
  );
}
