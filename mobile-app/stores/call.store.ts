import { create } from "zustand";
import { Platform } from "react-native";
import type { ActiveCallState, IncomingCall } from "@/types/call";

const DEFAULT_SPEAKER_ENABLED = Platform.OS === "android";

type CallState = {
  status: ActiveCallState;
  incoming: IncomingCall | null;
  activeCallId: string | null;
  remoteSocketId: string | null;
  startedAt: number | null;
  ringingStartedAt: number | null;
  micEnabled: boolean;
  speakerEnabled: boolean;
  audioConnected: boolean;
  endReason: string | null;
  setIncoming: (incoming: IncomingCall | null) => void;
  setStatus: (status: ActiveCallState) => void;
  setActive: (params: { callId: string; remoteSocketId: string | null }) => void;
  markConnected: () => void;
  markAudioConnected: (connected: boolean) => void;
  toggleMic: () => void;
  toggleSpeaker: () => void;
  setSpeakerEnabled: (enabled: boolean) => void;
  setEndReason: (reason: string | null) => void;
  reset: () => void;
};

export const useCallStore = create<CallState>((set) => ({
  status: "idle",
  incoming: null,
  activeCallId: null,
  remoteSocketId: null,
  startedAt: null,
  ringingStartedAt: null,
  micEnabled: true,
  speakerEnabled: DEFAULT_SPEAKER_ENABLED,
  audioConnected: false,
  endReason: null,
  setIncoming: (incoming) =>
    set({
      incoming,
      status: incoming ? "ringing" : "idle",
      ringingStartedAt: incoming ? Date.now() : null,
      endReason: null
    }),
  setStatus: (status) => set({ status }),
  setActive: ({ callId, remoteSocketId }) =>
    set({ activeCallId: callId, remoteSocketId, status: "connecting" }),
  markConnected: () => set({ status: "active", startedAt: Date.now() }),
  markAudioConnected: (connected) => set({ audioConnected: connected }),
  toggleMic: () => set((s) => ({ micEnabled: !s.micEnabled })),
  toggleSpeaker: () => set((s) => ({ speakerEnabled: !s.speakerEnabled })),
  setSpeakerEnabled: (enabled) => set({ speakerEnabled: enabled }),
  setEndReason: (endReason) => set({ endReason }),
  reset: () =>
    set({
      status: "idle",
      incoming: null,
      activeCallId: null,
      remoteSocketId: null,
      startedAt: null,
      ringingStartedAt: null,
      micEnabled: true,
      speakerEnabled: DEFAULT_SPEAKER_ENABLED,
      audioConnected: false,
      endReason: null
    })
}));
