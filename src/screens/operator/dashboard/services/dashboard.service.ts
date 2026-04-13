import { api } from "@/services/api";
import type { Package } from "@/types/operator.types";

interface DashboardData {
  packages: Package[];
  pendingCount: number;
  deliveredCount: number;
}

export const dashboardService = {
  getPackages: async (): Promise<DashboardData> => {
    const response = await api.get<Package[]>("/employee/packages");
    const packages = response.data;
    return {
      packages,
      pendingCount: packages.filter((p) => p.status === "WAITING_PICKUP").length,
      deliveredCount: packages.filter((p) => p.status === "DELIVERED").length,
    };
  },
};
