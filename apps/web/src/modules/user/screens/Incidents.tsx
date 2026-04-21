import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Select } from "../../../components/ui";
import { DataTable } from "../components/DataTable";
import { DetailDrawer } from "../components/DetailDrawer";
import { EmptyState } from "../components/EmptyState";
import { FilterBar } from "../components/FilterBar";
import { IncidentCard } from "../components/IncidentCard";
import { LoadingState } from "../components/LoadingState";
import { SearchInput } from "../components/SearchInput";
import { SectionCard } from "../components/SectionCard";
import { StatusBadge } from "../components/StatusBadge";
import { Timeline } from "../components/Timeline";
import { useUserIncidents } from "../hooks/useUserIncidents";
import { userService } from "../services/user.service";
import { formatDateTime } from "../utils/user.helpers";

export const IncidentsScreen = () => {
  const { data, isLoading } = useUserIncidents();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);

  const filteredIncidents = useMemo(
    () =>
      (data?.incidents ?? []).filter((incident) => {
        const query = search.toLowerCase();
        const matchesSearch =
          incident.message.toLowerCase().includes(query) ||
          (incident.reporterName ?? "").toLowerCase().includes(query) ||
          incident.reporterPhone.toLowerCase().includes(query);
        const matchesStatus = status === "all" || incident.status === status;
        return matchesSearch && matchesStatus;
      }),
    [data?.incidents, search, status]
  );

  const { data: incidentDetailData, isFetching: isDetailLoading } = useQuery({
    queryKey: ["user-incident-detail", selectedIncidentId],
    queryFn: async () => userService.getIncidentDetail(selectedIncidentId as string),
    enabled: !!selectedIncidentId
  });

  if (isLoading) return <LoadingState rows={7} />;

  return (
    <div className="space-y-6">
      <SectionCard title="Incident management" subtitle="Monitor incident reports, caller details, and resolution progress.">
        <FilterBar>
          <SearchInput placeholder="Search by reporter, phone, message..." value={search} onChange={(event) => setSearch(event.target.value)} />
          <Select value={status} onChange={(event) => setStatus(event.target.value)} className="md:max-w-[220px]">
            <option value="all">All statuses</option>
            <option value="open">Open</option>
            <option value="resolved">Resolved</option>
            <option value="pending">Pending</option>
          </Select>
        </FilterBar>
      </SectionCard>

      {filteredIncidents.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {filteredIncidents.map((incident) => (
            <IncidentCard key={incident._id} incident={incident} onOpenDetail={setSelectedIncidentId} />
          ))}
        </div>
      ) : (
        <EmptyState title="No incidents found" message="Try adjusting your filters or wait for new reports." />
      )}

      <SectionCard title="Incident table" subtitle="Quickly scan reporter details, call status, and resolution state.">
        <DataTable
          columns={["Date", "Reporter", "Message", "Images", "Status", "Action"]}
          rows={filteredIncidents.map((incident) => [
            formatDateTime(incident.createdAt),
            <div key={incident._id}>
              <p className="font-medium text-slate-900">{incident.reporterName || "Anonymous"}</p>
              <p className="text-xs text-slate-500">{incident.reporterPhone}</p>
            </div>,
            <p className="max-w-xs truncate">{incident.message}</p>,
            `${incident.images?.length ?? 0} image(s)`,
            <StatusBadge status={incident.status} />,
            <button
              type="button"
              className="cursor-pointer text-sm font-semibold text-action transition hover:text-red-700"
              onClick={() => setSelectedIncidentId(incident._id)}
            >
              View details
            </button>
          ])}
        />
      </SectionCard>

      <DetailDrawer open={!!selectedIncidentId} title="Incident details" onClose={() => setSelectedIncidentId(null)}>
        {isDetailLoading ? (
          <LoadingState rows={4} />
        ) : incidentDetailData?.incident ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">{incidentDetailData.incident.reporterName || "Anonymous reporter"}</p>
              <p className="text-xs text-slate-500">{incidentDetailData.incident.reporterPhone}</p>
              <p className="mt-2 text-sm text-slate-700">{incidentDetailData.incident.message}</p>
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-slate-900">Call timeline</p>
              <Timeline
                items={(incidentDetailData.calls ?? []).map((call) => ({
                  title: call.status,
                  description: `${call.duration ?? 0}s`,
                  time: call.createdAt,
                  status: call.status
                }))}
              />
            </div>
          </div>
        ) : (
          <EmptyState title="No detail found" message="This incident might no longer be available." />
        )}
      </DetailDrawer>
    </div>
  );
};
