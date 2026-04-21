import { FormEvent, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, Input } from "../../../components/ui";
import { DataTable } from "../components/DataTable";
import { LoadingState } from "../components/LoadingState";
import { PageHeader } from "../components/PageHeader";
import { SectionCard } from "../components/SectionCard";
import { adminService } from "../services/admin.service";
import { AdminSetting } from "../types/admin.types";

export const SettingsPage = () => {
  const { data, refetch, isLoading } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: adminService.getSettings
  });
  const [form, setForm] = useState({ key: "oneTimePrice", value: "49" });

  const save = async (e: FormEvent) => {
    e.preventDefault();
    await adminService.saveSetting({ key: form.key, value: form.value });
    await refetch();
  };

  if (isLoading) return <LoadingState rows={8} />;
  return (
    <div className="space-y-5">
      <PageHeader title="Settings" subtitle="Grouped configuration panels with descriptions and clear save actions." />
      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard title="Configuration">
          <form onSubmit={save} className="space-y-3">
            <Input value={form.key} onChange={(e) => setForm((prev) => ({ ...prev, key: e.target.value }))} placeholder="Setting key" />
            <Input value={form.value} onChange={(e) => setForm((prev) => ({ ...prev, value: e.target.value }))} placeholder="Setting value" />
            <Button type="submit">Save Setting</Button>
          </form>
        </SectionCard>
        <SectionCard title="Guidance">
          <div className="space-y-2 text-sm text-slate-600">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">Use stable keys to avoid accidental configuration drifts.</div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">Verify dependent admin screens after changing commercial values.</div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">Prefer explicit naming for readability in audit and operations.</div>
          </div>
        </SectionCard>
      </div>
      <SectionCard title="Current values">
        <DataTable columns={["Key", "Value", "Updated"]} rows={(data?.settings ?? []).map((s: AdminSetting) => [s.key, String(s.value), new Date(s.updatedAt).toLocaleString()])} />
      </SectionCard>
    </div>
  );
};
