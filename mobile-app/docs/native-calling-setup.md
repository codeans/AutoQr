# AutoQr Native Calling Setup (24/7 Incoming)

This app now uses a native-first incoming call path:

- Socket event (fast path when app is foreground/connected)
- FCM high-priority data push (Android, foreground/background/killed)
- APNs VoIP push + CallKeep/CallKit-ready flow (iOS)
- Native full-screen incoming call notification on Android

## Required Runtime

- Use `expo prebuild` + EAS Dev Client / production builds.
- Do not use Expo Go for call validation.

## Android Native Requirements

- FCM data payload with `type=INCOMING_CALL` and `priority=high`
- Notification channel `incoming-calls-autoqr-v2` with high importance
- Category `CALL`, full-screen intent, ringtone, vibration
- Accept/Decline actions routed through `IncomingCallForegroundService` before React Native opens

Manifest/runtime permissions in `app.json`:

- `POST_NOTIFICATIONS`
- `RECORD_AUDIO`
- `VIBRATE`
- `WAKE_LOCK`
- `USE_FULL_SCREEN_INTENT`
- `FOREGROUND_SERVICE`
- `FOREGROUND_SERVICE_MICROPHONE`

## Android Ringtone

The native Android incoming-call service uses:

- Source asset: `mobile-app/assets/sounds/autoqr_incoming_call.wav`
- Android raw resource: `mobile-app/android/app/src/main/res/raw/autoqr_incoming_call.wav`
- Notification channel: `incoming-calls-autoqr-v2`
- Audio usage: `AudioAttributes.USAGE_NOTIFICATION_RINGTONE`

The config plugin copies the WAV asset into `res/raw` during prebuild, so the app does not fall back to a random/default ringtone after regeneration. Android notification channel sound is sticky once a channel is created; changing the sound again requires a new channel id or clearing the app's notification channel settings on the device.

## iOS CallKit / VoIP Setup

Apple Developer capabilities must be enabled on the app identifier:

1. Push Notifications
2. Background Modes: `Voice over IP`, `Remote notifications`

Certificates/keys required on backend:

- APNs VoIP key (`APN_VOIP_KEY` or `APN_VOIP_KEY_BASE64`)
- `APN_KEY_ID`
- `APN_TEAM_ID`
- `APN_VOIP_TOPIC` (defaults to `<bundle-id>.voip`)

## Backend Payload Contract

Send this data in both socket and push payloads:

```json
{
  "type": "INCOMING_CALL",
  "callId": "...",
  "incidentId": "...",
  "vehicleId": "...",
  "vehiclePlate": "...",
  "callerPhone": "...",
  "agoraChannel": "...",
  "createdAt": "...",
  "expiresAt": "..."
}
```

## Real Device Validation

Run on a physical Android device with a native build:

1. App open -> incoming call rings.
2. App in background -> incoming call rings.
3. App killed -> full-screen incoming call shown.
4. Phone locked -> call alert wakes screen and is visible.
5. Accept -> app opens call screen and joins Agora.
6. Decline -> reporter sees declined state.
7. No answer (45s) -> missed state + call UI dismissed.
8. Ringtone/vibration stop on accept/decline/timeout.

For iOS, validate with TestFlight or signed dev build after enabling VoIP/CallKit entitlements.
