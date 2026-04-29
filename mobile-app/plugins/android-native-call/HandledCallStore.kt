package de.autoqr.app

import android.content.Context
import android.content.SharedPreferences
import android.util.Log
import org.json.JSONObject

/**
 * Tracks call IDs that have already been finalized locally (accepted, declined, missed,
 * ended). Once a callId is here, any new INCOMING_CALL push or socket event for the
 * same call must be ignored so that we never ring a second time after the user has
 * already acted.
 *
 * Backed by SharedPreferences so the cache survives kill/restart for a short TTL.
 */
object HandledCallStore {
  private const val TAG = "AutoQrHandledCalls"
  private const val PREFS = "autoqr.handledCalls"
  private const val MAX_AGE_MS = 10 * 60_000L
  private const val MAX_ENTRIES = 64

  enum class Outcome(val raw: String) {
    ACCEPTED("accepted"),
    DECLINED("declined"),
    MISSED("missed"),
    ENDED("ended");

    companion object {
      fun fromRaw(raw: String?): Outcome? =
        values().firstOrNull { it.raw.equals(raw, ignoreCase = true) }
    }
  }

  data class Entry(val outcome: Outcome, val timestamp: Long)

  private fun prefs(context: Context): SharedPreferences =
    context.applicationContext.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

  private fun pruneAndLoad(context: Context): MutableMap<String, Entry> {
    val store = prefs(context)
    val all = store.all
    val now = System.currentTimeMillis()
    val map = mutableMapOf<String, Entry>()
    for ((key, value) in all) {
      val raw = value as? String ?: continue
      val parsed = runCatching { JSONObject(raw) }.getOrNull() ?: continue
      val ts = parsed.optLong("ts", 0L)
      val outcome = Outcome.fromRaw(parsed.optString("outcome").takeIf { it.isNotBlank() })
      if (ts <= 0L || outcome == null || now - ts > MAX_AGE_MS) continue
      map[key] = Entry(outcome, ts)
    }
    if (map.size != all.size) {
      val editor = store.edit().clear()
      for ((key, entry) in map) {
        editor.putString(key, JSONObject().apply {
          put("outcome", entry.outcome.raw)
          put("ts", entry.timestamp)
        }.toString())
      }
      editor.apply()
    }
    return map
  }

  fun markHandled(context: Context, callId: String, outcome: Outcome) {
    if (callId.isBlank()) return
    val map = pruneAndLoad(context)
    map[callId] = Entry(outcome, System.currentTimeMillis())
    if (map.size > MAX_ENTRIES) {
      val sorted = map.entries.sortedBy { it.value.timestamp }
      val toRemove = sorted.take(map.size - MAX_ENTRIES)
      for (entry in toRemove) map.remove(entry.key)
    }
    val editor = prefs(context).edit().clear()
    for ((key, entry) in map) {
      editor.putString(key, JSONObject().apply {
        put("outcome", entry.outcome.raw)
        put("ts", entry.timestamp)
      }.toString())
    }
    editor.apply()
    Log.i(TAG, "Marked call handled callId=$callId outcome=${outcome.raw}")
  }

  fun isHandled(context: Context, callId: String?): Boolean {
    if (callId.isNullOrBlank()) return false
    return pruneAndLoad(context).containsKey(callId)
  }

  fun outcomeFor(context: Context, callId: String?): Outcome? {
    if (callId.isNullOrBlank()) return null
    return pruneAndLoad(context)[callId]?.outcome
  }

  fun clear(context: Context, callId: String? = null) {
    if (callId.isNullOrBlank()) {
      prefs(context).edit().clear().apply()
      return
    }
    val map = pruneAndLoad(context)
    if (map.remove(callId) != null) {
      val editor = prefs(context).edit().clear()
      for ((key, entry) in map) {
        editor.putString(key, JSONObject().apply {
          put("outcome", entry.outcome.raw)
          put("ts", entry.timestamp)
        }.toString())
      }
      editor.apply()
    }
  }
}
