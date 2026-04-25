import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserApi } from "@/services/api";
import { QueryKeys } from "@/constants/queryKeys";
import { useAuthStore } from "@/stores/auth.store";

export function useProfileQuery() {
  const setUser = useAuthStore((s) => s.setUser);
  return useQuery({
    queryKey: QueryKeys.me,
    queryFn: async () => {
      const user = await UserApi.getProfile();
      setUser(user);
      return user;
    }
  });
}

export function useUpdateProfileMutation() {
  const qc = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: (input: Parameters<typeof UserApi.updateProfile>[0]) =>
      UserApi.updateProfile(input),
    onSuccess: (user) => {
      setUser(user);
      qc.invalidateQueries({ queryKey: QueryKeys.me });
    }
  });
}
