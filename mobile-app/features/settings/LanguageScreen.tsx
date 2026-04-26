import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Card, Header, Screen, Text } from "@/components/ui";
import { useAppStore } from "@/stores/app.store";
import { useAuthStore } from "@/stores/auth.store";
import { colors, radius, spacing } from "@/theme";
import {
  currentLocale,
  LOCALE_LABELS,
  SUPPORTED_LOCALES,
  setLocale,
  type Locale
} from "@/i18n";
import { UserApi } from "@/services/api";

export function LanguageScreen() {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<Locale>(currentLocale());
  const [pending, setPending] = useState<Locale | null>(null);
  const pushToast = useAppStore((s) => s.pushToast);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const onPick = async (locale: Locale) => {
    if (locale === selected) return;
    setPending(locale);
    try {
      await setLocale(locale);
      setSelected(locale);
      if (user) {
        try {
          const updated = await UserApi.updateLanguage(locale);
          if (setUser) setUser(updated);
        } catch {
          /* silently ignore — local change already applied */
        }
      }
      pushToast({ title: t("settings.languageChanged") as string, tone: "success" });
    } catch {
      pushToast({
        title: t("common.errorGeneric") as string,
        tone: "danger"
      });
    } finally {
      setPending(null);
    }
  };

  return (
    <Screen>
      <Header title={t("settings.language") as string} />
      <Text variant="small" muted style={{ marginBottom: spacing.md, paddingHorizontal: spacing.sm }}>
        {t("settings.languageHelp")}
      </Text>
      <Card padding="sm">
        {SUPPORTED_LOCALES.map((locale, idx) => {
          const active = locale === selected;
          return (
            <View key={locale}>
              <Card
                tone="soft"
                padding="lg"
                onPress={() => onPick(locale)}
                style={{ borderWidth: 0, backgroundColor: "transparent" }}
              >
                <View style={styles.row}>
                  <View style={styles.iconWrap}>
                    <Ionicons name="globe-outline" size={20} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text variant="bodyMedium" color={colors.text}>
                      {LOCALE_LABELS[locale]}
                    </Text>
                    <Text variant="small" muted>
                      {locale.toUpperCase()}
                    </Text>
                  </View>
                  {pending === locale ? (
                    <Text variant="small" muted>
                      {t("common.saving")}
                    </Text>
                  ) : active ? (
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                  ) : null}
                </View>
              </Card>
              {idx < SUPPORTED_LOCALES.length - 1 ? <View style={styles.separator} /> : null}
            </View>
          );
        })}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md
  },
  separator: { height: 1, backgroundColor: colors.border, marginHorizontal: spacing.md }
});
