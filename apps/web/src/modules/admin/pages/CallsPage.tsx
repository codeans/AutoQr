import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "../components/DataTable";
import { FilterBar } from "../components/FilterBar";
import { LoadingState } from "../components/LoadingState";
import { PageHeader } from "../components/PageHeader";
import { SearchInput } from "../components/SearchInput";
import { SectionCard } from "../components/SectionCard";
import { StatusBadge } from "../components/StatusBadge";
import { adminService } from "../services/admin.service";
import { AdminCall } from "../types/admin.types";
import { statusTone } from "../utils/admin.helpers";

export const CallsPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-calls"],
    queryFn: adminService.getCalls
  });
  const [query, setQuery] = useState("");
  if (isLoading) return <LoadingState rows={8} />;

  const calls = (data?.calls ?? []).filter((call: AdminCall) =>
    [call.ownerUserId?.email, call.incidentId?._id, call.status, call.rejectionReason].join(" ").toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <PageHeader title="Calls" subtitle="Readable call logs with linked incidents, durations, and filter controls." />
      <FilterBar>
        <SearchInput className="flex-1" placeholder="Search owner, incident, status..." value={query} onChange={(e) => setQuery(e.target.value)} />
      </FilterBar>
      <SectionCard title="Call logs">
        <DataTable
          columns={["Date", "Owner", "Incident", "Status", "Duration", "Reason"]}
          rows={calls.map((call: AdminCall) => [
            new Date(call.createdAt).toLocaleString(),
            call.ownerUserId?.email ?? "-",
            call.incidentId?._id ?? "-",
            <StatusBadge label={call.status || "pending"} tone={statusTone(call.status || "pending")} />,
            `${call.duration ?? 0}s`,
            call.rejectionReason || "-"
          ])}
        />
      </SectionCard>
    </div>
  );
};
