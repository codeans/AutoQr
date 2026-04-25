import { useMemo, useState } from "react";
import { Select } from "../../../components/ui";
import { CallCard } from "../components/CallCard";
import { DataTable } from "../components/DataTable";
import { EmptyState } from "../components/EmptyState";
import { FilterBar } from "../components/FilterBar";
import { LoadingState } from "../components/LoadingState";
import { SearchInput } from "../components/SearchInput";
import { SectionCard } from "../components/SectionCard";
import { StatusBadge } from "../components/StatusBadge";
import { useUserCalls } from "../hooks/useUserCalls";
import { useQuery } from "@tanstack/react-query";
import { userService } from "../services/user.service";
import { formatDateTime } from "../utils/user.helpers";

export const CallsScreen = () => {
  const { data, isLoading } = useUserCalls();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [view, setView] = useState<"calls" | "callbacks">("calls");
  const { data: callbacksData } = useQuery({
    queryKey: ["user-callbacks"],
    queryFn: () => userService.getCallbacks()
  });

  const filteredCalls = useMemo(
    () =>
      (data?.calls ?? []).filter((call) => {
        const query = search.toLowerCase();
        const matchesSearch = (call.incidentId ?? "").toLowerCase().includes(query) || call.status.toLowerCase().includes(query);
        const matchesStatus = status === "all" || call.status === status;
        return matchesSearch && matchesStatus;
      }),
    [data?.calls, search, status]
  );
  const filteredCallbacks = useMemo(
    () =>
      (callbacksData?.callbacks ?? []).filter((callback) => {
        const query = search.toLowerCase();
        const incidentId = typeof callback.incidentId === "string" ? callback.incidentId : callback.incidentId?._id || "";
        const matchesSearch = incidentId.toLowerCase().includes(query) || callback.callbackStatus.toLowerCase().includes(query);
        const matchesStatus = status === "all" || callback.callbackStatus === status;
        return matchesSearch && matchesStatus;
      }),
    [callbacksData?.callbacks, search, status]
  );

  if (isLoading) return <LoadingState rows={6} />;

  return (
    <div className="space-y-6">
      <SectionCard title="Call history" subtitle="Track incoming call outcomes linked with incidents and response timelines.">
        <FilterBar>
          <Select value={view} onChange={(event) => setView(event.target.value as "calls" | "callbacks")} className="md:max-w-[220px]">
            <option value="calls">Calls</option>
            <option value="callbacks">Callbacks</option>
          </Select>
          <SearchInput placeholder="Search by incident id or status..." value={search} onChange={(event) => setSearch(event.target.value)} />
          <Select value={status} onChange={(event) => setStatus(event.target.value)} className="md:max-w-[220px]">
            <option value="all">All statuses</option>
            <option value="accepted">Accepted</option>
            <option value="declined">Declined</option>
            <option value="missed">Missed</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="connected">Connected</option>
          </Select>
        </FilterBar>
      </SectionCard>

      {view === "calls" && filteredCalls.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {filteredCalls.map((call) => (
            <CallCard key={call._id} call={call} />
          ))}
        </div>
      ) : null}
      {view === "callbacks" && filteredCallbacks.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {filteredCallbacks.map((callback) => (
            <CallCard
              key={callback._id}
              call={{
                _id: callback._id,
                incidentId: typeof callback.incidentId === "string" ? callback.incidentId : callback.incidentId?._id,
                status: callback.callbackStatus,
                duration: callback.duration,
                rejectionReason: callback.notes,
                createdAt: callback.createdAt
              }}
            />
          ))}
        </div>
      ) : (
        <EmptyState title="No calls found" message="Call records will appear here after incident contact attempts." />
      )}

      <SectionCard title={view === "calls" ? "Detailed call ledger" : "Callback history tab"} subtitle="Readable status, duration, and linked incident reference.">
        <DataTable
          columns={["Timestamp", "Incident", "Status", "Duration", "Outcome"]}
          rows={(view === "calls" ? filteredCalls : filteredCallbacks).map((item: any) => [
            formatDateTime(item.createdAt),
            (typeof item.incidentId === "string" ? item.incidentId : item.incidentId?._id) || "-",
            <StatusBadge status={item.status || item.callbackStatus} />,
            `${item.duration ?? 0}s`,
            item.rejectionReason || item.notes || "completed"
          ])}
        />
      </SectionCard>
    </div>
  );
};
