import { useQuery } from "@tanstack/react-query";
import { IncidentsApi } from "@/services/api";
import { QueryKeys } from "@/constants/queryKeys";

export function useIncidentsQuery() {
  return useQuery({
    queryKey: QueryKeys.incidents,
    queryFn: IncidentsApi.listIncidents
  });
}

export function useIncidentQuery(id: string | undefined) {
  return useQuery({
    queryKey: id ? QueryKeys.incident(id) : ["incident", "none"],
    queryFn: () => IncidentsApi.getIncident(id as string),
    enabled: Boolean(id)
  });
}

export function useCallHistoryQuery() {
  return useQuery({
    queryKey: QueryKeys.calls,
    queryFn: IncidentsApi.listCalls
  });
}

export function useScanAlertsQuery() {
  return useQuery({
    queryKey: QueryKeys.scanAlerts,
    queryFn: IncidentsApi.listScanAlerts
  });
}
