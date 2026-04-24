import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Button, Input } from "../../../components/ui";
import { LanguageSwitcher } from "../../../components/marketing/shared/LanguageSwitcher";
import { SectionCard } from "../components/SectionCard";
import { userService } from "../services/user.service";

export const SettingsScreen = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ["user-profile"],
    queryFn: userService.getProfile
  });

  const [notificationPrefs, setNotificationPrefs] = useState({
    incidents: true,
    calls: true,
    orders: true
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

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

  const saveLanguageMutation = useMutation({
    mutationFn: (locale: "de" | "en") => userService.updateLanguage(locale),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    }
  });

  return (
    <div className="space-y-6">
      <SectionCard
        title={t("settings.languageSection") as string}
        subtitle={t("settings.languageHelp") as string}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="max-w-2xl text-sm text-slate-600">
            {t("settings.languageHelp")}
          </p>
          <LanguageSwitcher
            variant="inline"
            onChange={(locale) => saveLanguageMutation.mutate(locale)}
          />
        </div>
      </SectionCard>

      <SectionCard
        title={t("settings.passwordChangeTitle") as string}
        subtitle={t("settings.passwordChangeSubtitle") as string}
      >
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">
            {t("settings.currentPassword")}
            <Input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(event) =>
                setPasswordForm((current) => ({
                  ...current,
                  currentPassword: event.target.value
                }))
              }
              className="mt-1"
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            {t("settings.newPassword")}
            <Input
              type="password"
              value={passwordForm.newPassword}
              onChange={(event) =>
                setPasswordForm((current) => ({
                  ...current,
                  newPassword: event.target.value
                }))
              }
              className="mt-1"
            />
          </label>
          <label className="text-sm font-medium text-slate-700 md:col-span-2">
            {t("settings.confirmPassword")}
            <Input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(event) =>
                setPasswordForm((current) => ({
                  ...current,
                  confirmPassword: event.target.value
                }))
              }
              className="mt-1"
            />
          </label>
          <Button disabled className="md:w-fit">
            {t("settings.passwordUpdateSoon")}
          </Button>
        </div>
      </SectionCard>

      <SectionCard
        title={t("settings.notificationsTitle") as string}
        subtitle={t("settings.notificationsSubtitle") as string}
      >
        <div className="space-y-3">
          {[
            ["incidents", t("settings.prefIncidents")],
            ["calls", t("settings.prefCalls")],
            ["orders", t("settings.prefOrders")]
          ].map(([key, label]) => (
            <label
              key={key}
              className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
            >
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
          <Button
            onClick={() => savePrefsMutation.mutate()}
            disabled={savePrefsMutation.isPending}
          >
            {savePrefsMutation.isPending
              ? (t("settings.saving") as string)
              : (t("settings.savePreferences") as string)}
          </Button>
        </div>
      </SectionCard>

      <SectionCard
        title={t("settings.privacyTitle") as string}
        subtitle={t("settings.privacySubtitle") as string}
      >
        <p className="text-sm text-slate-600">{t("settings.privacyBody")}</p>
      </SectionCard>
    </div>
  );
};
