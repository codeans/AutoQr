import { useQuery } from "@tanstack/react-query";
import { userService } from "../services/user.service";

export const useUserIncidents = () =>
  useQuery({
    queryKey: ["user-incidents"],
    queryFn: userService.getIncidents
  });
