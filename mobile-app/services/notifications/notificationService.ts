import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { StorageKeys } from "@/constants/storage";
import { secureStorage } from "@/utils/secureStorage";
import { pushTokenService, type PushPlatform } from "@/services/api/pushToken.service";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true
  })
});

export type PermissionStatus = "granted" | "denied" | "undetermined";

export async function getNotificationPermissionStatus(): Promise<PermissionStatus> {
  if (!Device.isDevice) return "denied";
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return "granted";
  if (existing.canAskAgain) return "undetermined";
  return "denied";
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!Device.isDevice) return false;
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;
  if (!existing.canAskAgain) return false;
  const result = await Notifications.requestPermissionsAsync();
  return result.granted;
}

export async function configureNotificationChannels(): Promise<void> {
  if (Platform.OS !== "android") return;

  await Notifications.setNotificationChannelAsync("incoming-calls", {
    name: "Incoming Calls",
    importance: Notifications.AndroidImportance.MAX,
    sound: "autoqr_ringtone.wav",
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    vibrationPattern: [0, 500, 250, 500, 250, 700],
    lightColor: "#1D4ED8",
    bypassDnd: true,
    enableLights: true,
    enableVibrate: true
  });

  await Notifications.setNotificationChannelAsync("calls", {
    name: "Calls",
    importance: Notifications.AndroidImportance.HIGH,
    sound: "default",
    vibrationPattern: [0, 400, 250, 400],
    lightColor: "#1D4ED8",
    enableLights: true,
    enableVibrate: true
  });

  await Notifications.setNotificationChannelAsync("incidents", {
    name: "Incidents",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#1D4ED8",
    enableVibrate: true
  });

  await Notifications.setNotificationChannelAsync("default", {
    name: "General",
    importance: Notifications.AndroidImportance.DEFAULT
  });
}

function resolveProjectId(): string | undefined {
  return (
    (Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined)?.eas?.projectId ??
    Constants.easConfig?.projectId
  );
}

export async function registerExpoPushToken(): Promise<string | null> {
  const granted = await requestNotificationPermission();
  if (!granted) return null;
  await configureNotificationChannels();

  try {
    const projectId = resolveProjectId();
    const token = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
    const tokenValue = token.data;
    if (!tokenValue) return null;

    const platform: PushPlatform =
      Platform.OS === "ios" ? "ios" : Platform.OS === "android" ? "android" : "web";

    const existing = await secureStorage.get(StorageKeys.pushToken);
    try {
      await pushTokenService.register({
        token: tokenValue,
        platform,
        appVersion: Constants.expoConfig?.version ?? ""
      });
    } catch {
      // Token refresh can be retried on next foreground.
    }
    if (existing !== tokenValue) {
      await secureStorage.set(StorageKeys.pushToken, tokenValue);
    }
    return tokenValue;
  } catch {
    return null;
  }
}

export async function unregisterPushTokenForCurrentDevice(): Promise<void> {
  const token = await secureStorage.get(StorageKeys.pushToken);
  if (!token) return;
  try {
    await pushTokenService.unregister(token);
  } catch {
    // Best-effort unregister.
  }
  await secureStorage.remove(StorageKeys.pushToken);
}

export async function showLocalNotification(params: {
  title: string;
  body: string;
  data?: Record<string, unknown>;
  channelId?: "incoming-calls" | "calls" | "incidents" | "default";
  sticky?: boolean;
}): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: params.title,
      body: params.body,
      data: params.data,
      sound: params.channelId === "incoming-calls" ? "autoqr_ringtone.wav" : "default",
      sticky: Boolean(params.sticky)
    },
    trigger:
      Platform.OS === "android" && params.channelId
        ? ({ channelId: params.channelId } as never)
        : null
  });
}

export async function setBadgeCount(count: number): Promise<void> {
  try {
    await Notifications.setBadgeCountAsync(Math.max(0, count));
  } catch {
    // Ignore platform limitations.
  }
}
