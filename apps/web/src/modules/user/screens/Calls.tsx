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
import { formatDateTime } from "../utils/user.helpers";

export const CallsScreen = () => {
  const { data, isLoading } = useUserCalls();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

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

  if (isLoading) return <LoadingState rows={6} />;

  return (
    <div className="space-y-6">
      <SectionCard title="Call history" subtitle="Track incoming call outcomes linked with incidents and response timelines.">
        <FilterBar>
          <SearchInput placeholder="Search by incident id or status..." value={search} onChange={(event) => setSearch(event.target.value)} />
          <Select value={status} onChange={(event) => setStatus(event.target.value)} className="md:max-w-[220px]">
            <option value="all">All statuses</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="missed">Missed</option>
            <option value="completed">Completed</option>
            <option value="connected">Connected</option>
          </Select>
        </FilterBar>
      </SectionCard>

      {filteredCalls.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {filteredCalls.map((call) => (
            <CallCard key={call._id} call={call} />
          ))}
        </div>
      ) : (
        <EmptyState title="No calls found" message="Call records will appear here after incident contact attempts." />
      )}

      <SectionCard title="Detailed call ledger" subtitle="Readable status, duration, and linked incident reference.">
        <DataTable
          columns={["Timestamp", "Incident", "Status", "Duration", "Outcome"]}
          rows={filteredCalls.map((call) => [
            formatDateTime(call.createdAt),
            call.incidentId || "-",
            <StatusBadge status={call.status} />,
            `${call.duration ?? 0}s`,
            call.rejectionReason || "completed"
          ])}
        />
      </SectionCard>
    </div>
  );
};
