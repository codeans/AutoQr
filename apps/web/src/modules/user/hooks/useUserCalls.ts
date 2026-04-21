import { useQuery } from "@tanstack/react-query";
import { userService } from "../services/user.service";

export const useUserCalls = () =>
  useQuery({
    queryKey: ["user-calls"],
    queryFn: userService.getCalls
  });
