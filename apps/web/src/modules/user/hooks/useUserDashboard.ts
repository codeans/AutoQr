import { useQuery } from "@tanstack/react-query";
import { userService } from "../services/user.service";

export const useUserDashboard = () =>
  useQuery({
    queryKey: ["user-dashboard"],
    queryFn: userService.getDashboard
  });
