import { useState } from "react";
import { useCreateGeneralCharge } from "../../hooks/useCharges";
import { useLanguage } from "../../context/LanguageContext";
import { useToast } from "../ui/Toast";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

interface DebtFormProps {
  tenantId: number;
  onSuccess?: () => void;
}

export function DebtForm({ tenantId, onSuccess }: DebtFormProps) {
  const create = useCreateGeneralCharge();
  const { t } = useLanguage();
  const toast = useToast();
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const amountCents = Math.round(Number(amount) * 100);
    create.mutate(
      { tenant_id: tenantId, description, amount_cents: amountCents, charge_date: date },
      {
        onSuccess: () => {
          setDescription("");
          setAmount("");
          setDate(new Date().toISOString().slice(0, 10));
          onSuccess?.();
        },
        onError: (err: { response?: { data?: { detail?: string } }; message?: string }) => {
          const msg = err?.response?.data?.detail || err?.message || t("operation_failed");
          setError(typeof msg === "string" ? msg : t("operation_failed"));
          toast.error(typeof msg === "string" ? msg : t("operation_failed"));
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg px-3 py-2 text-sm"
        >
          <span>{error}</span>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input
          label={t("description")}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <Input
          label={t("amount_egp")}
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <Input
          label={t("debt_date")}
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>
      <div className="flex justify-end">
        <Button type="submit" loading={create.isPending}>
          {create.isPending ? t("saving") : t("add_debt")}
        </Button>
      </div>
    </form>
  );
}
