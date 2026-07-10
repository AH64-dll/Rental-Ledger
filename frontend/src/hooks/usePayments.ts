import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import type { Payment } from "../types";

export function useChargePayments(chargeId: number | null) {
  return useQuery<Payment[]>({
    queryKey: ["charges", chargeId, "payments"],
    queryFn: () =>
      api.get(`/charges/${chargeId}/payments/`).then((r) => r.data),
    enabled: chargeId !== null,
  });
}

export function useCreatePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      chargeId,
      ...data
    }: {
      chargeId: number;
      amount_cents: number;
      payment_date: string;
      method?: string;
      notes?: string;
    }) =>
      api.post(`/charges/${chargeId}/payments/`, data).then((r) => r.data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({
        queryKey: ["charges", vars.chargeId, "payments"],
      });
      qc.invalidateQueries({ queryKey: ["charges"] });
    },
  });
}

export function useUpdatePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      paymentId,
      ...data
    }: {
      paymentId: number;
      amount_cents?: number;
      payment_date?: string;
      method?: string;
      notes?: string;
    }) =>
      api.put(`/payments/${paymentId}`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["charges"] });
    },
  });
}

export function useDeletePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (paymentId: number) =>
      api.delete(`/payments/${paymentId}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["charges"] });
    },
  });
}
