import { useQuery } from "@tanstack/react-query";
import { adminService } from "../services/admin.service";
import { AdminOrder } from "../types/admin.types";

interface AdminOrdersResponse {
  orders: AdminOrder[];
}

export const useAdminOrders = () =>
  useQuery<AdminOrdersResponse>({
    queryKey: ["admin-orders"],
    queryFn: adminService.getOrders
  });
