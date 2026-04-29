package de.autoqr.app

import com.google.firebase.messaging.RemoteMessage
import expo.modules.notifications.service.ExpoFirebaseMessagingService

class AutoQrMessagingService : ExpoFirebaseMessagingService() {
  override fun onMessageReceived(remoteMessage: RemoteMessage) {
    val type = remoteMessage.data["type"]
    when (type) {
      "INCOMING_CALL" -> {
        IncomingCallForegroundService.startIncomingCall(this, remoteMessage.data)
      }
      "MISSED_CALL", "CALL_ENDED", "call_missed", "call_ended" -> {
        IncomingCallForegroundService.stopIncomingCall(this, remoteMessage.data["callId"] ?: remoteMessage.data["uuid"])
      }
    }
    super.onMessageReceived(remoteMessage)
  }
}
