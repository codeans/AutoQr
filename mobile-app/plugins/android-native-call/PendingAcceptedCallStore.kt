package de.autoqr.app

import android.content.Context
import android.content.SharedPreferences
import android.util.Log
import org.json.JSONObject

/**
 * Persistent storage for the most recent call that the user accepted from a native
 * surface (lock-screen activity, full-screen notification or notification action).
 *
 * The state is consumed by the React Native layer once the JS app boots. Until the JS
 * layer drains it via `consumePendingAcceptedCall`, the data survives process kills,
 * so a cold-start launch can still re-enter the active call screen.
 */
object PendingAcceptedCallStore {
  private const val TAG = "AutoQrPendingCall"
  private const val PREFS = "autoqr.pendingAcceptedCall"
  private const val KEY_CALL_ID = "callId"
  private const val KEY_CALLER_NAME = "callerName"
  private const val KEY_HANDLE = "handle"
  private const val KEY_ACTION_TOKEN = "callActionToken"
  private const val KEY_INCIDENT_ID = "incidentId"
  private const val KEY_CARS_LABEL = "carLabel"
  private const val KEY_REPORTER_PHONE = "reporterPhone"
  private const val KEY_ACCEPTED_AT = "acceptedAt"
  private const val KEY_SOURCE = "source"
  private const val KEY_SHOULD_OPEN = "shouldOpenCallScreen"
  private const val KEY_AGORA_APP_ID = "agoraAppId"
  private const val KEY_AGORA_TOKEN = "agoraToken"
  private const val KEY_AGORA_CHANNEL_NAME = "agoraChannelName"
  private const val KEY_AGORA_UID = "agoraUid"
  private const val KEY_AGORA_ROLE = "agoraRole"
  private const val KEY_AGORA_EXPIRES_AT = "agoraExpiresAt"
  private const val KEY_AGORA_EXPIRES_IN_SECONDS = "agoraExpiresInSeconds"
  private const val MAX_AGE_MS = 5 * 60_000L

  data class PendingCall(
    val callId: String,
    val callerName: String?,
    val handle: String?,
    val actionToken: String?,
    val incidentId: String?,
    val carLabel: String?,
    val reporterPhone: String?,
    val acceptedAt: Long,
    val source: String,
    val shouldOpenCallScreen: Boolean,
    val agoraAppId: String?,
    val agoraToken: String?,
    val agoraChannelName: String?,
    val agoraUid: String?,
    val agoraRole: String?,
    val agoraExpiresAt: String?,
    val agoraExpiresInSeconds: String?
  ) {
    fun toJson(): JSONObject = JSONObject().apply {
      put("callId", callId)
      put("callerName", callerName ?: "")
      put("handle", handle ?: "")
      put("callActionToken", actionToken ?: "")
      put("incidentId", incidentId ?: "")
      put("carLabel", carLabel ?: "")
      put("reporterPhone", reporterPhone ?: "")
      put("acceptedAt", acceptedAt)
      put("source", source)
      put("shouldOpenCallScreen", shouldOpenCallScreen)
      put("agoraAppId", agoraAppId ?: "")
      put("agoraToken", agoraToken ?: "")
      put("agoraChannelName", agoraChannelName ?: "")
      put("channelName", agoraChannelName ?: "")
      put("agoraUid", agoraUid ?: "")
      put("agoraRole", agoraRole ?: "")
      put("agoraExpiresAt", agoraExpiresAt ?: "")
      put("agoraExpiresInSeconds", agoraExpiresInSeconds ?: "")
    }
  }

  private fun prefs(context: Context): SharedPreferences =
    context.applicationContext.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

