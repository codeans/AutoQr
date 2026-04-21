import { useQuery } from "@tanstack/react-query";
import { adminService } from "../services/admin.service";
import { AdminDashboardData } from "../types/admin.types";

export const useAdminStats = () =>
  useQuery<AdminDashboardData>({
    queryKey: ["admin-dashboard"],
    queryFn: adminService.getDashboard
  });
