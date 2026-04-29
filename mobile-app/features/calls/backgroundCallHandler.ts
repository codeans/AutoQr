import type { IncomingCall } from "@/types/call";
import { registerFCMToken, routeIncomingCallNotification, handleKilledAppLaunch } from "@/services/notifications/fcmService";
import { handleIncomingCall, stopIncomingCallAlerting } from "@/features/calls/incomingCallNotificationHandler";
import { nativeCallService } from "@/services/calls/nativeCallService";
import { callsService } from "@/services/api/calls.service";

export async function registerDeviceForCalls(): Promise<void> {
  await nativeCallService.setupNativeCalling();
  await registerFCMToken();
}

export async function handleForegroundIncomingCall(incoming: Partial<IncomingCall> & { callId: string }): Promise<void> {
  await handleIncomingCall(incoming);
}

export async function handleBackgroundIncomingCall(payload: Record<string, unknown>): Promise<void> {
  await routeIncomingCallNotification(payload);
}

export async function handleKilledAppIncomingCall(): Promise<void> {
  await handleKilledAppLaunch();
}

export async function showNativeIncomingCall(incoming: IncomingCall): Promise<boolean> {
  return nativeCallService.showIncomingCall(incoming);
}

export async function answerIncomingCall(callId: string): Promise<void> {
  nativeCallService.answerIncomingCall(callId);
}

export async function declineIncomingCall(callId: string, reason = "owner_rejected"): Promise<void> {
  await callsService.decline(callId, reason).catch(() => undefined);
  nativeCallService.rejectIncomingCall(callId);
}

export async function cleanupIncomingCall(callId?: string): Promise<void> {
  if (callId) {
    await nativeCallService.endIncomingCall(callId);
  }
  await stopIncomingCallAlerting();
}
