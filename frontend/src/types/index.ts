export interface Property {
  id: number;
  name: string;
  address: string | null;
  notes: string | null;
  created_at: string;
}

export interface Tenant {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  created_at: string;
}

export interface Lease {
  id: number;
  property_id: number;
  tenant_id: number;
  start_date: string;
  end_date: string;
  monthly_rent_cents: number;
  rent_due_day_of_month: number;
  late_fee_percent: number;
  security_deposit_cents: number;
  status: "active" | "ended" | "expired";
  tenant_name: string;
  property_name: string;
  created_at: string;
}

export interface Charge {
  id: number;
  lease_id: number | null;
  tenant_id: number;
  description: string;
  amount_cents: number;
  charge_date: string;
  due_date: string | null;
  category: "rent" | "late_fee" | "other";
  late_fee_applied: boolean;
  paid_cents: number;
  balance_cents: number;
  status: "paid" | "partial" | "unpaid" | "overdue";
  tenant_name: string;
  created_at: string;
}

export interface Payment {
  id: number;
  charge_id: number;
  amount_cents: number;
  payment_date: string;
  method: string | null;
  notes: string | null;
  created_at: string;
}

export interface TenantBalance {
  net_balance_cents: number;
  deposits_held_cents: number;
  charges: {
    description: string;
    amount_cents: number;
    paid_cents: number;
    balance_cents: number;
    status: string;
    due_date: string | null;
  }[];
}

export interface DashboardOverview {
  active_leases: number;
  overdue_charges: number;
  total_owed_to_you_cents: number;
  deposits_held_cents: number;
  expiring_leases: number;
}

export interface Deposit {
  id: number;
  lease_id: number;
  amount_held_cents: number;
  collected_date: string;
  status: "held" | "partially_refunded" | "refunded";
  refunded_amount_cents: number;
  notes: string | null;
}
