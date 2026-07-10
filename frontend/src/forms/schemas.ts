import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "username_required"),
  password: z.string().min(1, "password_required"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const propertyCreateSchema = z.object({
  name: z.string().min(1, "name_required"),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export type PropertyCreateFormData = z.infer<typeof propertyCreateSchema>;

export const propertyUpdateSchema = z.object({
  name: z.string().min(1, "name_required").optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export type PropertyUpdateFormData = z.infer<typeof propertyUpdateSchema>;

export const tenantCreateSchema = z.object({
  name: z.string().min(1, "name_required"),
  email: z.string().optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

export type TenantCreateFormData = z.infer<typeof tenantCreateSchema>;

export const tenantUpdateSchema = z.object({
  name: z.string().min(1, "name_required").optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

export type TenantUpdateFormData = z.infer<typeof tenantUpdateSchema>;

export const leaseCreateSchema = z.object({
  property_id: z.number({ message: "property_required" }),
  tenant_id: z.number({ message: "tenant_required" }),
  start_date: z.string().min(1, "start_date_required"),
  end_date: z.string().min(1, "end_date_required"),
  monthly_rent_cents: z.number({ message: "rent_amount_required" }).min(1, "must_be_positive"),
  rent_due_day_of_month: z.number({ message: "due_day_required" }).min(1).max(28),
  late_fee_percent: z.number().min(0).max(100).optional(),
  security_deposit_cents: z.number().min(0).optional(),
});

export type LeaseCreateFormData = z.infer<typeof leaseCreateSchema>;

export const chargeCreateSchema = z.object({
  description: z.string().min(1, "description_required"),
  amount_cents: z.number({ message: "amount_required" }).min(1, "must_be_positive"),
  charge_date: z.string().min(1, "date_required"),
  due_date: z.string().optional(),
  category: z.enum(["rent", "late_fee", "other"]).optional(),
});

export type ChargeCreateFormData = z.infer<typeof chargeCreateSchema>;

export const paymentCreateSchema = z.object({
  amount_cents: z.number({ message: "amount_required" }).min(1, "must_be_positive"),
  payment_date: z.string().min(1, "date_required"),
  method: z.string().optional(),
  notes: z.string().optional(),
});

export type PaymentCreateFormData = z.infer<typeof paymentCreateSchema>;

