import { useState } from "react";
import { useCreateGeneralCharge } from "../../hooks/useCharges";
import { ErrorBanner } from "../ErrorBanner";
import { useLanguage } from "../../context/LanguageContext";

interface DebtFormProps {
  tenantId: number;
  onSuccess?: () => void;
}

export function DebtForm({ tenantId, onSuccess }: DebtFormProps) {
  const create = useCreateGeneralCharge();
  const { t } = useLanguage();
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const amountCents = Math.round(Number(amount) * 100);
    create.mutate(
      { tenant_id: tenantId, description, amount_cents: amountCents, charge_date: date || new Date().toISOString().slice(0, 10) },
      {
        onSuccess: () => { setDescription(""); setAmount(""); setDate(""); onSuccess?.(); },
        onError: (err: any) => setError(err?.response?.data?.detail || "Failed to create debt"),
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-2 items-end">
      <ErrorBanner error={error} />
      <input
        type="text"
        placeholder={t("description")}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="border rounded px-2 py-1 text-sm"
        required
      />
      <input
        type="number"
        placeholder={t("amount_egp")}
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="border rounded px-2 py-1 text-sm w-28"
        step="0.01"
        required
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="border rounded px-2 py-1 text-sm"
        required
      />
      <button
        type="submit"
        disabled={create.isPending}
        className="bg-blue-600 text-white rounded px-3 py-1 text-sm disabled:opacity-50"
      >
        {create.isPending ? t("saving") : t("add_debt")}
      </button>
    </form>
  );
}
