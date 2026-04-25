/**
 * WebRTC-ready peer manager.
 *
 * Production builds should install `react-native-webrtc` (requires an Expo
 * dev build / bare workflow) and replace `loadWebRtc()` with a direct import.
 * The rest of the app — socket signaling, call lifecycle, UI — is wired to
 * this abstraction, so enabling real audio is a single-file swap.
 */

type PeerEvents = {
  onLocalOffer?: (offer: unknown) => void;
  onLocalAnswer?: (answer: unknown) => void;
  onLocalIceCandidate?: (candidate: unknown) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onError?: (error: unknown) => void;
};

type WebRtcModule = {
  RTCPeerConnection: any;
  RTCSessionDescription: any;
  RTCIceCandidate: any;
  mediaDevices: any;
};

let cachedModule: WebRtcModule | null | undefined;

async function loadWebRtc(): Promise<WebRtcModule | null> {
  if (cachedModule !== undefined) return cachedModule;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require("react-native-webrtc") as WebRtcModule;
    cachedModule = mod ?? null;
  } catch {
    cachedModule = null;
  }
  return cachedModule;
}

const DEFAULT_ICE_SERVERS = [{ urls: "stun:stun.l.google.com:19302" }];

export class PeerConnection {
  private pc: any = null;
  private localStream: any = null;
  private events: PeerEvents;
  private available = false;

  constructor(events: PeerEvents = {}) {
    this.events = events;
  }

  async init(): Promise<boolean> {
    const mod = await loadWebRtc();
    if (!mod) {
      this.events.onError?.(new Error("react-native-webrtc not installed"));
      return false;
    }
    this.available = true;
    this.pc = new mod.RTCPeerConnection({ iceServers: DEFAULT_ICE_SERVERS });

    this.pc.onicecandidate = (event: { candidate: unknown | null }) => {
      if (event.candidate) this.events.onLocalIceCandidate?.(event.candidate);
    };
    this.pc.onconnectionstatechange = () => {
      const state = this.pc?.connectionState;
      if (state === "connected") this.events.onConnected?.();
      if (state === "disconnected" || state === "failed" || state === "closed") {
        this.events.onDisconnected?.();
      }
    };

    try {
      this.localStream = await mod.mediaDevices.getUserMedia({ audio: true, video: false });
      this.localStream.getTracks().forEach((track: any) => {
        this.pc.addTrack(track, this.localStream);
      });
    } catch (err) {
      this.events.onError?.(err);
      return false;
    }
    return true;
  }

  isAvailable(): boolean {
    return this.available;
  }

  async createOffer(): Promise<void> {
    if (!this.pc) return;
    const offer = await this.pc.createOffer({ offerToReceiveAudio: true });
    await this.pc.setLocalDescription(offer);
    this.events.onLocalOffer?.(offer);
  }

  async acceptOffer(offer: unknown): Promise<void> {
    const mod = await loadWebRtc();
    if (!this.pc || !mod) return;
    await this.pc.setRemoteDescription(new mod.RTCSessionDescription(offer as any));
    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);
    this.events.onLocalAnswer?.(answer);
  }

  async acceptAnswer(answer: unknown): Promise<void> {
    const mod = await loadWebRtc();
    if (!this.pc || !mod) return;
    await this.pc.setRemoteDescription(new mod.RTCSessionDescription(answer as any));
  }

  async addIceCandidate(candidate: unknown): Promise<void> {
    const mod = await loadWebRtc();
    if (!this.pc || !mod || !candidate) return;
    try {
      await this.pc.addIceCandidate(new mod.RTCIceCandidate(candidate as any));
    } catch (err) {
      this.events.onError?.(err);
    }
  }

  setMicEnabled(enabled: boolean): void {
    this.localStream?.getAudioTracks().forEach((t: any) => {
      t.enabled = enabled;
    });
  }

  close(): void {
    try {
      this.localStream?.getTracks().forEach((t: any) => t.stop());
    } catch {
      // ignore
    }
    try {
      this.pc?.close();
    } catch {
      // ignore
    }
    this.pc = null;
    this.localStream = null;
  }
}
