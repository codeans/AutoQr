import { useQuery } from "@tanstack/react-query";
import { userService } from "../services/user.service";

export const useUserNotifications = () =>
  useQuery({
    queryKey: ["user-notifications"],
    queryFn: userService.getNotifications
  });
