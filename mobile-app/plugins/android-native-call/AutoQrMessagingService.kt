package de.autoqr.app

import android.util.Log
import com.google.firebase.messaging.RemoteMessage
import expo.modules.notifications.service.ExpoFirebaseMessagingService

class AutoQrMessagingService : ExpoFirebaseMessagingService() {
  override fun onMessageReceived(remoteMessage: RemoteMessage) {
    val type = remoteMessage.data["type"]
    val callId = remoteMessage.data["callId"] ?: remoteMessage.data["uuid"]
    when (type) {
      "INCOMING_CALL" -> {
        if (HandledCallStore.isHandled(this, callId)) {
          val outcome = HandledCallStore.outcomeFor(this, callId)?.raw ?: "handled"
          Log.i(TAG, "Ignoring duplicate INCOMING_CALL push callId=$callId outcome=$outcome")
        } else if (callId.isNullOrBlank()) {
          Log.w(TAG, "Ignoring INCOMING_CALL without callId")
        } else {
          val actionToken = remoteMessage.data["callActionToken"]
          NativeCallActionApi.fetchState(callId, actionToken) { shouldRing, status, _ ->
            val allowByStatus = status == null || status.equals("ringing", ignoreCase = true)
            val allowRing = (shouldRing ?: allowByStatus) && allowByStatus
            if (!allowRing) {
              val outcome = when (status?.lowercase()) {
                "accepted" -> HandledCallStore.Outcome.ACCEPTED
                "declined" -> HandledCallStore.Outcome.DECLINED
                "missed" -> HandledCallStore.Outcome.MISSED
                else -> HandledCallStore.Outcome.ENDED
              }
              HandledCallStore.markHandled(this, callId, outcome)
              IncomingCallForegroundService.stopIncomingCall(this, callId)
              Log.i(TAG, "Ignoring INCOMING_CALL after backend status check callId=$callId status=$status shouldRing=$shouldRing")
            } else {
              Log.i(TAG, "Push received INCOMING_CALL callId=$callId status=$status shouldRing=$shouldRing")
              IncomingCallForegroundService.startIncomingCall(this, remoteMessage.data)
            }
          }
        }
      }
      "CALL_ACCEPTED", "MISSED_CALL", "CALL_ENDED", "call_missed", "call_ended" -> {
        if (!callId.isNullOrBlank()) {
          val outcome = when {
            type.equals("CALL_ACCEPTED", true) -> HandledCallStore.Outcome.ACCEPTED
            type.equals("MISSED_CALL", true) || type.equals("call_missed", true) -> HandledCallStore.Outcome.MISSED
            else -> HandledCallStore.Outcome.ENDED
          }
          HandledCallStore.markHandled(this, callId, outcome)
          if (outcome != HandledCallStore.Outcome.ACCEPTED) {
            PendingAcceptedCallStore.clearPendingForCallId(this, callId)
          }
        }
        IncomingCallForegroundService.stopIncomingCall(this, callId)
      }
    }
    super.onMessageReceived(remoteMessage)
  }

  companion object {
    private const val TAG = "AutoQrMessaging"
  }
}
