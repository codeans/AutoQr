import * as Notifications from "expo-notifications";
import { Camera } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import type { PermissionMeta, PermissionState, PermissionStatusMap, TrackedPermission } from "./types";

const REQUIRED_KEYS: TrackedPermission[] = ["notifications", "microphone"];

function mapState(status: string, canAskAgain?: boolean): PermissionState {
  if (status === "granted") return "granted";
  if (status === "undetermined") return "denied";
  if (status === "denied" && canAskAgain === false) return "blocked";
  if (status === "denied") return "denied";
  return "unknown";
}

export const PERMISSION_META: PermissionMeta[] = [
  {
    key: "notifications",
    title: "Notifications",
    shortExplanation: "Receive incoming vehicle calls instantly.",
    whyAutoQrNeedsIt: "Critical incident calls and alerts depend on push notifications in realtime.",
    icon: "notifications-outline",
    requiredForAppAccess: true
  },
  {
    key: "microphone",
    title: "Microphone",
    shortExplanation: "Talk securely with vehicle owners during incidents.",
    whyAutoQrNeedsIt: "Voice communication is a core AutoQr safety feature during active call sessions.",
    icon: "mic-outline",
    requiredForAppAccess: true
  },
  {
    key: "camera",
    title: "Camera",
    shortExplanation: "Upload vehicle and incident images.",
    whyAutoQrNeedsIt: "Camera captures evidence and vehicle details without leaving the app.",
    icon: "camera-outline",
    requiredForAppAccess: false
  },
  {
    key: "mediaLibrary",
    title: "Photos",
    shortExplanation: "Attach damage evidence quickly.",
    whyAutoQrNeedsIt: "Media access allows attaching existing incident photos and proof.",
    icon: "images-outline",
    requiredForAppAccess: false
  },
  {
    key: "storage",
    title: "Storage Access",
    shortExplanation: "Allow safe media file reads when needed.",
    whyAutoQrNeedsIt: "On some Android devices, media access requires storage availability.",
    icon: "folder-open-outline",
    requiredForAppAccess: false
  },
  {
    key: "backgroundRefresh",
    title: "Background App Refresh",
    shortExplanation: "Stay reachable when AutoQr is in the background.",
    whyAutoQrNeedsIt: "Background updates keep call and incident delivery reliable.",
    icon: "refresh-outline",
    requiredForAppAccess: false
  },
  {
    key: "network",
    title: "Network Access",
    shortExplanation: "Maintain secure realtime connection.",
    whyAutoQrNeedsIt: "AutoQr calling, notifications, and QR communication need internet connectivity.",
    icon: "wifi-outline",
    requiredForAppAccess: false
  }
];

export const PERMISSION_REQUEST_ORDER: TrackedPermission[] = [
  "notifications",
  "microphone",
  "camera",
  "mediaLibrary"
];

export const ALL_PERMISSIONS: TrackedPermission[] = [
  "notifications",
  "microphone",
  "camera",
  "mediaLibrary",
  "storage",
  "backgroundRefresh",
  "network"
];

async function getNotificationsState(): Promise<PermissionState> {
  const result = await Notifications.getPermissionsAsync();
  return mapState(result.status, result.canAskAgain);
}

async function requestNotificationsState(): Promise<PermissionState> {
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return "granted";
  if (!existing.canAskAgain) return "blocked";
  const result = await Notifications.requestPermissionsAsync();
  return mapState(result.status, result.canAskAgain);
}

async function getMicrophoneState(): Promise<PermissionState> {
  const result = await Camera.getMicrophonePermissionsAsync();
  return mapState(result.status, result.canAskAgain);
}

async function requestMicrophoneState(): Promise<PermissionState> {
  const existing = await Camera.getMicrophonePermissionsAsync();
  if (existing.granted) return "granted";
  if (!existing.canAskAgain) return "blocked";
  const result = await Camera.requestMicrophonePermissionsAsync();
  return mapState(result.status, result.canAskAgain);
}

async function getCameraState(): Promise<PermissionState> {
  const result = await Camera.getCameraPermissionsAsync();
  return mapState(result.status, result.canAskAgain);
}

async function requestCameraState(): Promise<PermissionState> {
  const existing = await Camera.getCameraPermissionsAsync();
  if (existing.granted) return "granted";
  if (!existing.canAskAgain) return "blocked";
  const result = await Camera.requestCameraPermissionsAsync();
  return mapState(result.status, result.canAskAgain);
}

async function getMediaLibraryState(): Promise<PermissionState> {
  const result = await MediaLibrary.getPermissionsAsync();
  return mapState(result.status, result.canAskAgain);
}

async function requestMediaLibraryState(): Promise<PermissionState> {
  const existing = await MediaLibrary.getPermissionsAsync();
  if (existing.granted) return "granted";
  if (!existing.canAskAgain) return "blocked";
  const result = await MediaLibrary.requestPermissionsAsync();
  return mapState(result.status, result.canAskAgain);
}

export async function getPermissionState(permission: TrackedPermission): Promise<PermissionState> {
  switch (permission) {
    case "notifications":
      return getNotificationsState();
    case "microphone":
      return getMicrophoneState();
    case "camera":
      return getCameraState();
    case "mediaLibrary":
      return getMediaLibraryState();
    case "storage":
    case "backgroundRefresh":
    case "network":
      return "granted";
    default:
      return "unknown";
  }
}

export async function requestPermission(permission: TrackedPermission): Promise<PermissionState> {
  switch (permission) {
    case "notifications":
      return requestNotificationsState();
    case "microphone":
      return requestMicrophoneState();
    case "camera":
      return requestCameraState();
    case "mediaLibrary":
      return requestMediaLibraryState();
    case "storage":
    case "backgroundRefresh":
    case "network":
      return "granted";
    default:
      return "unknown";
  }
}

export async function getAllPermissionStates(): Promise<PermissionStatusMap> {
  const notifications = await getNotificationsState();
  const microphone = await getMicrophoneState();
  const camera = await getCameraState();
  const mediaLibrary = await getMediaLibraryState();

  return {
    notifications,
    microphone,
    camera,
    mediaLibrary,
    storage: "granted",
    backgroundRefresh: "granted",
    network: "granted"
  };
}

export function hasCriticalPermissions(statusMap: PermissionStatusMap): boolean {
  return REQUIRED_KEYS.every((key) => statusMap[key] === "granted");
}

export function isPermissionBlocked(status: PermissionState): boolean {
  return status === "denied" || status === "blocked";
}
