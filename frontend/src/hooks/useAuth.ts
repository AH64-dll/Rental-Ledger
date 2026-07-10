import { useMutation, useQuery } from "@tanstack/react-query";
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
