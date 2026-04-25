import { useQuery } from "@tanstack/react-query";
import { ContentApi } from "@/services/api";
import { QueryKeys } from "@/constants/queryKeys";

export function useContentQuery(slug: string) {
  return useQuery({
    queryKey: QueryKeys.content(slug),
    queryFn: () => ContentApi.getContent(slug),
    staleTime: 5 * 60_000
  });
}
