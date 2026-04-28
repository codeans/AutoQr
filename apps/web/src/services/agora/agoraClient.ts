import AgoraRTC, {
  type IAgoraRTCClient,
  type IMicrophoneAudioTrack,
  type IAgoraRTCRemoteUser,
  type IRemoteAudioTrack,
} from "agora-rtc-sdk-ng";
import { agoraAppId } from "../../lib/runtimeConfig";

export type AgoraJoinConfig = {
  appId?: string;
  token: string;
  channelName: string;
  uid: number;
};

type AgoraClientEvents = {
  onConnected?: () => void;
  onDisconnected?: () => void;
  onReconnecting?: () => void;
  onTokenWillExpire?: () => void;
  onTokenExpired?: () => void;
  onError?: (error: unknown) => void;
};

let client: IAgoraRTCClient | null = null;
let localAudioTrack: IMicrophoneAudioTrack | null = null;
let remoteAudioTracks: IRemoteAudioTrack[] = [];
let joined = false;

const getClient = (events: AgoraClientEvents = {}) => {
  if (client) return client;
  client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
  client.on("user-published", async (user: IAgoraRTCRemoteUser, mediaType: "audio" | "video" | "datachannel") => {
    if (!client || mediaType !== "audio") return;
    await client.subscribe(user, mediaType);
    if (user.audioTrack) {
      remoteAudioTracks.push(user.audioTrack);
      user.audioTrack.play();
    }
  });
  client.on("user-unpublished", (user: IAgoraRTCRemoteUser) => {
    if (user.audioTrack) {
      user.audioTrack.stop();
      remoteAudioTracks = remoteAudioTracks.filter((track) => track !== user.audioTrack);
    }
  });
  client.on("connection-state-change", (curState) => {
    if (curState === "CONNECTED") events.onConnected?.();
    if (curState === "RECONNECTING") events.onReconnecting?.();
    if (curState === "DISCONNECTED") events.onDisconnected?.();
  });
  client.on("token-privilege-will-expire", () => events.onTokenWillExpire?.());
  client.on("token-privilege-did-expire", () => events.onTokenExpired?.());
  client.on("exception", (event) => events.onError?.(event));
  return client;
};

export const agoraVoiceClient = {
  async ensureMicrophone(): Promise<void> {
    const track = await AgoraRTC.createMicrophoneAudioTrack({
      encoderConfig: "speech_low_quality",
      ANS: true,
      AEC: true,
      AGC: true
    });
    track.close();
  },

  async join(config: AgoraJoinConfig, events: AgoraClientEvents = {}): Promise<void> {
    if (!config.token || !config.channelName || !config.uid) {
      throw new Error("Missing Agora join credentials");
    }
    const appId = config.appId || agoraAppId;
    if (!appId) throw new Error("Missing VITE_AGORA_APP_ID");
    await this.leave();
    const rtc = getClient(events);
    localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack({
      encoderConfig: "speech_low_quality",
      ANS: true,
      AEC: true,
      AGC: true
    });
    await rtc.join(appId, config.channelName, config.token, config.uid);
    await rtc.publish(localAudioTrack);
    joined = true;
    events.onConnected?.();
  },

  async renewToken(token: string): Promise<void> {
    if (!client || !joined) return;
    await client.renewToken(token);
  },

  setMuted(muted: boolean): void {
    void localAudioTrack?.setEnabled(!muted);
  },

  async leave(): Promise<void> {
    remoteAudioTracks.forEach((track) => track.stop());
    remoteAudioTracks = [];
    if (localAudioTrack) {
      localAudioTrack.stop();
      localAudioTrack.close();
      localAudioTrack = null;
    }
    if (client && joined) {
      await client.leave().catch(() => undefined);
    }
    client = null;
    joined = false;
  }
};
