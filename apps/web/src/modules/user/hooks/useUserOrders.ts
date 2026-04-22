import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userService } from "../services/user.service";

export const useUserOrders = () => {
  const queryClient = useQueryClient();
  const ordersQuery = useQuery({
    queryKey: ["user-orders"],
    queryFn: userService.getOrders
  });

  const checkoutMutation = useMutation({
    mutationFn: (orderId: string) => userService.createCheckout(orderId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["user-orders"] });
      await queryClient.invalidateQueries({ queryKey: ["user-cars"] });
    }
  });

  return { ...ordersQuery, checkoutMutation };
};
