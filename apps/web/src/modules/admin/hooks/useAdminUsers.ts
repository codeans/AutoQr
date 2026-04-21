import { useQuery } from "@tanstack/react-query";
import { adminService } from "../services/admin.service";
import { AdminUser } from "../types/admin.types";

interface AdminUsersResponse {
  users: AdminUser[];
}

export const useAdminUsers = () =>
  useQuery<AdminUsersResponse>({
    queryKey: ["admin-users"],
    queryFn: adminService.getUsers
  });
