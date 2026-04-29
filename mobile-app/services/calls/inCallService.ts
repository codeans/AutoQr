import Constants from "expo-constants";

type InCallManagerModule = {
  start: (options?: { media?: "audio" | "video"; auto?: boolean; ringback?: string }) => void;
  stop: (options?: { busytone?: string }) => void;
  setKeepScreenOn: (enabled: boolean) => void;
  setSpeakerphoneOn: (enabled: boolean) => void;
  setForceSpeakerphoneOn?: (enabled: boolean | null) => void;
};

let inCallManagerModule: InCallManagerModule | null | undefined;
let inCallModeActive = false;
let speakerEnabled = false;

function getInCallManager(): InCallManagerModule | null {
  if (inCallManagerModule !== undefined) return inCallManagerModule;
  if (Constants.appOwnership === "expo") {
    inCallManagerModule = null;
    return null;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    inCallManagerModule = require("react-native-incall-manager").default as InCallManagerModule;
  } catch {
    inCallManagerModule = null;
  }
  return inCallManagerModule;
}

function applyProximityForCurrentRoute(module: InCallManagerModule): void {
  if (!inCallModeActive) return;
  if (speakerEnabled) {
    module.setKeepScreenOn(true);
    return;
  }
  module.setKeepScreenOn(false);
}

export const inCallService = {
  startInCallMode(initialSpeakerEnabled = false): void {
    const manager = getInCallManager();
    if (!manager) return;
    speakerEnabled = initialSpeakerEnabled;
    inCallModeActive = true;
    manager.start({ media: "audio" });
    manager.setSpeakerphoneOn(initialSpeakerEnabled);
    manager.setForceSpeakerphoneOn?.(initialSpeakerEnabled ? true : false);
    applyProximityForCurrentRoute(manager);
  },

  stopInCallMode(): void {
    const manager = getInCallManager();
    if (!manager) return;
    inCallModeActive = false;
    manager.setKeepScreenOn(true);
    manager.setForceSpeakerphoneOn?.(null);
    manager.stop();
  },

  setSpeakerMode(enabled: boolean): void {
    const manager = getInCallManager();
    speakerEnabled = enabled;
    if (!manager || !inCallModeActive) return;
    manager.setSpeakerphoneOn(enabled);
    manager.setForceSpeakerphoneOn?.(enabled ? true : false);
    if (enabled) this.disableProximity();
    else this.enableProximity();
  },

  enableProximity(): void {
    const manager = getInCallManager();
    if (!manager || !inCallModeActive || speakerEnabled) return;
    manager.setKeepScreenOn(false);
  },

  disableProximity(): void {
    const manager = getInCallManager();
    if (!manager) return;
    manager.setKeepScreenOn(true);
  },

  cleanupInCallMode(): void {
    this.stopInCallMode();
  }
};
