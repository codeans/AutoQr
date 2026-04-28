import { useCallback } from "react";
import { agoraVoiceService } from "@/services/agora/agoraVoiceService";

export function useAgoraCall() {
  return {
    setMicEnabled: useCallback((enabled: boolean) => agoraVoiceService.toggleMute(enabled), []),
    setSpeakerEnabled: useCallback((enabled: boolean) => agoraVoiceService.toggleSpeaker(enabled), []),
    leave: useCallback(() => agoraVoiceService.cleanup(), [])
  };
}
