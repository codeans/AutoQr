import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userService } from "../services/user.service";

export const useUserVehicles = () => {
  const queryClient = useQueryClient();
  const vehiclesQuery = useQuery({
    queryKey: ["user-vehicles"],
    queryFn: userService.getVehicles
  });

  const createVehicleMutation = useMutation({
    mutationFn: (payload: FormData) => userService.createVehicle(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["user-vehicles"] });
      await queryClient.invalidateQueries({ queryKey: ["user-dashboard"] });
      await queryClient.invalidateQueries({ queryKey: ["user-orders"] });
    }
  });

  return { ...vehiclesQuery, createVehicleMutation };
};
