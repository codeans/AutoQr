import { create } from "zustand";
import type { ActiveCallState, IncomingCall } from "@/types/call";

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
  speakerEnabled: false,
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
      speakerEnabled: false,
      audioConnected: false,
      endReason: null
    })
}));
