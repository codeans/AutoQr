import { AppState, type AppStateStatus, Platform, Vibration } from "react-native";
import { Audio, type AVPlaybackStatus } from "expo-av";

const VIBRATION_PATTERN = [0, 450, 220, 450, 220, 650];
const RINGTONE_ASSET = require("@/assets/sounds/autoqr_incoming_call.mp3");

let ringtone: Audio.Sound | null = null;
let ringtoneLoadingPromise: Promise<void> | null = null;
let vibrationInterval: ReturnType<typeof setInterval> | null = null;
let appStateSub: { remove: () => void } | null = null;
let appState: AppStateStatus = AppState.currentState;
let isRingtonePlaying = false;
let isVibrating = false;

async function ensureAudioMode(): Promise<void> {
  await Audio.setAudioModeAsync({
    playsInSilentModeIOS: true,
    allowsRecordingIOS: false,
    staysActiveInBackground: false,
    shouldDuckAndroid: false,
    playThroughEarpieceAndroid: false
  });
}

function ensureAppStateWatcher(): void {
  if (appStateSub) return;
  appStateSub = AppState.addEventListener("change", (nextState) => {
    appState = nextState;
    if (nextState !== "active") {
      void callAlertService.cleanupCallAlerts();
    }
  });
}

async function ensureRingtoneLoaded(): Promise<void> {
  if (ringtone) return;
  if (ringtoneLoadingPromise) {
    await ringtoneLoadingPromise;
    return;
  }

  ringtoneLoadingPromise = (async () => {
    const created = await Audio.Sound.createAsync(
      RINGTONE_ASSET,
      {
        isLooping: true,
        volume: 1,
        shouldPlay: false,
        progressUpdateIntervalMillis: 300
      },
      (status: AVPlaybackStatus) => {
        if (!status.isLoaded) {
          if (status.error) isRingtonePlaying = false;
          return;
        }
        isRingtonePlaying = status.isPlaying;
      }
    );
    ringtone = created.sound;
  })();

  try {
    await ringtoneLoadingPromise;
  } finally {
    ringtoneLoadingPromise = null;
  }
}

export const callAlertService = {
  async startIncomingCallAlerts(): Promise<void> {
    ensureAppStateWatcher();
    await this.startRingtone();
    this.startVibration();
  },

  async stopIncomingCallAlerts(): Promise<void> {
    await this.stopRingtone();
    this.stopVibration();
  },

  async startRingtone(): Promise<void> {
    ensureAppStateWatcher();
    if (appState !== "active") return;
    await ensureAudioMode();
    await ensureRingtoneLoaded();
    if (!ringtone || isRingtonePlaying) return;
    try {
      await ringtone.playAsync();
      isRingtonePlaying = true;
    } catch {
      isRingtonePlaying = false;
    }
  },

  async stopRingtone(): Promise<void> {
    if (!ringtone) {
      isRingtonePlaying = false;
      return;
    }
    try {
      await ringtone.stopAsync();
      await ringtone.setPositionAsync(0);
    } catch {
      // ignore audio stop errors; we still reset flags below
    } finally {
      isRingtonePlaying = false;
    }
  },

  startVibration(): void {
    ensureAppStateWatcher();
    if (appState !== "active" || isVibrating) return;
    isVibrating = true;
    Vibration.cancel();
    Vibration.vibrate(VIBRATION_PATTERN);
    vibrationInterval = setInterval(() => {
      if (appState !== "active") return;
      Vibration.cancel();
      Vibration.vibrate(VIBRATION_PATTERN);
    }, 2000);
  },

  stopVibration(): void {
    if (vibrationInterval) {
      clearInterval(vibrationInterval);
      vibrationInterval = null;
    }
    isVibrating = false;
    Vibration.cancel();
  },

  async cleanupCallAlerts(): Promise<void> {
    await this.stopRingtone();
    this.stopVibration();
  },

  async teardown(): Promise<void> {
    await this.cleanupCallAlerts();
    if (ringtone) {
      try {
        await ringtone.unloadAsync();
      } catch {
        // ignore unload errors
      } finally {
        ringtone = null;
      }
    }
    if (appStateSub) {
      appStateSub.remove();
      appStateSub = null;
    }
  },

  getState(): { isRingtonePlaying: boolean; isVibrating: boolean } {
    return { isRingtonePlaying, isVibrating };
  }
};

// Android incoming call UX is usually both vibration and ringtone.
export const SHOULD_VIBRATE_FOR_INCOMING_CALL = Platform.OS !== "web";
