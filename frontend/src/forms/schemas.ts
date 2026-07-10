import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const propertyCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export type PropertyCreateFormData = z.infer<typeof propertyCreateSchema>;

export const propertyUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export type PropertyUpdateFormData = z.infer<typeof propertyUpdateSchema>;

export const tenantCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

export type TenantCreateFormData = z.infer<typeof tenantCreateSchema>;

export const tenantUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

export type TenantUpdateFormData = z.infer<typeof tenantUpdateSchema>;

export const unitCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  notes: z.string().optional(),
});

export type UnitCreateFormData = z.infer<typeof unitCreateSchema>;

export const unitUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  notes: z.string().optional(),
});

export type UnitUpdateFormData = z.infer<typeof unitUpdateSchema>;

export const leaseCreateSchema = z.object({
  unit_id: z.number({ required_error: "Unit is required" }),
  tenant_id: z.number({ required_error: "Tenant is required" }),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  monthly_rent_cents: z.number({ required_error: "Rent amount is required" }).min(1, "Must be positive"),
  rent_due_day_of_month: z.number({ required_error: "Due day is required" }).min(1).max(28),
  late_fee_percent: z.number().min(0).max(100).optional(),
  security_deposit_cents: z.number().min(0).optional(),
});

export type LeaseCreateFormData = z.infer<typeof leaseCreateSchema>;

export const chargeCreateSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount_cents: z.number({ required_error: "Amount is required" }).min(1, "Must be positive"),
  charge_date: z.string().min(1, "Date is required"),
  due_date: z.string().optional(),
  category: z.enum(["rent", "late_fee", "other"]).optional(),
});

export type ChargeCreateFormData = z.infer<typeof chargeCreateSchema>;

export const paymentCreateSchema = z.object({
  amount_cents: z.number({ required_error: "Amount is required" }).min(1, "Must be positive"),
  payment_date: z.string().min(1, "Date is required"),
  method: z.string().optional(),
  notes: z.string().optional(),
});

export type PaymentCreateFormData = z.infer<typeof paymentCreateSchema>;
