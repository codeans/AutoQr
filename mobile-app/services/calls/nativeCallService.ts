import { Platform } from "react-native";
import type { IncomingCall } from "@/types/call";

/**
 * Native call UI bridge placeholder for future EAS dev client / prebuild integration.
 * Planned adapters:
 * - react-native-callkeep + iOS CallKit
 * - Android Telecom ConnectionService
 */
export const nativeCallService = {
  async showIncomingCall(_incoming: IncomingCall): Promise<boolean> {
    if (Platform.OS === "ios" || Platform.OS === "android") {
      return false;
    }
    return false;
  },
  async endIncomingCall(_callId: string): Promise<void> {
    return;
  }
};