  fun savePending(
    context: Context,
    callId: String,
    callerName: String?,
    handle: String?,
    actionToken: String?,
    incidentId: String? = null,
    carLabel: String? = null,
    reporterPhone: String? = null,
    source: String = "unknown",
    shouldOpenCallScreen: Boolean = true,
    agoraAppId: String? = null,
    agoraToken: String? = null,
    agoraChannelName: String? = null,
    agoraUid: String? = null,
    agoraRole: String? = null,
    agoraExpiresAt: String? = null,
    agoraExpiresInSeconds: String? = null
  ) {
    if (callId.isBlank()) return
    val acceptedAt = System.currentTimeMillis()
    prefs(context).edit()
      .putString(KEY_CALL_ID, callId)
      .putString(KEY_CALLER_NAME, callerName)
      .putString(KEY_HANDLE, handle)
      .putString(KEY_ACTION_TOKEN, actionToken)
      .putString(KEY_INCIDENT_ID, incidentId)
      .putString(KEY_CARS_LABEL, carLabel)
      .putString(KEY_REPORTER_PHONE, reporterPhone)
      .putLong(KEY_ACCEPTED_AT, acceptedAt)
      .putString(KEY_SOURCE, source)
      .putBoolean(KEY_SHOULD_OPEN, shouldOpenCallScreen)
      .putString(KEY_AGORA_APP_ID, agoraAppId)
      .putString(KEY_AGORA_TOKEN, agoraToken)
      .putString(KEY_AGORA_CHANNEL_NAME, agoraChannelName)
      .putString(KEY_AGORA_UID, agoraUid)
      .putString(KEY_AGORA_ROLE, agoraRole)
      .putString(KEY_AGORA_EXPIRES_AT, agoraExpiresAt)
      .putString(KEY_AGORA_EXPIRES_IN_SECONDS, agoraExpiresInSeconds)
      .apply()
    Log.i(TAG, "Saved pending accepted call callId=$callId source=$source")
  }

  fun peekPending(context: Context): PendingCall? {
    val store = prefs(context)
    val callId = store.getString(KEY_CALL_ID, null)?.takeIf { it.isNotBlank() } ?: return null
    val acceptedAt = store.getLong(KEY_ACCEPTED_AT, 0L)
    if (acceptedAt > 0 && System.currentTimeMillis() - acceptedAt > MAX_AGE_MS) {
      clearPending(context)
      return null
    }
    return PendingCall(
      callId = callId,
      callerName = store.getString(KEY_CALLER_NAME, null),
      handle = store.getString(KEY_HANDLE, null),
      actionToken = store.getString(KEY_ACTION_TOKEN, null),
      incidentId = store.getString(KEY_INCIDENT_ID, null),
      carLabel = store.getString(KEY_CARS_LABEL, null),
      reporterPhone = store.getString(KEY_REPORTER_PHONE, null),
      acceptedAt = acceptedAt,
      source = store.getString(KEY_SOURCE, "unknown") ?: "unknown",
      shouldOpenCallScreen = store.getBoolean(KEY_SHOULD_OPEN, true),
      agoraAppId = store.getString(KEY_AGORA_APP_ID, null),
      agoraToken = store.getString(KEY_AGORA_TOKEN, null),
      agoraChannelName = store.getString(KEY_AGORA_CHANNEL_NAME, null),
      agoraUid = store.getString(KEY_AGORA_UID, null),
      agoraRole = store.getString(KEY_AGORA_ROLE, null),
      agoraExpiresAt = store.getString(KEY_AGORA_EXPIRES_AT, null),
      agoraExpiresInSeconds = store.getString(KEY_AGORA_EXPIRES_IN_SECONDS, null)
    )
  }

  fun consumePending(context: Context): PendingCall? {
    val current = peekPending(context) ?: return null
    clearPending(context)
    Log.i(TAG, "Consumed pending accepted call callId=${current.callId} source=${current.source}")
    return current
  }

  fun clearPending(context: Context) {
    prefs(context).edit().clear().apply()
  }

  fun clearPendingForCallId(context: Context, callId: String?) {
    if (callId.isNullOrBlank()) return
    val current = peekPending(context) ?: return
    if (current.callId == callId) clearPending(context)
  }
}
