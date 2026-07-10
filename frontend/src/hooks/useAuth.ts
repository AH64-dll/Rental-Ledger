import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";

export function useLogin() {
  return useMutation({
    mutationFn: (data: { username: string; password: string }) =>
      api.post("/auth/login", data).then((r) => r.data),
  });
}

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => api.get("/me").then((r) => r.data),
    retry: false,
    enabled: typeof window !== "undefined" && !!localStorage.getItem("token"),
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      new_username?: string;
      new_password?: string;
      current_password: string;
    }) => api.put("/auth/profile", data).then((r) => r.data),
    onSuccess: (data) => {
      if (data?.access_token) {
        localStorage.setItem("token", data.access_token);
      }
      qc.invalidateQueries({ queryKey: ["me"] });
    },
  });
}
