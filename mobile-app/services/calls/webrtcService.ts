/**
 * webrtcService
 *
 * Higher-level wrapper around PeerConnection that binds WebRTC signaling to the
 * AutoQr socket events. Designed so the surrounding app (stores, screens) never
 * has to know whether `react-native-webrtc` is actually loaded — when it isn't
 * (managed-Expo without a dev client), the call still works as a signalling-only
 * session that drives UI + missed-call bookkeeping, and the audio layer becomes
 * available the moment you flip to an EAS dev client.
 */
import { PeerConnection } from "@/services/webrtc/peer";
import { getSocket } from "@/services/socket/socket";
import { CallEvents } from "@/types/call";

export type WebRtcCallOptions = {
  callId: string;
  remoteSocketId: string | null;
  role: "caller" | "callee";
};

export type WebRtcCallbacks = {
  onConnected?: () => void;
  onDisconnected?: () => void;
  onError?: (err: unknown) => void;
};

type InternalState = {
  peer: PeerConnection;
  options: WebRtcCallOptions;
  offerHandler?: (payload: { offer: unknown; callId: string; fromSocketId?: string }) => void;
  answerHandler?: (payload: { answer: unknown; callId: string }) => void;
  iceHandler?: (payload: { candidate: unknown; callId: string }) => void;
  disposed: boolean;
  callbacks: WebRtcCallbacks;
};

let current: InternalState | null = null;

function emit(event: string, payload: Record<string, unknown>): void {
  const socket = getSocket();
  if (!socket) return;
  socket.emit(event, payload);
}

async function bindSignaling(state: InternalState): Promise<void> {
  const socket = getSocket();
  if (!socket) return;

  state.offerHandler = async ({ offer, callId, fromSocketId }) => {
    if (callId !== state.options.callId) return;
    if (fromSocketId) {
      state.options = { ...state.options, remoteSocketId: fromSocketId };
    }
    try {
      await state.peer.acceptOffer(offer);
    } catch (err) {
      state.callbacks.onError?.(err);
    }
  };

  state.answerHandler = async ({ answer, callId }) => {
    if (callId !== state.options.callId) return;
    try {
      await state.peer.acceptAnswer(answer);
    } catch (err) {
      state.callbacks.onError?.(err);
    }
  };

  state.iceHandler = async ({ candidate, callId }) => {
    if (callId !== state.options.callId) return;
    try {
      await state.peer.addIceCandidate(candidate);
    } catch (err) {
      state.callbacks.onError?.(err);
    }
  };

  socket.on(CallEvents.WEBRTC_OFFER, state.offerHandler);
  socket.on(CallEvents.WEBRTC_ANSWER, state.answerHandler);
  socket.on(CallEvents.WEBRTC_ICE, state.iceHandler);
}

function unbindSignaling(state: InternalState): void {
  const socket = getSocket();
  if (!socket) return;
  if (state.offerHandler) socket.off(CallEvents.WEBRTC_OFFER, state.offerHandler);
  if (state.answerHandler) socket.off(CallEvents.WEBRTC_ANSWER, state.answerHandler);
  if (state.iceHandler) socket.off(CallEvents.WEBRTC_ICE, state.iceHandler);
}

export const webrtcService = {
  /** Set up peer + attach socket signaling. Returns true if audio is available on this device. */
  async initializeCall(
    options: WebRtcCallOptions,
    callbacks: WebRtcCallbacks = {}
  ): Promise<boolean> {
    // Tear down any lingering session before starting a new one.
    await webrtcService.cleanup();

    const peer = new PeerConnection({
      onLocalIceCandidate: (candidate) => {
        if (!options.remoteSocketId) return;
        emit(CallEvents.WEBRTC_ICE, {
          callId: options.callId,
          targetSocketId: options.remoteSocketId,
          candidate
        });
      },
      onLocalOffer: (offer) => {
        if (!options.remoteSocketId) return;
        emit(CallEvents.WEBRTC_OFFER, {
          callId: options.callId,
          targetSocketId: options.remoteSocketId,
          offer
        });
      },
      onLocalAnswer: (answer) => {
        if (!options.remoteSocketId) return;
        emit(CallEvents.WEBRTC_ANSWER, {
          callId: options.callId,
          targetSocketId: options.remoteSocketId,
          answer
        });
      },
      onConnected: callbacks.onConnected,
      onDisconnected: callbacks.onDisconnected,
      onError: callbacks.onError
    });

    const state: InternalState = {
      peer,
      options,
      disposed: false,
      callbacks
    };
    current = state;

    const available = await peer.init();
    if (!available) {
      // Managed Expo without dev client — signalling path is set up but we can't open mic.
      return false;
    }
    await bindSignaling(state);
    return true;
  },

  async createOffer(): Promise<void> {
    if (!current) return;
    await current.peer.createOffer();
  },

  async createAnswer(): Promise<void> {
    // No-op: PeerConnection creates the answer automatically on acceptOffer.
  },

  async handleRemoteOffer(offer: unknown, fromSocketId?: string): Promise<void> {
    if (!current) return;
    if (fromSocketId) current.options.remoteSocketId = fromSocketId;
    await current.peer.acceptOffer(offer);
  },

  async handleRemoteAnswer(answer: unknown): Promise<void> {
    if (!current) return;
    await current.peer.acceptAnswer(answer);
  },

  async addIceCandidate(candidate: unknown): Promise<void> {
    if (!current) return;
    await current.peer.addIceCandidate(candidate);
  },

  toggleMute(enabled: boolean): void {
    if (!current) return;
    current.peer.setMicEnabled(enabled);
  },

  toggleSpeaker(_enabled: boolean): void {
    // Speaker routing requires either react-native-incall-manager or a custom
    // AudioSession module — leave as a hook. The call UI already reflects the
    // requested state so users see feedback on their tap immediately.
  },

  updateRemoteSocket(remoteSocketId: string | null): void {
    if (!current) return;
    current.options.remoteSocketId = remoteSocketId;
  },

  async endCall(): Promise<void> {
    await webrtcService.cleanup();
  },

  async cleanup(): Promise<void> {
    const state = current;
    current = null;
    if (!state || state.disposed) return;
    state.disposed = true;
    try {
      unbindSignaling(state);
    } catch {
      // ignore
    }
    try {
      state.peer.close();
    } catch {
      // ignore
    }
  },

  isActive(): boolean {
    return current !== null;
  }
};
