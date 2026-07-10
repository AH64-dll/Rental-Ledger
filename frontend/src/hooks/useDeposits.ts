import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import type { Deposit } from "../types";

export function useLeaseDeposits(leaseId: number | null) {
  return useQuery<Deposit[]>({
    queryKey: ["leases", leaseId, "deposits"],
    queryFn: () =>
      api.get(`/leases/${leaseId}/deposits/`).then((r) => r.data),
    enabled: leaseId !== null,
  });
}

export function useCreateDeposit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      leaseId,
      ...data
    }: {
      leaseId: number;
      amount_held_cents: number;
      collected_date: string;
      notes?: string;
    }) =>
      api.post(`/leases/${leaseId}/deposits/`, data).then((r) => r.data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["leases", vars.leaseId, "deposits"] });
    },
  });
}
