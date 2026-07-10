import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import type { DashboardOverview } from "../types";

export function useDashboard() {
  return useQuery<DashboardOverview>({
    queryKey: ["dashboard"],
    queryFn: () => api.get("/dashboard/overview").then((r) => r.data),
  });
}
