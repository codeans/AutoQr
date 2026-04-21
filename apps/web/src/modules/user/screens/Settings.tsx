import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Button, Input } from "../../../components/ui";
import { SectionCard } from "../components/SectionCard";
import { userService } from "../services/user.service";

export const SettingsScreen = () => {
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ["user-profile"],
    queryFn: userService.getProfile
  });

  const [notificationPrefs, setNotificationPrefs] = useState({ incidents: true, calls: true, orders: true });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  useEffect(() => {
    const prefs = data?.user?.notificationPreferences;
    if (!prefs) return;
    setNotificationPrefs({
      incidents: prefs.incidents ?? true,
      calls: prefs.calls ?? true,
      orders: prefs.orders ?? true
    });
  }, [data?.user?.notificationPreferences]);

  const savePrefsMutation = useMutation({
    mutationFn: () => userService.updateProfile({ notificationPreferences: notificationPrefs }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      await queryClient.invalidateQueries({ queryKey: ["user-notifications"] });
    }
  });

  return (
    <div className="space-y-6">
      <SectionCard title="Password change" subtitle="Keep your AutoQr owner account secure with a strong password.">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">
            Current password
            <Input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(event) => setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))}
              className="mt-1"
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            New password
            <Input
              type="password"
              value={passwordForm.newPassword}
              onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))}
              className="mt-1"
            />
          </label>
          <label className="text-sm font-medium text-slate-700 md:col-span-2">
            Confirm password
            <Input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(event) => setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))}
              className="mt-1"
            />
          </label>
          <Button disabled className="md:w-fit">
            Password update coming soon
          </Button>
        </div>
      </SectionCard>

      <SectionCard title="Notification preferences" subtitle="Choose which owner updates should trigger panel notifications.">
        <div className="space-y-3">
          {[
            ["incidents", "Incident alerts"],
            ["calls", "Call request alerts"],
            ["orders", "Payment and shipment updates"]
          ].map(([key, label]) => (
            <label key={key} className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <span className="text-sm font-medium text-slate-700">{label}</span>
              <input
                type="checkbox"
                checked={notificationPrefs[key as keyof typeof notificationPrefs]}
                onChange={(event) =>
                  setNotificationPrefs((current) => ({
                    ...current,
                    [key]: event.target.checked
                  }))
                }
                className="h-4 w-4 rounded border-slate-300"
              />
            </label>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <Button onClick={() => savePrefsMutation.mutate()} disabled={savePrefsMutation.isPending}>
            {savePrefsMutation.isPending ? "Saving..." : "Save preferences"}
          </Button>
        </div>
      </SectionCard>

      <SectionCard title="Privacy and account controls" subtitle="Manage visibility and account controls for owner communication.">
        <p className="text-sm text-slate-600">
          Your contact details are only shared with reporters during approved incident communication. You can request account export or deactivation by contacting support.
        </p>
      </SectionCard>
    </div>
  );
};
