package de.autoqr.app

import android.util.Log
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL
import org.json.JSONObject

object NativeCallActionApi {
  private const val TAG = "AutoQrCallActionApi"
  private const val MAX_ATTEMPTS = 3
  private const val STATE_MAX_ATTEMPTS = 2

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

  fun fetchState(
    callId: String,
    actionToken: String?,
    callback: (shouldRing: Boolean?, status: String?, httpStatus: Int?) -> Unit
  ) {
    if (callId.isBlank() || actionToken.isNullOrBlank()) {
      callback(null, null, null)
      return
    }

    Thread {
      var httpStatus: Int? = null
      var status: String? = null
      var shouldRing: Boolean? = null

      for (attempt in 1..STATE_MAX_ATTEMPTS) {
        try {
          val baseUrl = BuildConfig.AUTOQR_API_BASE_URL.trimEnd('/')
          val connection = URL("$baseUrl/calls/$callId/native-state").openConnection() as HttpURLConnection
          val body = JSONObject().apply {
            put("actionToken", actionToken)
          }.toString()

          connection.requestMethod = "POST"
          connection.connectTimeout = 4_000
          connection.readTimeout = 4_000
          connection.doOutput = true
          connection.setRequestProperty("Accept", "application/json")
          connection.setRequestProperty("Content-Type", "application/json")
          OutputStreamWriter(connection.outputStream).use { it.write(body) }

          httpStatus = connection.responseCode
          if (httpStatus in 200..299) {
            val response = try {
              (connection.inputStream.bufferedReader().use { it.readText() }).takeIf { it.isNotBlank() }
            } catch (_: Exception) {
              null
            }
            if (!response.isNullOrBlank()) {
              val json = JSONObject(response)
              val call = json.optJSONObject("call")
              status = call?.optString("status", null)
              if (call != null && call.has("shouldRing")) {
                shouldRing = call.optBoolean("shouldRing")
              }
            }
            connection.disconnect()
            break
          }
          connection.disconnect()
        } catch (err: Exception) {
          Log.w(TAG, "Native call state fetch failed callId=$callId attempt=$attempt", err)
        }

        if (attempt < STATE_MAX_ATTEMPTS) {
          try {
            Thread.sleep(400L * attempt)
          } catch (_: InterruptedException) {
            Thread.currentThread().interrupt()
            break
          }
        }
      }

      callback(shouldRing, status, httpStatus)
    }.start()
  }
}
