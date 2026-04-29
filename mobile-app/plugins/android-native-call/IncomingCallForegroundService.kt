package de.autoqr.app

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.media.AudioAttributes
import android.media.AudioManager
import android.media.MediaPlayer
import android.media.RingtoneManager
import android.net.Uri
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.os.PowerManager
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.util.Log
import androidx.core.app.NotificationCompat
import java.util.concurrent.ConcurrentHashMap

class IncomingCallForegroundService : Service() {
  private val handler = Handler(Looper.getMainLooper())
  private var mediaPlayer: MediaPlayer? = null
  private var wakeLock: PowerManager.WakeLock? = null
  private var activeCallId: String? = null
  private var activeActionToken: String? = null
  private var timeoutRunnable: Runnable? = null

  override fun onBind(intent: Intent?): IBinder? = null

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    when (intent?.action) {
      ACTION_SHOW -> showIncomingCall(intent)
      ACTION_ACCEPT -> acceptCall(intent)
      ACTION_DECLINE -> declineCall(intent)
      ACTION_TIMEOUT -> timeoutCall(intent)
      ACTION_STOP -> stopCall(intent.getStringExtra(EXTRA_CALL_ID), "remote_stop")
      else -> Log.d(TAG, "Ignoring empty incoming call service command")
    }
    return START_NOT_STICKY
  }

  private fun showIncomingCall(intent: Intent) {
    val callId = intent.getStringExtra(EXTRA_CALL_ID) ?: return
    if (wasRecentlyStopped(callId)) {
      Log.i(TAG, "Ignoring stale incoming call alert for recently stopped callId=$callId")
      return
    }

    val duplicate = activeAlertCallId == callId
    if (!duplicate && activeAlertCallId != null) {
      stopCallAlert(activeAlertCallId, "replaced_by_new_call", markStopped = false)
    }

    activeCallId = callId
    activeActionToken = intent.getStringExtra(EXTRA_ACTION_TOKEN)
    createIncomingChannel()
    acquireWakeLock()

    val notification = buildIncomingNotification(intent)
    try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
        startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_PHONE_CALL)
      } else {
        startForeground(NOTIFICATION_ID, notification)
      }
    } catch (err: Exception) {
      Log.w(TAG, "startForeground failed; falling back to notify callId=$callId", err)
      getNotificationManager().notify(NOTIFICATION_ID, notification)
    }

    startCallAlert(callId)
    if (!duplicate) scheduleTimeout(intent)
    Log.i(TAG, "Incoming native call displayed callId=$callId duplicate=$duplicate tokenPresent=${!activeActionToken.isNullOrBlank()}")
  }

  private fun acceptCall(intent: Intent) {
    val callId = intent.getStringExtra(EXTRA_CALL_ID) ?: activeCallId ?: return
    val token = intent.getStringExtra(EXTRA_ACTION_TOKEN) ?: activeActionToken
    stopCallAlert(callId, "accept")
    postNativeActionWithRetry(callId, "accept", token)
    openReactCallScreen(callId, "accept")
    stopSelf()
  }

  private fun declineCall(intent: Intent) {
    val callId = intent.getStringExtra(EXTRA_CALL_ID) ?: activeCallId ?: return
    val token = intent.getStringExtra(EXTRA_ACTION_TOKEN) ?: activeActionToken
    stopCallAlert(callId, "decline")
    postNativeActionWithRetry(callId, "decline", token, "owner_rejected")
    stopSelf()
  }

  private fun timeoutCall(intent: Intent) {
    val callId = intent.getStringExtra(EXTRA_CALL_ID) ?: activeCallId ?: return
    if (activeAlertCallId != callId) {
      Log.i(TAG, "Ignoring timeout for inactive callId=$callId active=$activeAlertCallId")
      return
    }
    val token = intent.getStringExtra(EXTRA_ACTION_TOKEN) ?: activeActionToken
    stopCallAlert(callId, "missed_timeout")
    postNativeActionWithRetry(callId, "missed", token, "timeout")
    showMissedCallNotification(intent)
    stopSelf()
  }

  private fun stopCall(callId: String?, reason: String) {
    if (callId == null || activeCallId == null || callId == activeCallId || callId == activeAlertCallId) {
      stopCallAlert(callId ?: activeCallId, reason)
      stopSelf()
    } else {
      Log.i(TAG, "Ignoring stop for non-active callId=$callId active=$activeCallId alert=$activeAlertCallId")
    }
  }

  private fun buildIncomingNotification(intent: Intent): Notification {
    val callId = intent.getStringExtra(EXTRA_CALL_ID) ?: ""
    val callerName = intent.getStringExtra(EXTRA_CALLER_NAME) ?: "AutoQr incident call"
    val handle = intent.getStringExtra(EXTRA_HANDLE) ?: "Incoming vehicle assistance call"
    val flags = PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    val fullScreenIntent = PendingIntent.getActivity(
      this,
      callId.hashCode(),
      Intent(this, IncomingCallActivity::class.java).apply {
        action = ACTION_SHOW
        putExtras(intent)
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP)
      },
      flags
    )
    val contentIntent = PendingIntent.getActivity(
      this,
      callId.hashCode() + 3,
      reactDeepLinkIntent(callId, null),
      flags
    )
    val acceptIntent = PendingIntent.getBroadcast(
      this,
      callId.hashCode() + 1,
      actionIntent(ACTION_ACCEPT, intent, IncomingCallActionReceiver::class.java),
      flags
    )
    val declineIntent = PendingIntent.getBroadcast(
      this,
      callId.hashCode() + 2,
      actionIntent(ACTION_DECLINE, intent, IncomingCallActionReceiver::class.java),
      flags
    )

    return NotificationCompat.Builder(this, INCOMING_CHANNEL_ID)
      .setSmallIcon(smallIcon())
      .setContentTitle(callerName)
      .setContentText(handle)
      .setCategory(NotificationCompat.CATEGORY_CALL)
      .setPriority(NotificationCompat.PRIORITY_MAX)
      .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
      .setOngoing(true)
      .setAutoCancel(false)
      .setOnlyAlertOnce(true)
      .setSound(ringtoneUri())
      .setVibrate(VIBRATION_PATTERN)
      .setContentIntent(contentIntent)
      .setFullScreenIntent(fullScreenIntent, true)
      .addAction(0, "Decline", declineIntent)
      .addAction(0, "Accept", acceptIntent)
      .build()
  }

  private fun showMissedCallNotification(intent: Intent) {
    createMissedChannel()
    val callId = intent.getStringExtra(EXTRA_CALL_ID) ?: return
    val callerName = intent.getStringExtra(EXTRA_CALLER_NAME) ?: "AutoQr incident call"
    val flags = PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    val contentIntent = PendingIntent.getActivity(
      this,
      callId.hashCode() + 4,
      Intent(Intent.ACTION_VIEW, Uri.parse("autoqr://call/history")).apply {
        setPackage(packageName)
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP)
      },
      flags
    )
    val notification = NotificationCompat.Builder(this, MISSED_CHANNEL_ID)
      .setSmallIcon(smallIcon())
      .setContentTitle("Missed incident call")
      .setContentText(callerName)
      .setCategory(NotificationCompat.CATEGORY_CALL)
      .setPriority(NotificationCompat.PRIORITY_HIGH)
      .setAutoCancel(true)
      .setContentIntent(contentIntent)
      .build()
    getNotificationManager().notify(callId.hashCode() + MISSED_NOTIFICATION_OFFSET, notification)
  }

  private fun scheduleTimeout(intent: Intent) {
    timeoutRunnable?.let { handler.removeCallbacks(it) }
    timeoutRunnable = Runnable {
      actionIntent(ACTION_TIMEOUT, intent, IncomingCallForegroundService::class.java).also {
        startServiceWithExtras(this, it)
      }
    }
    handler.postDelayed(timeoutRunnable!!, RINGING_TIMEOUT_MS)
  }

  private fun startCallAlert(callId: String) {
    if (activeAlertCallId == callId && (mediaPlayer?.isPlaying == true || isVibrating)) {
      Log.i(TAG, "Call alert already active callId=$callId")
      return
    }
    if (activeAlertCallId != null && activeAlertCallId != callId) {
      stopCallAlert(activeAlertCallId, "start_new_call", markStopped = false)
    }

    activeAlertCallId = callId
    val ringerMode = try {
      getSystemService(AudioManager::class.java).ringerMode
    } catch (_: Exception) {
      AudioManager.RINGER_MODE_NORMAL
    }

    if (ringerMode == AudioManager.RINGER_MODE_NORMAL) {
      startRingtone(callId)
    } else {
      Log.i(TAG, "Skipping ringtone due to ringerMode=$ringerMode callId=$callId")
    }

    if (ringerMode != AudioManager.RINGER_MODE_SILENT) {
      startVibration(callId)
    } else {
      Log.i(TAG, "Skipping vibration due to silent mode callId=$callId")
    }
    Log.i(TAG, "Call alert started callId=$callId ringtone=${mediaPlayer?.isPlaying == true} vibrating=$isVibrating")
  }

  private fun startRingtone(callId: String) {
    try {
      releaseMediaPlayer()
      val attrs = AudioAttributes.Builder()
        .setUsage(AudioAttributes.USAGE_NOTIFICATION_RINGTONE)
        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
        .build()
      mediaPlayer = MediaPlayer().apply {
        setAudioAttributes(attrs)
        setDataSource(this@IncomingCallForegroundService, ringtoneUri())
        isLooping = true
        prepare()
        start()
      }
      Log.i(TAG, "Ringtone started callId=$callId uri=${ringtoneUri()}")
    } catch (err: Exception) {
      Log.w(TAG, "Unable to start ringtone callId=$callId", err)
      releaseMediaPlayer()
    }
  }

  private fun startVibration(callId: String) {
    try {
      val vibrator = vibrator()
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        vibrator.vibrate(VibrationEffect.createWaveform(VIBRATION_PATTERN, 0))
      } else {
        @Suppress("DEPRECATION")
        vibrator.vibrate(VIBRATION_PATTERN, 0)
      }
      isVibrating = true
      Log.i(TAG, "Vibration started callId=$callId")
    } catch (err: Exception) {
      isVibrating = false
      Log.w(TAG, "Unable to start vibration callId=$callId", err)
    }
  }

  private fun stopCallAlert(callId: String?, reason: String, markStopped: Boolean = true) {
    val targetCallId = callId ?: activeAlertCallId ?: activeCallId
    timeoutRunnable?.let { handler.removeCallbacks(it) }
    timeoutRunnable = null
    releaseMediaPlayer()
    try {
      vibrator().cancel()
    } catch (err: Exception) {
      Log.w(TAG, "Unable to cancel vibration callId=$targetCallId", err)
    }
    isVibrating = false
    if (markStopped && !targetCallId.isNullOrBlank()) rememberStopped(targetCallId)
    if (targetCallId == null || targetCallId == activeAlertCallId) activeAlertCallId = null
    if (targetCallId == null || targetCallId == activeCallId) {
      activeCallId = null
      activeActionToken = null
    }
    getNotificationManager().cancel(NOTIFICATION_ID)
    if (!targetCallId.isNullOrBlank()) {
      getNotificationManager().cancel(targetCallId.hashCode())
      broadcastCallUiClose(targetCallId, reason)
    }
    try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
        stopForeground(STOP_FOREGROUND_REMOVE)
      } else {
        @Suppress("DEPRECATION")
        stopForeground(true)
      }
    } catch (_: Exception) {
    }
    releaseWakeLock()
    Log.i(TAG, "Call alert stopped callId=$targetCallId reason=$reason")
  }

  private fun releaseMediaPlayer() {
    val player = mediaPlayer ?: return
    try {
      if (player.isPlaying) player.stop()
    } catch (_: Exception) {
    }
    try {
      player.release()
    } catch (_: Exception) {
    }
    mediaPlayer = null
  }

  private fun postNativeActionWithRetry(callId: String, action: String, actionToken: String?, reason: String? = null) {
    NativeCallActionApi.postAction(callId, action, actionToken, reason) { success, httpStatus ->
      Log.i(TAG, "Native action result callId=$callId action=$action success=$success httpStatus=$httpStatus")
      broadcastNativeActionResult(callId, action, success, httpStatus)
    }
  }

  private fun broadcastNativeActionResult(callId: String, action: String, success: Boolean, httpStatus: Int?) {
    sendBroadcast(Intent(ACTION_NATIVE_ACTION_RESULT).apply {
      setPackage(packageName)
      putExtra(EXTRA_CALL_ID, callId)
      putExtra(EXTRA_NATIVE_ACTION, action)
      putExtra(EXTRA_NATIVE_ACTION_SUCCESS, success)
      if (httpStatus != null) putExtra(EXTRA_NATIVE_ACTION_HTTP_STATUS, httpStatus)
    })
  }

  private fun broadcastCallUiClose(callId: String, reason: String) {
    sendBroadcast(Intent(ACTION_CLOSE_INCOMING_UI).apply {
      setPackage(packageName)
      putExtra(EXTRA_CALL_ID, callId)
      putExtra(EXTRA_STOP_REASON, reason)
    })
  }

  private fun openReactCallScreen(callId: String, action: String) {
    startActivity(reactDeepLinkIntent(callId, action))
  }

  private fun reactDeepLinkIntent(callId: String, action: String?): Intent {
    val suffix = if (action.isNullOrBlank()) "" else "?action=$action&nativeAction=pending"
    return Intent(Intent.ACTION_VIEW, Uri.parse("autoqr://calls/incoming/${Uri.encode(callId)}$suffix")).apply {
      setPackage(packageName)
      addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP)
    }
  }

  private fun acquireWakeLock() {
    try {
      releaseWakeLock()
      val pm = getSystemService(Context.POWER_SERVICE) as PowerManager
      wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "$packageName:incoming-call").apply {
        setReferenceCounted(false)
        acquire(RINGING_TIMEOUT_MS + 5_000)
      }
    } catch (err: Exception) {
      Log.w(TAG, "Unable to acquire wake lock", err)
    }
  }

  private fun releaseWakeLock() {
    try {
      if (wakeLock?.isHeld == true) wakeLock?.release()
    } catch (_: Exception) {
    }
    wakeLock = null
  }

  private fun createIncomingChannel() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
    val attrs = AudioAttributes.Builder()
      .setUsage(AudioAttributes.USAGE_NOTIFICATION_RINGTONE)
      .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
      .build()
    val channel = NotificationChannel(INCOMING_CHANNEL_ID, "Incoming calls", NotificationManager.IMPORTANCE_HIGH).apply {
      description = "Incoming AutoQr vehicle assistance calls"
      lockscreenVisibility = Notification.VISIBILITY_PUBLIC
      enableVibration(true)
      vibrationPattern = VIBRATION_PATTERN
      setSound(ringtoneUri(), attrs)
    }
    getNotificationManager().createNotificationChannel(channel)
  }

  private fun createMissedChannel() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
    val channel = NotificationChannel(MISSED_CHANNEL_ID, "Call alerts", NotificationManager.IMPORTANCE_HIGH).apply {
      description = "Missed AutoQr incident calls"
      lockscreenVisibility = Notification.VISIBILITY_PUBLIC
    }
    getNotificationManager().createNotificationChannel(channel)
  }

  private fun ringtoneUri(): Uri {
    val id = resources.getIdentifier("autoqr_incoming_call", "raw", packageName)
    return if (id == 0) RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE) else Uri.parse("android.resource://$packageName/$id")
  }

  private fun smallIcon(): Int =
    resources.getIdentifier("notification_icon", "drawable", packageName).takeIf { it != 0 } ?: applicationInfo.icon

  private fun vibrator(): Vibrator =
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
      val manager = getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
      manager.defaultVibrator
    } else {
      @Suppress("DEPRECATION")
      getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
    }

  private fun getNotificationManager(): NotificationManager = getSystemService(NotificationManager::class.java)

  override fun onDestroy() {
    stopCallAlert(activeCallId ?: activeAlertCallId, "service_destroyed")
    super.onDestroy()
  }

  companion object {
    const val ACTION_SHOW = "de.autoqr.app.action.SHOW_INCOMING_CALL"
    const val ACTION_ACCEPT = "de.autoqr.app.action.ACCEPT_CALL"
    const val ACTION_DECLINE = "de.autoqr.app.action.DECLINE_CALL"
    const val ACTION_TIMEOUT = "de.autoqr.app.action.TIMEOUT_CALL"
    const val ACTION_STOP = "de.autoqr.app.action.STOP_CALL"
    const val ACTION_CLOSE_INCOMING_UI = "de.autoqr.app.action.CLOSE_INCOMING_CALL_UI"
    const val ACTION_NATIVE_ACTION_RESULT = "de.autoqr.app.action.NATIVE_CALL_ACTION_RESULT"
    const val EXTRA_CALL_ID = "callId"
    const val EXTRA_CALLER_NAME = "callerName"
    const val EXTRA_HANDLE = "handle"
    const val EXTRA_ACTION_TOKEN = "callActionToken"
    const val EXTRA_STOP_REASON = "stopReason"
    const val EXTRA_NATIVE_ACTION = "nativeAction"
    const val EXTRA_NATIVE_ACTION_SUCCESS = "nativeActionSuccess"
    const val EXTRA_NATIVE_ACTION_HTTP_STATUS = "nativeActionHttpStatus"
    private const val TAG = "AutoQrIncomingCall"
    private const val INCOMING_CHANNEL_ID = "incoming-calls-autoqr-v2"
    private const val MISSED_CHANNEL_ID = "calls"
    private const val NOTIFICATION_ID = 62471
    private const val MISSED_NOTIFICATION_OFFSET = 50_000
    private const val RINGING_TIMEOUT_MS = 45_000L
    private const val STOPPED_CALL_TTL_MS = 10 * 60_000L
    private val VIBRATION_PATTERN = longArrayOf(0, 900, 700, 900, 700)
    @Volatile private var activeAlertCallId: String? = null
    @Volatile private var isVibrating = false
    private val stoppedCallIds = ConcurrentHashMap<String, Long>()

    private fun pruneStopped() {
      val now = System.currentTimeMillis()
      stoppedCallIds.entries.removeIf { now - it.value > STOPPED_CALL_TTL_MS }
    }

    private fun rememberStopped(callId: String) {
      pruneStopped()
      stoppedCallIds[callId] = System.currentTimeMillis()
    }

    private fun wasRecentlyStopped(callId: String): Boolean {
      pruneStopped()
      return stoppedCallIds.containsKey(callId)
    }

    fun startIncomingCall(context: Context, data: Map<String, String>) {
      val callId = data["callId"] ?: data["uuid"] ?: return
      val intent = Intent(context, IncomingCallForegroundService::class.java).apply {
        action = ACTION_SHOW
        putExtra(EXTRA_CALL_ID, callId)
        putExtra(EXTRA_CALLER_NAME, data["callerName"] ?: data["carLabel"] ?: "AutoQr incident call")
        putExtra(EXTRA_HANDLE, data["handle"] ?: data["reporterPhoneMasked"] ?: data["reporterPhone"] ?: data["callerPhone"] ?: "Incoming vehicle assistance call")
        putExtra(EXTRA_ACTION_TOKEN, data["callActionToken"])
        data.forEach { (key, value) -> putExtra(key, value) }
      }
      startServiceWithExtras(context, intent)
    }

    fun stopIncomingCall(context: Context, callId: String?) {
      val intent = Intent(context, IncomingCallForegroundService::class.java).apply {
        action = ACTION_STOP
        putExtra(EXTRA_CALL_ID, callId)
      }
      startServiceWithExtras(context, intent)
    }

    fun startServiceWithExtras(context: Context, source: Intent) {
      val serviceIntent = Intent(context, IncomingCallForegroundService::class.java).apply {
        action = source.action
        putExtras(source)
      }
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        context.startForegroundService(serviceIntent)
      } else {
        context.startService(serviceIntent)
      }
    }

    fun actionIntent(actionName: String, source: Intent, target: Class<*>): Intent =
      Intent(source).apply {
        setClassName(BuildConfig.APPLICATION_ID, target.name)
        setPackage(null)
        action = actionName
      }
  }
}
