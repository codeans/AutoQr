package de.autoqr.app

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Build
import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import org.json.JSONObject

@Suppress("DEPRECATION")
class AutoQrCallBridgeModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext), LifecycleEventListener {

  private var listenerCount = 0
  private var nativeActionReceiver: BroadcastReceiver? = null

  init {
    instance = this
    reactContext.addLifecycleEventListener(this)
    pendingPayload?.let { payload ->
      pendingPayload = null
      maybeEmit("AutoQrCallBridge:PendingAcceptedCall", payload)
    }
  }

  override fun getName(): String = NAME

  @ReactMethod
  fun addListener(@Suppress("UNUSED_PARAMETER") eventName: String) {
    listenerCount += 1
  }

  @ReactMethod
  fun removeListeners(count: Int) {
    listenerCount = (listenerCount - count).coerceAtLeast(0)
  }

  @ReactMethod
  fun consumePendingAcceptedCall(promise: Promise) {
    try {
      val pending = PendingAcceptedCallStore.consumePending(reactContext)
      promise.resolve(pending?.let { jsonToWritableMap(it.toJson()) })
    } catch (err: Exception) {
      Log.w(TAG, "consumePendingAcceptedCall failed", err)
      promise.reject("CALL_BRIDGE_ERR", err)
    }
  }

  @ReactMethod
  fun peekPendingAcceptedCall(promise: Promise) {
    try {
      val pending = PendingAcceptedCallStore.peekPending(reactContext)
      promise.resolve(pending?.let { jsonToWritableMap(it.toJson()) })
    } catch (err: Exception) {
      promise.reject("CALL_BRIDGE_ERR", err)
    }
  }

  @ReactMethod
  fun clearPendingAcceptedCall(callId: String?, promise: Promise) {
    try {
      if (callId.isNullOrBlank()) {
        PendingAcceptedCallStore.clearPending(reactContext)
      } else {
        PendingAcceptedCallStore.clearPendingForCallId(reactContext, callId)
      }
      promise.resolve(null)
    } catch (err: Exception) {
      promise.reject("CALL_BRIDGE_ERR", err)
    }
  }

  @ReactMethod
  fun markCallHandled(callId: String?, outcome: String?, promise: Promise) {
    try {
      val parsed = HandledCallStore.Outcome.fromRaw(outcome)
      if (callId.isNullOrBlank() || parsed == null) {
        promise.resolve(false)
        return
      }
      HandledCallStore.markHandled(reactContext, callId, parsed)
      promise.resolve(true)
    } catch (err: Exception) {
      promise.reject("CALL_BRIDGE_ERR", err)
    }
  }

  @ReactMethod
  fun isCallHandled(callId: String?, promise: Promise) {
    try {
      promise.resolve(HandledCallStore.isHandled(reactContext, callId))
    } catch (err: Exception) {
      promise.reject("CALL_BRIDGE_ERR", err)
    }
  }

  @ReactMethod
  fun clearHandledCall(callId: String?, promise: Promise) {
    try {
      HandledCallStore.clear(reactContext, callId)
      promise.resolve(null)
    } catch (err: Exception) {
      promise.reject("CALL_BRIDGE_ERR", err)
    }
  }

  override fun onHostResume() {
    registerNativeActionReceiver()
  }

  override fun onHostPause() {
    unregisterNativeActionReceiver()
  }

  override fun onHostDestroy() {
    unregisterNativeActionReceiver()
  }

  @Deprecated("Kept for compatibility with legacy bridge teardown")
  override fun onCatalystInstanceDestroy() {
    @Suppress("DEPRECATION")
    super.onCatalystInstanceDestroy()
    unregisterNativeActionReceiver()
    if (instance === this) instance = null
  }

