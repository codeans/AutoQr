import { useQuery } from "@tanstack/react-query";
import { adminService } from "../services/admin.service";
import { AdminPayment } from "../types/admin.types";

interface AdminPaymentsResponse {
  payments: AdminPayment[];
}

export const useAdminPayments = () =>
  useQuery<AdminPaymentsResponse>({
    queryKey: ["admin-payments"],
    queryFn: adminService.getPayments
  });
