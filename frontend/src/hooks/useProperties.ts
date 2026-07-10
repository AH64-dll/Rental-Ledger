import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import type { Property } from "../types";

export function useProperties() {
  return useQuery<Property[]>({
    queryKey: ["properties"],
    queryFn: () => api.get("/properties/").then((r) => r.data),
  });
}

export function useProperty(id: number | null) {
  return useQuery<Property>({
    queryKey: ["properties", id],
    queryFn: () => api.get(`/properties/${id}`).then((r) => r.data),
    enabled: id !== null,
  });
}

export function useCreateProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; address?: string; notes?: string }) =>
      api.post("/properties/", data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}

export function useUpdateProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: number;
      name?: string;
      address?: string;
      notes?: string;
    }) => api.put(`/properties/${id}`, data).then((r) => r.data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["properties"] });
      qc.invalidateQueries({ queryKey: ["properties", vars.id] });
    },
  });
}

export function useDeleteProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      api.delete(`/properties/${id}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}
