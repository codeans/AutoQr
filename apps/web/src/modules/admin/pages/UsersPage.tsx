import { useState } from "react";
import { Button, DetailPanel, SecondaryButton, Select } from "../../../components/ui";
import { ActionMenu } from "../components/ActionMenu";
import { DataTable } from "../components/DataTable";
import { DetailDrawer } from "../components/DetailDrawer";
import { FilterBar } from "../components/FilterBar";
import { LoadingState } from "../components/LoadingState";
import { PageHeader } from "../components/PageHeader";
import { SearchInput } from "../components/SearchInput";
import { SectionCard } from "../components/SectionCard";
import { StatusBadge } from "../components/StatusBadge";
import { useAdminUsers } from "../hooks/useAdminUsers";
import { adminService } from "../services/admin.service";
import { AdminUser } from "../types/admin.types";
import { statusTone } from "../utils/admin.helpers";

export const UsersPage = () => {
  const { data, refetch, isLoading } = useAdminUsers();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [drawer, setDrawer] = useState(false);

  const setStatus = async (id: string, status: string) => {
    await adminService.updateUserStatus(id, status);
    await refetch();
  };

  if (isLoading) return <LoadingState rows={8} />;
  const users = (data?.users ?? []).filter((user) => {
    const byQuery = [user.name, user.email, user.phone, user.role].join(" ").toLowerCase().includes(query.toLowerCase());
    const byStatus = statusFilter === "all" || user.status === statusFilter;
    return byQuery && byStatus;
  });

  return (
    <div className="space-y-5">
      <PageHeader title="Users" subtitle="Searchable user management with profile preview and action controls." />
      <FilterBar>
        <SearchInput className="flex-1" placeholder="Search name, email, role..." value={query} onChange={(e) => setQuery(e.target.value)} />
        <Select className="md:w-44" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="pending">Pending</option>
        </Select>
      </FilterBar>

      <SectionCard title="User table" subtitle={`${users.length} entries`}>
        <DataTable
          columns={["User", "Contact", "Role", "Status", "Actions"]}
          rows={users.map((user) => [
            <div>
              <p className="font-semibold text-slate-900">{user.name || "Unnamed User"}</p>
              <p className="text-xs text-slate-500">{user._id}</p>
            </div>,
            <div>
              <p>{user.email || "-"}</p>
              <p className="text-xs text-slate-500">{user.phone || "-"}</p>
            </div>,
            <StatusBadge label={user.role || "owner"} tone="info" />,
            <StatusBadge label={user.status || "pending"} tone={statusTone(user.status || "pending")} />,
            <div className="flex items-center gap-2">
              <SecondaryButton
                className="px-3 py-1.5 text-xs"
                onClick={() => {
                  setSelected(user);
                  setDrawer(true);
                }}
              >
                View
              </SecondaryButton>
              <ActionMenu
                actions={[
                  { label: "Activate", onClick: () => setStatus(user._id, "active") },
                  { label: "Disable", onClick: () => setStatus(user._id, "inactive"), tone: "danger" }
                ]}
              />
            </div>
          ])}
        />
      </SectionCard>

      <DetailDrawer open={drawer} onClose={() => setDrawer(false)} title="User detail">
        {selected && (
          <>
            <DetailPanel title="Profile preview">
              <p>
                <strong>Name:</strong> {selected.name || "-"}
              </p>
              <p>
                <strong>Email:</strong> {selected.email || "-"}
              </p>
              <p>
                <strong>Phone:</strong> {selected.phone || "-"}
              </p>
              <p>
                <strong>Status:</strong> <StatusBadge label={selected.status || "pending"} tone={statusTone(selected.status || "pending")} />
              </p>
            </DetailPanel>
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={() => setStatus(selected._id, "active")}>Activate</Button>
              <Button className="bg-slate-700 hover:bg-slate-800" onClick={() => setStatus(selected._id, "inactive")}>
                Disable
              </Button>
            </div>
          </>
        )}
      </DetailDrawer>
    </div>
  );
};
