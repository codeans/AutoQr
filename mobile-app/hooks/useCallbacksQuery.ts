import { useQuery } from "@tanstack/react-query";
import { CallbacksApi } from "@/services/api";
import { QueryKeys } from "@/constants/queryKeys";

export function useCallbacksQuery(status?: string) {
  return useQuery({
    queryKey: status ? [...QueryKeys.callbacks, status] : QueryKeys.callbacks,
    queryFn: () => CallbacksApi.callbacksService.history(status).then((r) => r.callbacks)
  });
}
