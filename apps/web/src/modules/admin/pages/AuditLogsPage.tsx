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
import { AdminAuditLog } from "../types/admin.types";

export const AuditLogsPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-audit"],
    queryFn: adminService.getAuditLogs
  });
  const [query, setQuery] = useState("");
  if (isLoading) return <LoadingState rows={8} />;

  const logs = (data?.logs ?? []).filter((log: AdminAuditLog) =>
    [log.adminId, log.action, log.targetType, log.targetId].join(" ").toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <PageHeader title="Audit Logs" subtitle="Technical traceability presented in a readable premium timeline/table UI." />
      <FilterBar>
        <SearchInput className="flex-1" placeholder="Search actor, action, target..." value={query} onChange={(e) => setQuery(e.target.value)} />
      </FilterBar>
      <SectionCard title="Audit records">
        <DataTable
          columns={["Time", "Actor", "Action", "Target", "Metadata"]}
          rows={logs.map((log: AdminAuditLog) => [
            new Date(log.createdAt).toLocaleString(),
            log.adminId || "system",
            <StatusBadge label={log.action || "action"} tone="info" />,
            `${log.targetType}:${log.targetId}`,
            <div className="flex flex-wrap gap-1">
              {Object.entries(log.metadata || {}).length ? (
                Object.entries(log.metadata || {})
                  .slice(0, 3)
                  .map(([key, value]) => (
                    <span key={key} className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600">
                      {key}:{String(value)}
                    </span>
                  ))
              ) : (
                <span className="text-xs text-slate-500">No metadata</span>
              )}
            </div>
          ])}
        />
      </SectionCard>
    </div>
  );
};
