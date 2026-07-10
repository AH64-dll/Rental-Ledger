import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import type { Charge } from "../types";

export function useLeaseCharges(leaseId: number | null) {
  return useQuery<Charge[]>({
    queryKey: ["leases", leaseId, "charges"],
    queryFn: () =>
      api.get(`/leases/${leaseId}/charges/`).then((r) => r.data),
    enabled: leaseId !== null,
  });
}

export function useAllCharges(filters?: {
  tenant_id?: number;
  status?: string;
  overdue?: boolean;
}) {
  const params = new URLSearchParams();
  if (filters?.tenant_id) params.set("tenant_id", String(filters.tenant_id));
  if (filters?.status) params.set("status", filters.status);
  if (filters?.overdue !== undefined) params.set("overdue", String(filters.overdue));

  return useQuery<Charge[]>({
    queryKey: ["charges", filters],
    queryFn: () =>
      api.get(`/charges/?${params.toString()}`).then((r) => r.data),
  });
}

export function useCharge(
  leaseId: number | null,
  chargeId: number | null
) {
  return useQuery<Charge>({
    queryKey: ["leases", leaseId, "charges", chargeId],
    queryFn: () =>
      api.get(`/leases/${leaseId}/charges/${chargeId}`).then((r) => r.data),
    enabled: leaseId !== null && chargeId !== null,
  });
}

export function useCreateCharge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      leaseId,
      ...data
    }: {
      leaseId: number;
      description: string;
      amount_cents: number;
      charge_date: string;
      due_date?: string;
      category?: string;
    }) =>
      api.post(`/leases/${leaseId}/charges/`, data).then((r) => r.data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["leases", vars.leaseId, "charges"] });
      qc.invalidateQueries({ queryKey: ["charges"] });
    },
  });
}

export function useUpdateCharge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      leaseId,
      chargeId,
      ...data
    }: {
      leaseId: number;
      chargeId: number;
      description?: string;
      amount_cents?: number;
      charge_date?: string;
      due_date?: string;
      category?: string;
    }) =>
      api
        .put(`/leases/${leaseId}/charges/${chargeId}`, data)
        .then((r) => r.data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({
        queryKey: ["leases", vars.leaseId, "charges"],
      });
      qc.invalidateQueries({ queryKey: ["charges"] });
    },
  });
}

export function useDeleteCharge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      leaseId,
      chargeId,
    }: {
      leaseId: number;
      chargeId: number;
    }) =>
      api
        .delete(`/leases/${leaseId}/charges/${chargeId}`)
        .then((r) => r.data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({
        queryKey: ["leases", vars.leaseId, "charges"],
      });
      qc.invalidateQueries({ queryKey: ["charges"] });
    },
  });
}
