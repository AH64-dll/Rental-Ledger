import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import type { Unit } from "../types";

export function useUnits(propertyId: number | null) {
  return useQuery<Unit[]>({
    queryKey: ["units", propertyId],
    queryFn: () =>
      api.get(`/properties/${propertyId}/units/`).then((r) => r.data),
    enabled: propertyId !== null,
  });
}

export function useCreateUnit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      propertyId,
      ...data
    }: {
      propertyId: number;
      name: string;
      notes?: string;
    }) =>
      api
        .post(`/properties/${propertyId}/units/`, data)
        .then((r) => r.data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["units", vars.propertyId] });
    },
  });
}

export function useUpdateUnit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      propertyId,
      unitId,
      ...data
    }: {
      propertyId: number;
      unitId: number;
      name?: string;
      notes?: string;
    }) =>
      api
        .put(`/properties/${propertyId}/units/${unitId}`, data)
        .then((r) => r.data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["units", vars.propertyId] });
    },
  });
}

export function useDeleteUnit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      propertyId,
      unitId,
    }: {
      propertyId: number;
      unitId: number;
    }) =>
      api
        .delete(`/properties/${propertyId}/units/${unitId}`)
        .then((r) => r.data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["units", vars.propertyId] });
    },
  });
}
