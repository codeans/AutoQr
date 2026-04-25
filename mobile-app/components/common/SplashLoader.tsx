import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Defs, G, LinearGradient, Path, Rect, Stop } from "react-native-svg";
import { colors, spacing, typography } from "@/theme";
import { Text } from "@/components/ui";

type SplashLoaderProps = {
  onFinish?: () => void;
  duration?: number;
};

const LOGO_SIZE = 120;
const GLOW_SIZE = 220;

export function SplashLoader({ onFinish, duration = 2600 }: SplashLoaderProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onFinish]);

  return (
    <View style={styles.root}>
      <View style={styles.center}>
        <View style={styles.logoWrap}>
          <View style={styles.glow}>
            <Svg width={GLOW_SIZE} height={GLOW_SIZE} viewBox="0 0 100 100">
              <Defs>
                <LinearGradient id="glowGrad" x1="0" y1="0" x2="1" y2="1">
                  <Stop offset="0" stopColor={colors.primary} stopOpacity="0.28" />
                  <Stop offset="1" stopColor={colors.primary} stopOpacity="0" />
                </LinearGradient>
              </Defs>
              <Rect x="0" y="0" width="100" height="100" rx="50" ry="50" fill="url(#glowGrad)" />
            </Svg>
          </View>

          <View>
            <AutoQrMark size={LOGO_SIZE} />
          </View>
        </View>

        <Text style={styles.title}>AutoQr</Text>
        <Text style={styles.tagline}>Secure Vehicle Contact QR</Text>

        <View style={styles.progressTrack}>
          <View style={styles.progressFill} />
        </View>
      </View>
    </View>
  );
}

function AutoQrMark({ size }: { size: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.28,
        backgroundColor: colors.background,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: colors.primary,
        shadowOpacity: 0.18,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 12 },
        elevation: 8
      }}
    >
      <Svg width={size * 0.72} height={size * 0.72} viewBox="0 0 64 64">
        <Defs>
          <LinearGradient id="qrGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={colors.primary} />
            <Stop offset="1" stopColor={colors.primaryDark} />
          </LinearGradient>
        </Defs>
        <G>
          <Path d="M4 10a6 6 0 0 1 6-6h12v6H10v12H4V10z" fill="url(#qrGrad)" />
          <Path d="M60 10a6 6 0 0 0-6-6H42v6h12v12h6V10z" fill="url(#qrGrad)" />
          <Path d="M4 54a6 6 0 0 0 6 6h12v-6H10V42H4v12z" fill={colors.text} />
          <Rect x="14" y="14" width="14" height="14" rx="3" fill="url(#qrGrad)" />
          <Rect x="36" y="14" width="14" height="14" rx="3" fill={colors.text} />
          <Rect x="14" y="36" width="14" height="14" rx="3" fill={colors.text} />
          <Rect x="36" y="36" width="6" height="6" rx="1.5" fill="url(#qrGrad)" />
          <Rect x="44" y="36" width="6" height="6" rx="1.5" fill={colors.text} />
          <Rect x="36" y="44" width="6" height="6" rx="1.5" fill={colors.text} />
          <Rect x="44" y="44" width="6" height="6" rx="1.5" fill="url(#qrGrad)" />
        </G>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl
  },
  logoWrap: {
    width: GLOW_SIZE,
    height: GLOW_SIZE,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl
  },
  glow: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.85
  },
  title: {
    ...typography.displayLg,
    color: colors.text,
    marginTop: spacing.sm,
    textAlign: "center"
  },
  tagline: {
    ...typography.bodyLg,
    color: colors.textMuted,
    marginTop: spacing.xs,
    textAlign: "center"
  },
  progressTrack: {
    width: 180,
    height: 6,
    borderRadius: 999,
    backgroundColor: colors.border,
    marginTop: spacing.xxl,
    overflow: "hidden",
    opacity: 0.6
  },
  progressFill: {
    width: "72%",
    height: "100%",
    borderRadius: 999,
    backgroundColor: colors.primary
  }
});
