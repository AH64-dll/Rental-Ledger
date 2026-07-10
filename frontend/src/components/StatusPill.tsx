import { useLanguage } from "../context/LanguageContext";
import { Badge } from "./ui/Badge";

export type ChargeStatus = "paid" | "partial" | "unpaid" | "overdue";
export type LeaseStatus = "active" | "ended" | "expired";

const CHARGE_VARIANT = {
  paid: "success",
  partial: "warning",
  unpaid: "neutral",
  overdue: "danger",
} as const;

const LEASE_VARIANT = {
  active: "success",
  ended: "neutral",
  expired: "danger",
} as const;

export function StatusPill({ status }: { status: ChargeStatus | LeaseStatus }) {
  const { t } = useLanguage();
  const isLease = status === "active" || status === "ended" || status === "expired";
  const variant = isLease
    ? LEASE_VARIANT[status as LeaseStatus]
    : CHARGE_VARIANT[status as ChargeStatus];
  return <Badge variant={variant}>{t(`status_${status}`)}</Badge>;
}
