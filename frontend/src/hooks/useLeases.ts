import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import type { Lease } from "../types";

export function useLeases() {
  return useQuery<Lease[]>({
    queryKey: ["leases"],
    queryFn: () => api.get("/leases/").then((r) => r.data),
  });
}

export function useLease(id: number | null) {
  return useQuery<Lease>({
    queryKey: ["leases", id],
    queryFn: () => api.get(`/leases/${id}`).then((r) => r.data),
    enabled: id !== null,
  });
}

export function useCreateLease() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      unit_id: number;
      tenant_id: number;
      start_date: string;
      end_date: string;
      monthly_rent_cents: number;
      rent_due_day_of_month: number;
      late_fee_percent?: number;
      security_deposit_cents?: number;
    }) => api.post("/leases/", data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leases"] });
    },
  });
}

export function useUpdateLease() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: number;
      unit_id?: number;
      tenant_id?: number;
      start_date?: string;
      end_date?: string;
      monthly_rent_cents?: number;
      rent_due_day_of_month?: number;
      late_fee_percent?: number;
      security_deposit_cents?: number;
    }) => api.put(`/leases/${id}`, data).then((r) => r.data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["leases"] });
      qc.invalidateQueries({ queryKey: ["leases", vars.id] });
    },
  });
}

export function useDeleteLease() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      api.delete(`/leases/${id}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leases"] });
    },
  });
}

export function useEndLease() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      api.post(`/leases/${id}/end`).then((r) => r.data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["leases"] });
      qc.invalidateQueries({ queryKey: ["leases", vars] });
    },
  });
}
