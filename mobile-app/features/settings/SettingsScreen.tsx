import React from "react";
import { Alert, Linking, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Avatar, Card, Header, Screen, Text } from "@/components/ui";
import { useAuthStore } from "@/stores/auth.store";
import { useAuthActions } from "@/hooks/useAuthActions";
import { colors, radius, spacing } from "@/theme";
import { currentLocale, LOCALE_LABELS } from "@/i18n";

type Row = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress: () => void;
  danger?: boolean;
};

export function SettingsScreen() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const { logout } = useAuthActions();
  const locale = currentLocale();

  const handleLogout = () => {
    Alert.alert(
      t("settings.signOut") as string,
      t("settings.signOutConfirm") as string,
      [
        { text: t("common.cancel") as string, style: "cancel" },
        {
          text: t("settings.signOut") as string,
          style: "destructive",
          onPress: async () => {
            await logout();
            router.replace("/(auth)/login");
          }
        }
      ]
    );
  };

  const account: Row[] = [
    {
      icon: "person-outline",
      label: t("settings.profile") as string,
      onPress: () => router.push("/settings/profile")
    },
    {
      icon: "lock-closed-outline",
      label: t("settings.changePassword") as string,
      onPress: () => router.push("/settings/password")
    },
    {
      icon: "call-outline",
      label: t("calls.historyTitle") as string,
      onPress: () => router.push("/settings/calls")
    }
  ];

  const preferences: Row[] = [
    {
      icon: "language-outline",
      label: t("settings.language") as string,
      value: LOCALE_LABELS[locale],
      onPress: () => router.push("/settings/language")
    },
    {
      icon: "shield-checkmark-outline",
      label: "App Permissions",
      onPress: () => router.push("/settings/permissions" as never)
    }
  ];

  const legal: Row[] = [
    {
      icon: "document-text-outline",
      label: t("settings.privacy") as string,
      onPress: () => openLegal("privacy-policy")
    },
    {
      icon: "document-text-outline",
      label: t("settings.terms") as string,
      onPress: () => openLegal("terms")
    },
    {
      icon: "document-text-outline",
      label: t("settings.refund") as string,
      onPress: () => openLegal("refund-policy")
    },
    {
      icon: "document-text-outline",
      label: t("settings.shipping") as string,
      onPress: () => openLegal("shipping-policy")
    }
  ];

  const help: Row[] = [
    {
      icon: "help-circle-outline",
      label: t("settings.helpCenter") as string,
      onPress: () => router.push("/settings/support")
    },
    {
      icon: "mail-outline",
      label: t("settings.contactSupport") as string,
      onPress: () => Linking.openURL("mailto:support@autoqr.de").catch(() => undefined)
    }
  ];

  function openLegal(slug: string) {
    router.push({ pathname: "/settings/legal/[slug]", params: { slug } });
  }

  return (
    <Screen>
      <Header title={t("settings.title") as string} showBack={false} />

      <Card>
        <View style={styles.profileRow}>
          <Avatar name={user?.name} size={56} />
          <View style={{ flex: 1, marginLeft: spacing.lg }}>
            <Text variant="h3">{user?.name ?? "—"}</Text>
            <Text variant="small" muted>
              {user?.email}
            </Text>
          </View>
        </View>
      </Card>

      <SectionTitle title={t("settings.account") as string} />
      <SettingsGroup rows={account} />

      <SectionTitle title={t("settings.preferences") as string} />
      <SettingsGroup rows={preferences} />

      <SectionTitle title={t("settings.legal") as string} />
      <SettingsGroup rows={legal} />

      <SectionTitle title={t("settings.support") as string} />
      <SettingsGroup rows={help} />

      <SettingsGroup
        rows={[
          {
            icon: "log-out-outline",
            label: t("settings.signOut") as string,
            onPress: handleLogout,
            danger: true
          }
        ]}
      />
    </Screen>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <Text variant="overline" muted style={styles.sectionTitle}>
      {title}
    </Text>
  );
}

function SettingsGroup({ rows }: { rows: Row[] }) {
  return (
    <Card padding="sm">
      {rows.map((row, idx) => (
        <View key={row.label}>
          <Card
            tone="soft"
            padding="lg"
            onPress={row.onPress}
            style={{ borderWidth: 0, backgroundColor: "transparent" }}
          >
            <View style={styles.row}>
              <View
                style={[
                  styles.iconWrap,
                  row.danger && { backgroundColor: colors.dangerSoft }
                ]}
              >
                <Ionicons
                  name={row.icon}
                  size={20}
                  color={row.danger ? colors.danger : colors.primary}
                />
              </View>
              <Text
                variant="bodyMedium"
                color={row.danger ? colors.danger : colors.text}
                style={{ flex: 1 }}
              >
                {row.label}
              </Text>
              {row.value ? (
                <Text variant="small" muted style={{ marginRight: spacing.sm }}>
                  {row.value}
                </Text>
              ) : null}
              {!row.danger ? (
                <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
              ) : null}
            </View>
          </Card>
          {idx < rows.length - 1 ? <View style={styles.separator} /> : null}
        </View>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  profileRow: { flexDirection: "row", alignItems: "center" },
  sectionTitle: { marginTop: spacing.xl, marginBottom: spacing.sm, marginLeft: spacing.sm },
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
