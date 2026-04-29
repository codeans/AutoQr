package de.autoqr.app

import android.util.Log
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL
import org.json.JSONObject

object NativeCallActionApi {
  private const val TAG = "AutoQrCallActionApi"

  fun postAction(callId: String, action: String, actionToken: String?, reason: String? = null) {
    if (callId.isBlank() || actionToken.isNullOrBlank()) {
      Log.w(TAG, "Skipping native call action without callId/actionToken")
      return
    }

    Thread {
      try {
        val baseUrl = BuildConfig.AUTOQR_API_BASE_URL.trimEnd('/')
        val connection = URL("$baseUrl/calls/$callId/native-action").openConnection() as HttpURLConnection
        val body = JSONObject().apply {
          put("action", action)
          put("actionToken", actionToken)
          put("platform", "android")
          if (!reason.isNullOrBlank()) put("reason", reason)
        }.toString()

        connection.requestMethod = "POST"
        connection.connectTimeout = 5_000
        connection.readTimeout = 5_000
        connection.doOutput = true
        connection.setRequestProperty("Accept", "application/json")
        connection.setRequestProperty("Content-Type", "application/json")
        OutputStreamWriter(connection.outputStream).use { it.write(body) }

        val status = connection.responseCode
        Log.i(TAG, "Native call action $action for $callId returned HTTP $status")
        connection.disconnect()
      } catch (err: Exception) {
        Log.w(TAG, "Native call action $action for $callId failed", err)
      }
    }.start()
  }
}
