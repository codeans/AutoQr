const fs = require("fs");
const path = require("path");
const {
  AndroidConfig,
  withAndroidManifest,
  withAppBuildGradle,
  withDangerousMod,
  withProjectBuildGradle
} = require("@expo/config-plugins");

const GOOGLE_SERVICES_CLASSPATH = "classpath('com.google.gms:google-services:4.4.4')";
const GOOGLE_SERVICES_PLUGIN = 'apply plugin: "com.google.gms.google-services"';
const FIREBASE_BOM = 'implementation(platform("com.google.firebase:firebase-bom:34.12.0"))';
const FIREBASE_MESSAGING = 'implementation("com.google.firebase:firebase-messaging")';

function addOnce(contents, needle, insertAfter) {
  if (contents.includes(needle)) return contents;
  if (contents.includes(insertAfter)) {
    return contents.replace(insertAfter, `${insertAfter}\n    ${needle}`);
  }
  return `${contents.trimEnd()}\n${needle}\n`;
}

function removeApplicationService(application, serviceName) {
  application.service = (application.service ?? []).filter((service) => service?.$?.["android:name"] !== serviceName);
}

function getServiceSource(packageName) {
  return `package ${packageName}

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Intent
import android.media.AudioAttributes
import android.net.Uri
import android.os.Build
import androidx.core.app.NotificationCompat
import com.google.firebase.messaging.RemoteMessage
import expo.modules.notifications.service.ExpoFirebaseMessagingService

class AutoQrMessagingService : ExpoFirebaseMessagingService() {
  override fun onMessageReceived(remoteMessage: RemoteMessage) {
    val type = remoteMessage.data["type"]
    if (type == "INCOMING_CALL") {
      showIncomingCall(remoteMessage.data)
    } else if (type == "MISSED_CALL" || type == "CALL_ENDED" || type == "call_missed" || type == "call_ended") {
      cancelIncomingCall(remoteMessage.data)
    }
    super.onMessageReceived(remoteMessage)
  }

  private fun showIncomingCall(data: Map<String, String>) {
    val callId = data["callId"] ?: data["uuid"] ?: return
    val callerName = data["callerName"] ?: data["carLabel"] ?: "AutoQr incident call"
    val handle = data["handle"] ?: data["reporterPhone"] ?: data["callerPhone"] ?: "AutoQr caller"
    val notificationManager = getSystemService(NotificationManager::class.java)
    val channelId = "incoming-calls"
    val soundUri = ringtoneUri()

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val channel = NotificationChannel(channelId, "Incoming calls", NotificationManager.IMPORTANCE_MAX).apply {
        description = "Incoming AutoQr incident calls"
        lockscreenVisibility = Notification.VISIBILITY_PUBLIC
        if (soundUri != null) {
          val attrs = AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_NOTIFICATION_RINGTONE)
            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
            .build()
          setSound(soundUri, attrs)
        }
      }
      notificationManager.createNotificationChannel(channel)
    }

    val openCallIntent = Intent(Intent.ACTION_VIEW, Uri.parse("autoqr://calls/incoming/\${Uri.encode(callId)}")).apply {
      setPackage(packageName)
      addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP)
    }
    val acceptIntent = Intent(Intent.ACTION_VIEW, Uri.parse("autoqr://calls/incoming/\${Uri.encode(callId)}?action=accept")).apply {
      setPackage(packageName)
      addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP)
    }
    val declineIntent = Intent(Intent.ACTION_VIEW, Uri.parse("autoqr://calls/incoming/\${Uri.encode(callId)}?action=decline")).apply {
      setPackage(packageName)
      addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP)
    }
    val flags = PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    val fullScreenIntent = PendingIntent.getActivity(this, callId.hashCode(), openCallIntent, flags)
    val acceptPendingIntent = PendingIntent.getActivity(this, callId.hashCode() + 1, acceptIntent, flags)
    val declinePendingIntent = PendingIntent.getActivity(this, callId.hashCode() + 2, declineIntent, flags)
    val smallIcon = resourceId("drawable", "notification_icon").takeIf { it != 0 } ?: applicationInfo.icon

    val notification = NotificationCompat.Builder(this, channelId)
      .setSmallIcon(smallIcon)
      .setContentTitle(callerName)
      .setContentText(handle)
      .setCategory(NotificationCompat.CATEGORY_CALL)
      .setPriority(NotificationCompat.PRIORITY_MAX)
      .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
      .setOngoing(true)
      .setAutoCancel(false)
      .setSound(soundUri)
      .setContentIntent(fullScreenIntent)
      .setFullScreenIntent(fullScreenIntent, true)
      .addAction(0, "Decline", declinePendingIntent)
      .addAction(0, "Accept", acceptPendingIntent)
      .build()

    try {
      notificationManager.notify(callId.hashCode(), notification)
    } catch (_: SecurityException) {
      // Android 13+ may block notification display until POST_NOTIFICATIONS is granted.
    }
  }

  private fun ringtoneUri(): Uri? {
    val id = resourceId("raw", "autoqr_incoming_call")
    return if (id == 0) null else Uri.parse("android.resource://$packageName/$id")
  }

  private fun resourceId(type: String, name: String): Int {
    return resources.getIdentifier(name, type, packageName)
  }
}

  private fun cancelIncomingCall(data: Map<String, String>) {
    val callId = data["callId"] ?: data["uuid"] ?: return
    val notificationManager = getSystemService(NotificationManager::class.java)
    notificationManager.cancel(callId.hashCode())
  }
`;
}

