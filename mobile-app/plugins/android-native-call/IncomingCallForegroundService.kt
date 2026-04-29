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
import android.media.Ringtone
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

class IncomingCallForegroundService : Service() {
  private val handler = Handler(Looper.getMainLooper())
  private var ringtone: Ringtone? = null
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
      ACTION_STOP -> stopCall(intent.getStringExtra(EXTRA_CALL_ID))
      else -> Log.d(TAG, "Ignoring empty incoming call service command")
    }
    return START_NOT_STICKY
  }

  private fun showIncomingCall(intent: Intent) {
    val callId = intent.getStringExtra(EXTRA_CALL_ID) ?: return
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
      Log.w(TAG, "startForeground failed; falling back to notify", err)
      getNotificationManager().notify(NOTIFICATION_ID, notification)
    }

    startRinging()
    scheduleTimeout(intent)
    Log.i(TAG, "Incoming native call displayed: $callId")
  }

  private fun acceptCall(intent: Intent) {
    val callId = intent.getStringExtra(EXTRA_CALL_ID) ?: activeCallId ?: return
    NativeCallActionApi.postAction(callId, "accept", intent.getStringExtra(EXTRA_ACTION_TOKEN) ?: activeActionToken)
    stopRingingAndNotification()
    openReactCallScreen(callId, "accept")
    stopSelf()
  }

  private fun declineCall(intent: Intent) {
    val callId = intent.getStringExtra(EXTRA_CALL_ID) ?: activeCallId ?: return
    NativeCallActionApi.postAction(callId, "decline", intent.getStringExtra(EXTRA_ACTION_TOKEN) ?: activeActionToken, "owner_rejected")
    stopRingingAndNotification()
    stopSelf()
  }

  private fun timeoutCall(intent: Intent) {
    val callId = intent.getStringExtra(EXTRA_CALL_ID) ?: activeCallId ?: return
    NativeCallActionApi.postAction(callId, "missed", intent.getStringExtra(EXTRA_ACTION_TOKEN) ?: activeActionToken, "timeout")
    stopRingingAndNotification()
    showMissedCallNotification(intent)
    stopSelf()
  }

  private fun stopCall(callId: String?) {
    if (callId == null || activeCallId == null || callId == activeCallId) {
      stopRingingAndNotification()
      stopSelf()
    }
  }

  private fun buildIncomingNotification(intent: Intent): Notification {
    val callId = intent.getStringExtra(EXTRA_CALL_ID) ?: ""
    val callerName = intent.getStringExtra(EXTRA_CALLER_NAME) ?: "AutoQr incident call"
    val handle = intent.getStringExtra(EXTRA_HANDLE) ?: "AutoQr caller"
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
      .setOnlyAlertOnce(false)
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

  private fun startRinging() {
    try {
      if (ringtone?.isPlaying == true) return
      val attrs = AudioAttributes.Builder()
        .setUsage(AudioAttributes.USAGE_NOTIFICATION_RINGTONE)
        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
        .build()
      ringtone = RingtoneManager.getRingtone(this, ringtoneUri()).apply {
        audioAttributes = attrs
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) isLooping = true
        play()
      }
    } catch (err: Exception) {
      Log.w(TAG, "Unable to start ringtone", err)
    }

    try {
      val vibrator = vibrator()
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        vibrator.vibrate(VibrationEffect.createWaveform(VIBRATION_PATTERN, 0))
      } else {
        @Suppress("DEPRECATION")
        vibrator.vibrate(VIBRATION_PATTERN, 0)
      }
    } catch (err: Exception) {
      Log.w(TAG, "Unable to start vibration", err)
    }
  }

  private fun stopRingingAndNotification() {
    timeoutRunnable?.let { handler.removeCallbacks(it) }
    timeoutRunnable = null
    try {
      ringtone?.stop()
    } catch (_: Exception) {
    }
    ringtone = null
    try {
      vibrator().cancel()
    } catch (_: Exception) {
    }
    getNotificationManager().cancel(NOTIFICATION_ID)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
      stopForeground(STOP_FOREGROUND_REMOVE)
    } else {
      @Suppress("DEPRECATION")
      stopForeground(true)
    }
    releaseWakeLock()
  }

  private fun openReactCallScreen(callId: String, action: String) {
    startActivity(reactDeepLinkIntent(callId, action))
  }

  private fun reactDeepLinkIntent(callId: String, action: String?): Intent {
    val suffix = if (action.isNullOrBlank()) "" else "?action=$action"
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
      description = "Incoming AutoQr incident calls"
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
    val id = resources.getIdentifier("autoqr_ringtone", "raw", packageName)
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
    stopRingingAndNotification()
    super.onDestroy()
  }

  companion object {
    const val ACTION_SHOW = "de.autoqr.app.action.SHOW_INCOMING_CALL"
    const val ACTION_ACCEPT = "de.autoqr.app.action.ACCEPT_CALL"
    const val ACTION_DECLINE = "de.autoqr.app.action.DECLINE_CALL"
    const val ACTION_TIMEOUT = "de.autoqr.app.action.TIMEOUT_CALL"
    const val ACTION_STOP = "de.autoqr.app.action.STOP_CALL"
    const val EXTRA_CALL_ID = "callId"
    const val EXTRA_CALLER_NAME = "callerName"
    const val EXTRA_HANDLE = "handle"
    const val EXTRA_ACTION_TOKEN = "callActionToken"
    private const val TAG = "AutoQrIncomingCall"
    private const val INCOMING_CHANNEL_ID = "incoming-calls"
    private const val MISSED_CHANNEL_ID = "calls"
    private const val NOTIFICATION_ID = 62471
    private const val MISSED_NOTIFICATION_OFFSET = 50_000
    private const val RINGING_TIMEOUT_MS = 45_000L
    private val VIBRATION_PATTERN = longArrayOf(0, 900, 700, 900, 700)

    fun startIncomingCall(context: Context, data: Map<String, String>) {
      val callId = data["callId"] ?: data["uuid"] ?: return
      val intent = Intent(context, IncomingCallForegroundService::class.java).apply {
        action = ACTION_SHOW
        putExtra(EXTRA_CALL_ID, callId)
        putExtra(EXTRA_CALLER_NAME, data["callerName"] ?: data["carLabel"] ?: "AutoQr incident call")
        putExtra(EXTRA_HANDLE, data["handle"] ?: data["reporterPhoneMasked"] ?: data["reporterPhone"] ?: data["callerPhone"] ?: "AutoQr caller")
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
