import React from "react";
import { Linking, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button, Text } from "@/components/ui";
import { colors, radius, spacing, shadows } from "@/theme";

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
  reassurance?: string;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  /** When true, primary action opens the system settings app instead of requesting again. */
  showOpenSettings?: boolean;
};

export function PermissionPrimer({
  icon,
  title,
  body,
  reassurance,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  showOpenSettings
}: Props) {
  const handlePrimary = () => {
    if (showOpenSettings) {
      Linking.openSettings().catch(() => undefined);
    } else {
      onPrimary();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={32} color={colors.primary} />
        </View>
        <Text variant="h2" align="center" style={{ marginBottom: spacing.sm }}>
          {title}
        </Text>
        <Text variant="body" muted align="center">
          {body}
        </Text>
        {reassurance ? (
          <View style={styles.reassureRow}>
            <Ionicons name="shield-checkmark" size={14} color={colors.success} />
            <Text variant="caption" muted>
              {reassurance}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.actions}>
        <Button label={primaryLabel} onPress={handlePrimary} fullWidth />
        {secondaryLabel && onSecondary ? (
          <Button label={secondaryLabel} onPress={onSecondary} variant="ghost" fullWidth />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xxl,
    justifyContent: "space-between",
    backgroundColor: colors.background
  },
  card: {
    marginTop: spacing.giant,
    padding: spacing.xl,
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    ...shadows.sm
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg
  },
  reassureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: spacing.md
  },
  actions: { gap: spacing.sm, paddingBottom: spacing.xl }
});