const withAndroidNativeCallFirebase = (config) => {
  const androidPackage = config.android?.package ?? "de.autoqr.app";

  config = withProjectBuildGradle(config, (mod) => {
    mod.modResults.contents = addOnce(
      mod.modResults.contents,
      GOOGLE_SERVICES_CLASSPATH,
      "classpath('com.facebook.react:react-native-gradle-plugin')"
    );
    return mod;
  });

  config = withAppBuildGradle(config, (mod) => {
    let contents = mod.modResults.contents;
    if (!contents.includes(GOOGLE_SERVICES_PLUGIN)) {
      contents = contents.replace('apply plugin: "com.facebook.react"', `apply plugin: "com.facebook.react"\n${GOOGLE_SERVICES_PLUGIN}`);
    }
    if (!contents.includes(FIREBASE_BOM)) {
      contents = contents.replace('implementation("com.facebook.react:react-android")', `implementation("com.facebook.react:react-android")\n    ${FIREBASE_BOM}`);
    }
    if (!contents.includes(FIREBASE_MESSAGING)) {
      contents = contents.replace(FIREBASE_BOM, `${FIREBASE_BOM}\n    ${FIREBASE_MESSAGING}`);
    }
    mod.modResults.contents = contents;
    return mod;
  });

  config = withAndroidManifest(config, (mod) => {
    const manifest = mod.modResults.manifest;
    manifest.$ = manifest.$ ?? {};
    manifest.$["xmlns:tools"] = manifest.$["xmlns:tools"] ?? "http://schemas.android.com/tools";

    const application = AndroidConfig.Manifest.getMainApplicationOrThrow(mod.modResults);
    removeApplicationService(application, "expo.modules.notifications.service.ExpoFirebaseMessagingService");
    removeApplicationService(application, ".AutoQrMessagingService");

    application.service = application.service ?? [];
    application.service.push({
      $: {
        "android:name": "expo.modules.notifications.service.ExpoFirebaseMessagingService",
        "tools:node": "remove"
      }
    });
    application.service.push({
      $: {
        "android:name": ".AutoQrMessagingService",
        "android:exported": "false"
      },
      "intent-filter": [
        {
          $: {
            "android:priority": "10"
          },
          action: [
            {
              $: {
                "android:name": "com.google.firebase.MESSAGING_EVENT"
              }
            }
          ]
        }
      ]
    });

    return mod;
  });

  config = withDangerousMod(config, [
    "android",
    async (mod) => {
      const servicePath = path.join(
        mod.modRequest.platformProjectRoot,
        "app/src/main/java",
        ...androidPackage.split("."),
        "AutoQrMessagingService.kt"
      );
      await fs.promises.mkdir(path.dirname(servicePath), { recursive: true });
      await fs.promises.writeFile(servicePath, getServiceSource(androidPackage));
      return mod;
    }
  ]);

  return config;
};

module.exports = withAndroidNativeCallFirebase;
