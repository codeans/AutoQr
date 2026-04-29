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
        } else {
          Log.i(TAG, "Push received INCOMING_CALL callId=$callId")
          IncomingCallForegroundService.startIncomingCall(this, remoteMessage.data)
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
