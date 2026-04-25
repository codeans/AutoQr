import React from "react";
import { Linking, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card, Header, Screen, Text } from "@/components/ui";
import { colors, radius, spacing } from "@/theme";

export function SupportScreen() {
  const items = [
    {
      icon: "mail-outline" as const,
      label: "Email support",
      description: "support@autoqr.de",
      onPress: () => Linking.openURL("mailto:support@autoqr.de")
    },
    {
      icon: "call-outline" as const,
      label: "Call support",
      description: "Mon–Fri · 9:00 – 18:00 CET",
      onPress: () => Linking.openURL("tel:+4930000000")
    },
    {
      icon: "chatbubbles-outline" as const,
      label: "Help center",
      description: "Guides, FAQ, and troubleshooting",
      onPress: () => Linking.openURL("https://autoqr.de/help")
    }
  ];

  return (
    <Screen>
      <Header title="Help & support" />
      <Text variant="body" muted style={{ marginBottom: spacing.lg }}>
        We're here when you need us.
      </Text>
      <View style={{ gap: spacing.md }}>
        {items.map((item) => (
          <Card key={item.label} onPress={item.onPress} padding="xxl">
            <View style={styles.row}>
              <View style={styles.iconWrap}>
                <Ionicons name={item.icon} size={22} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="bodyMedium">{item.label}</Text>
                <Text variant="small" muted>
                  {item.description}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
            </View>
          </Card>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md
  }
});
