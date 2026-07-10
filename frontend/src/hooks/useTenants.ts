import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import type { Tenant, TenantBalance } from "../types";

export function useTenants() {
  return useQuery<Tenant[]>({
    queryKey: ["tenants"],
    queryFn: () => api.get("/tenants/").then((r) => r.data),
  });
}

export function useTenant(id: number | null) {
  return useQuery<Tenant>({
    queryKey: ["tenants", id],
    queryFn: () => api.get(`/tenants/${id}`).then((r) => r.data),
    enabled: id !== null,
  });
}

export function useTenantBalance(id: number | null) {
  return useQuery<TenantBalance>({
    queryKey: ["tenants", id, "balance"],
    queryFn: () => api.get(`/tenants/${id}/balance`).then((r) => r.data),
    enabled: id !== null,
  });
}

export function useCreateTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      email?: string;
      phone?: string;
      notes?: string;
    }) => api.post("/tenants/", data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tenants"] });
    },
  });
}

export function useUpdateTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: number;
      name?: string;
      email?: string;
      phone?: string;
      notes?: string;
    }) => api.put(`/tenants/${id}`, data).then((r) => r.data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["tenants"] });
      qc.invalidateQueries({ queryKey: ["tenants", vars.id] });
    },
  });
}

export function useDeleteTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      api.delete(`/tenants/${id}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tenants"] });
    },
  });
}
