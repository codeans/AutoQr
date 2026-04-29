package de.autoqr.app

import android.util.Log
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL
import org.json.JSONObject

object NativeCallActionApi {
  private const val TAG = "AutoQrCallActionApi"
  private const val MAX_ATTEMPTS = 3

  fun postAction(
    callId: String,
    action: String,
    actionToken: String?,
    reason: String? = null,
    callback: ((success: Boolean, httpStatus: Int?) -> Unit)? = null
  ) {
    if (callId.isBlank() || actionToken.isNullOrBlank()) {
      Log.w(TAG, "Skipping native call action without callId/actionToken")
      callback?.invoke(false, null)
      return
    }

    Thread {
      var lastStatus: Int? = null
      var success = false

      for (attempt in 1..MAX_ATTEMPTS) {
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

          lastStatus = connection.responseCode
          success = lastStatus in 200..299
          Log.i(TAG, "Native call action $action for $callId attempt=$attempt returned HTTP $lastStatus")
          connection.disconnect()
          if (success) break
        } catch (err: Exception) {
          Log.w(TAG, "Native call action $action for $callId failed attempt=$attempt", err)
        }

        if (attempt < MAX_ATTEMPTS) {
          try {
            Thread.sleep(700L * attempt)
          } catch (_: InterruptedException) {
            Thread.currentThread().interrupt()
            break
          }
        }
      }
      callback?.invoke(success, lastStatus)
    }.start()
  }
}
