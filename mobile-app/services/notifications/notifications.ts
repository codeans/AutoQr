export type { PermissionStatus } from "./notificationService";
export {
  configureNotificationChannels as configureAndroidChannels,
  getNotificationPermissionStatus as getPermissionStatus,
  registerExpoPushToken as registerPushToken,
  requestNotificationPermission,
  setBadgeCount,
  showLocalNotification,
  unregisterPushTokenForCurrentDevice
} from "./notificationService";
