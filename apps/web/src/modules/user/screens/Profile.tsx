import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Button, Input, Textarea } from "../../../components/ui";
import { LoadingState } from "../components/LoadingState";
import { SectionCard } from "../components/SectionCard";
import { userService } from "../services/user.service";

export const ProfileScreen = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["user-profile"],
    queryFn: userService.getProfile
  });

  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });

  useEffect(() => {
    if (!data?.user) return;
    setForm({
      name: data.user.name ?? "",
      email: data.user.email ?? "",
      phone: data.user.phone ?? "",
      address: data.user.address ?? ""
    });
  }, [data?.user]);

  const updateMutation = useMutation({
    mutationFn: async () => userService.updateProfile({ name: form.name, phone: form.phone, address: form.address }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      await queryClient.invalidateQueries({ queryKey: ["user-dashboard"] });
    }
  });

  if (isLoading) return <LoadingState rows={5} />;

  return (
    <div className="space-y-6">
      <SectionCard title="Profile details" subtitle="Manage contact details and ownership information for faster incident response.">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">
            Name
            <Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className="mt-1" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Email
            <Input value={form.email} disabled className="mt-1" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Phone
            <Input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} className="mt-1" />
          </label>
          <label className="text-sm font-medium text-slate-700 md:col-span-2">
            Address
            <Textarea value={form.address} onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))} className="mt-1" />
          </label>
          <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending} className="md:w-fit">
            {updateMutation.isPending ? "Saving..." : "Save profile"}
          </Button>
        </div>
      </SectionCard>

      <SectionCard title="Ownership verification" subtitle="Uploaded ownership metadata and linked vehicle records are used for incident trust flow.">
        <p className="text-sm text-slate-600">
          Ownership verification data is linked automatically with your registered vehicles/items and order details to support secure communication during incidents.
        </p>
      </SectionCard>
    </div>
  );
};