  private fun registerNativeActionReceiver() {
    if (nativeActionReceiver != null) return
    val filter = IntentFilter().apply {
      addAction(IncomingCallForegroundService.ACTION_NATIVE_ACTION_RESULT)
      addAction(IncomingCallForegroundService.ACTION_CLOSE_INCOMING_UI)
    }
    val receiver = object : BroadcastReceiver() {
      override fun onReceive(context: Context, intent: Intent) {
        when (intent.action) {
          IncomingCallForegroundService.ACTION_NATIVE_ACTION_RESULT -> {
            val payload = Arguments.createMap().apply {
              putString("callId", intent.getStringExtra(IncomingCallForegroundService.EXTRA_CALL_ID))
              putString("action", intent.getStringExtra(IncomingCallForegroundService.EXTRA_NATIVE_ACTION))
              putBoolean("success", intent.getBooleanExtra(IncomingCallForegroundService.EXTRA_NATIVE_ACTION_SUCCESS, false))
              if (intent.hasExtra(IncomingCallForegroundService.EXTRA_NATIVE_ACTION_HTTP_STATUS)) {
                putInt("httpStatus", intent.getIntExtra(IncomingCallForegroundService.EXTRA_NATIVE_ACTION_HTTP_STATUS, -1))
              }
            }
            maybeEmit("AutoQrCallBridge:NativeActionResult", payload)
          }
          IncomingCallForegroundService.ACTION_CLOSE_INCOMING_UI -> {
            val payload = Arguments.createMap().apply {
              putString("callId", intent.getStringExtra(IncomingCallForegroundService.EXTRA_CALL_ID))
              putString("reason", intent.getStringExtra(IncomingCallForegroundService.EXTRA_STOP_REASON))
            }
            maybeEmit("AutoQrCallBridge:IncomingUiClosed", payload)
          }
        }
      }
    }
    nativeActionReceiver = receiver
    val context = reactContext
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      context.registerReceiver(receiver, filter, Context.RECEIVER_NOT_EXPORTED)
    } else {
      @Suppress("UnspecifiedRegisterReceiverFlag")
      context.registerReceiver(receiver, filter)
    }
  }

  private fun unregisterNativeActionReceiver() {
    val receiver = nativeActionReceiver ?: return
    try {
      reactContext.unregisterReceiver(receiver)
    } catch (_: Exception) {
    }
    nativeActionReceiver = null
  }

  private fun maybeEmit(event: String, payload: WritableMap) {
    if (!reactContext.hasActiveCatalystInstance()) return
    reactContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit(event, payload)
  }

  companion object {
    const val NAME = "AutoQrCallBridge"
    private const val TAG = "AutoQrCallBridge"

    @Volatile private var instance: AutoQrCallBridgeModule? = null
    @Volatile private var pendingPayload: WritableMap? = null

    /**
     * Forward a pending-accepted-call event from native to JS. If JS isn't ready yet,
     * the payload is buffered and replayed when the module is constructed.
     */
    @JvmStatic
    fun emitPendingAcceptedCall(json: JSONObject) {
      val payload = jsonToWritableMap(json)
      val current = instance
      if (current == null || !current.reactContext.hasActiveCatalystInstance()) {
        pendingPayload = payload
        return
      }
      current.maybeEmit("AutoQrCallBridge:PendingAcceptedCall", payload)
    }

    private fun jsonToWritableMap(json: JSONObject): WritableMap {
      val map = Arguments.createMap()
      val keys = json.keys()
      while (keys.hasNext()) {
        val key = keys.next()
        when (val value = json.opt(key)) {
          null, JSONObject.NULL -> map.putNull(key)
          is Boolean -> map.putBoolean(key, value)
          is Int -> map.putInt(key, value)
          is Long -> {
            if (value in Int.MIN_VALUE..Int.MAX_VALUE) map.putInt(key, value.toInt())
            else map.putDouble(key, value.toDouble())
          }
          is Double -> map.putDouble(key, value)
          is Float -> map.putDouble(key, value.toDouble())
          is String -> map.putString(key, value)
          else -> map.putString(key, value.toString())
        }
      }
      return map
    }
  }
}
