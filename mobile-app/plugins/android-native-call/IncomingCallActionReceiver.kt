package de.autoqr.app

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

class IncomingCallActionReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    val action = intent.action ?: return
    if (
      action == IncomingCallForegroundService.ACTION_ACCEPT ||
      action == IncomingCallForegroundService.ACTION_DECLINE ||
      action == IncomingCallForegroundService.ACTION_TIMEOUT ||
      action == IncomingCallForegroundService.ACTION_STOP
    ) {
      IncomingCallForegroundService.startServiceWithExtras(context, intent)
    }
  }
}
