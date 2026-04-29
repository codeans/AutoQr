import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useCallStore } from "@/stores/call.store";
import { useCallActions } from "@/hooks/useCallActions";
import { Text } from "@/components/ui";
import { Avatar } from "@/components/ui/Avatar";
import { colors, radius, spacing } from "@/theme";
import { formatDuration, maskPhone } from "@/utils/format";
import { agoraVoiceService } from "@/services/agora/agoraVoiceService";
import { CallControls } from "@/features/calls/CallControls";
import { callAlertService } from "@/services/calls/callAlertService";
import { inCallService } from "@/services/calls/inCallService";

export function ActiveCallScreen() {
  const incoming = useCallStore((s) => s.incoming);
  const status = useCallStore((s) => s.status);
  const micEnabled = useCallStore((s) => s.micEnabled);
  const speakerEnabled = useCallStore((s) => s.speakerEnabled);
  const toggleMic = useCallStore((s) => s.toggleMic);
  const toggleSpeaker = useCallStore((s) => s.toggleSpeaker);
  const startedAt = useCallStore((s) => s.startedAt);
  const markConnected = useCallStore((s) => s.markConnected);
  const { end } = useCallActions();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    agoraVoiceService.toggleMute(micEnabled);
  }, [micEnabled]);

  useEffect(() => {
    agoraVoiceService.toggleSpeaker(speakerEnabled);
    inCallService.setSpeakerMode(speakerEnabled);
  }, [speakerEnabled]);

  useEffect(() => {
    if (status === "active") {
      inCallService.startInCallMode(speakerEnabled);
      return;
    }
    if (status === "idle" || status === "ended" || status === "missed" || status === "declined" || status === "failed") {
      inCallService.stopInCallMode();
    }
  }, [status]);

  useEffect(() => {
    // When the signalling says we've started, reflect that immediately so the timer begins.
    if (status === "active" && !startedAt) {
      markConnected();
    }
  }, [status, startedAt, markConnected]);

  useEffect(() => {
    if (!startedAt) return;
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startedAt]);

  useEffect(() => {
    if (status === "idle" || status === "ended" || status === "missed" || status === "declined") {
      void callAlertService.cleanupCallAlerts();
      if (router.canGoBack()) router.back();
      else router.replace("/(tabs)/dashboard");
    }
  }, [status]);

  useEffect(() => {
    if (status === "connecting" || status === "active") {
      void callAlertService.cleanupCallAlerts();
    }
  }, [status]);

  useEffect(() => {
    return () => {
      inCallService.cleanupInCallMode();
      void callAlertService.cleanupCallAlerts();
    };
  }, []);

  const connectionLabel = (() => {
    if (status === "connecting") return "Connecting…";
    if (status === "active") return formatDuration(elapsed);
    if (status === "failed") return "Call failed";
    if (status === "ended") return "Call ended";
    return "Connecting…";
  })();

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar style="dark" />
      <View style={styles.top}>
        <Text variant="overline" style={{ color: colors.primary }}>
          {connectionLabel.toUpperCase()}
        </Text>
        <Text variant="display" align="center" style={{ marginTop: spacing.xs }}>
          {maskPhone(incoming?.reporterPhone)}
        </Text>
        <Text variant="body" muted align="center" style={{ marginTop: spacing.xs }}>
          {incoming?.carLabel ?? "Incident call"}
        </Text>
      </View>

      <View style={styles.center}>
        <Avatar name={incoming?.reporterName ?? undefined} size={140} />
        {incoming?.message ? (
          <View style={styles.messageBox}>
            <Ionicons name="chatbubble-ellipses" size={14} color={colors.primary} />
            <Text variant="small" align="center" style={{ flex: 1 }} numberOfLines={3}>
              {incoming.message}
            </Text>
          </View>
        ) : null}
        {incoming?.imageCount && incoming.imageCount > 0 ? (
          <View style={styles.evidenceRow}>
            <Ionicons name="image-outline" size={14} color={colors.textSubtle} />
            <Text variant="caption" muted>
              {incoming.imageCount} photo{incoming.imageCount === 1 ? "" : "s"} on the incident
            </Text>
          </View>
        ) : null}
      </View>

      <CallControls
        micEnabled={micEnabled}
        speakerEnabled={speakerEnabled}
        onToggleMic={toggleMic}
        onToggleSpeaker={toggleSpeaker}
      />
      <Text variant="caption" muted align="center" style={{ marginBottom: spacing.lg }}>
        Audio route: {speakerEnabled ? "Speaker" : "Earpiece"}
      </Text>

      <View style={styles.endWrap}>
        <Pressable onPress={end} hitSlop={12} style={styles.endCircle}>
          <Ionicons
            name="call"
            size={30}
            color={colors.textInverse}
            style={{ transform: [{ rotate: "135deg" }] }}
          />
        </Pressable>
        <Text variant="smallMedium" style={{ marginTop: spacing.sm }} align="center">
          End call
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xxl
  },
  top: { alignItems: "center", paddingTop: spacing.huge },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.lg },
  messageBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.xl,
    maxWidth: 320
  },
  evidenceRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  endWrap: { alignItems: "center", paddingBottom: spacing.xl },
  endCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.danger,
    alignItems: "center",
    justifyContent: "center"
  }
});
