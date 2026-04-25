import { useQuery } from "@tanstack/react-query";
import { UserApi } from "@/services/api";
import { QueryKeys } from "@/constants/queryKeys";

export function useDashboardQuery() {
  return useQuery({
    queryKey: QueryKeys.dashboard,
    queryFn: UserApi.getDashboard
  });
}

export function useNotificationsQuery() {
  return useQuery({
    queryKey: QueryKeys.notifications,
    queryFn: UserApi.listNotifications
  });
}
