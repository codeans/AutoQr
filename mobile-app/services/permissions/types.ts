export type PermissionState = "unknown" | "granted" | "denied" | "blocked" | "pending";

export type TrackedPermission =
  | "notifications"
  | "microphone"
  | "camera"
  | "mediaLibrary"
  | "storage"
  | "backgroundRefresh"
  | "network";

export type PermissionStatusMap = Record<TrackedPermission, PermissionState>;

export type PermissionMeta = {
  key: TrackedPermission;
  title: string;
  shortExplanation: string;
  whyAutoQrNeedsIt: string;
  icon: string;
  requiredForAppAccess: boolean;
};
