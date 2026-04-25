import React from "react";
import { StyleSheet, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { ErrorView, Header, Loader, Screen, Text } from "@/components/ui";
import { useContentQuery } from "@/hooks/useContentQuery";
import { formatDate } from "@/utils/format";
import { spacing } from "@/theme";

const titleFor: Record<string, string> = {
  "privacy-policy": "Privacy policy",
  terms: "Terms & conditions",
  "refund-policy": "Refund policy",
  "shipping-policy": "Shipping policy"
};

export function LegalPageScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const resolvedSlug = slug ?? "privacy-policy";
  const { data, isLoading, isError, refetch } = useContentQuery(resolvedSlug);

  const title = data?.title ?? titleFor[resolvedSlug] ?? "Legal";

  return (
    <Screen>
      <Header title={title} />
      {isLoading ? (
        <Loader />
      ) : isError ? (
        <ErrorView onRetry={() => void refetch()} />
      ) : !data ? (
        <Text variant="body" muted>
          Content not available.
        </Text>
      ) : (
        <View style={styles.content}>
          <Text variant="display">{data.title}</Text>
          {data.updatedAt ? (
            <Text variant="small" muted style={{ marginTop: spacing.xs }}>
              Updated {formatDate(data.updatedAt)}
            </Text>
          ) : null}
          <View style={{ marginTop: spacing.xl, gap: spacing.xl }}>
            {(data.sections ?? []).map((section, idx) => (
              <View key={idx}>
                {section.heading ? (
                  <Text variant="h3" style={{ marginBottom: spacing.sm }}>
                    {section.heading}
                  </Text>
                ) : null}
                {section.body ? <Text variant="body">{section.body}</Text> : null}
              </View>
            ))}
          </View>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing.huge }
});
