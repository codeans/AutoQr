import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/ui";
import { colors, radius, spacing } from "@/theme";

export type CallControlsProps = {
  micEnabled: boolean;
  speakerEnabled: boolean;
  onToggleMic: () => void;
  onToggleSpeaker: () => void;
  onKeypadPress?: () => void;
};

export function CallControls({
  micEnabled,
  speakerEnabled,
  onToggleMic,
  onToggleSpeaker,
  onKeypadPress
}: CallControlsProps) {
  return (
    <View style={styles.row}>
      <ControlButton
        icon={micEnabled ? "mic" : "mic-off"}
        label={micEnabled ? "Mute" : "Unmute"}
        active={!micEnabled}
        onPress={onToggleMic}
      />
      <ControlButton
        icon="volume-high"
        label="Speaker"
        active={speakerEnabled}
        onPress={onToggleSpeaker}
      />
      <ControlButton
        icon="keypad"
        label="Keypad"
        disabled={!onKeypadPress}
        onPress={onKeypadPress ?? (() => undefined)}
      />
    </View>
  );
}

function ControlButton({
  icon,
  label,
  active,
  disabled,
  onPress
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [styles.item, pressed && !disabled && { opacity: 0.7 }]}
    >
      <View
        style={[
          styles.circle,
          active && { backgroundColor: colors.primary },
          disabled && { opacity: 0.4 }
        ]}
      >
        <Ionicons name={icon} size={22} color={active ? colors.textInverse : colors.text} />
      </View>
      <Text variant="caption" muted style={{ marginTop: spacing.xs }}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: spacing.xxl
  },
  item: { alignItems: "center" },
  circle: {
    width: 64,
    height: 64,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center"
  }
});
