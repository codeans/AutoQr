import {
  ChannelProfileType,
  ClientRoleType,
  ConnectionChangedReasonType,
  ConnectionStateType,
  createAgoraRtcEngine,
  type IRtcEngine,
  type IRtcEngineEventHandler
} from "react-native-agora";
import { config } from "@/constants/config";
import { callsService } from "@/services/api/calls.service";
import type { AgoraJoinPayload } from "@/types/call";

type AgoraCallbacks = {
  onConnected?: () => void;
  onDisconnected?: () => void;
  onReconnecting?: () => void;
  onError?: (err: unknown) => void;
};

type ActiveAgoraCall = {
  callId: string;
  agora: AgoraJoinPayload;
  engine: IRtcEngine;
  handler: IRtcEngineEventHandler;
  callbacks: AgoraCallbacks;
};

let current: ActiveAgoraCall | null = null;

async function renewToken(): Promise<void> {
  if (!current) return;
  const { agora } = await callsService.token({
    callId: current.callId,
    channelName: current.agora.channelName,
    uid: current.agora.uid,
    role: current.agora.role
  });
  current.agora = agora;
  current.engine.renewToken(agora.token);
}

export const agoraVoiceService = {
  async join(callId: string, agora: AgoraJoinPayload, callbacks: AgoraCallbacks = {}): Promise<boolean> {
    await agoraVoiceService.cleanup();
    const appId = agora.appId || config.agoraAppId;
    if (!appId) {
      callbacks.onError?.(new Error("Missing EXPO_PUBLIC_AGORA_APP_ID"));
      return false;
    }

    const engine = createAgoraRtcEngine();
    const handler: IRtcEngineEventHandler = {
      onJoinChannelSuccess: () => callbacks.onConnected?.(),
      onUserJoined: () => callbacks.onConnected?.(),
      onUserOffline: () => callbacks.onDisconnected?.(),
      onConnectionStateChanged: (_connection, state, reason) => {
        if (state === ConnectionStateType.ConnectionStateConnected) callbacks.onConnected?.();
        if (state === ConnectionStateType.ConnectionStateReconnecting) callbacks.onReconnecting?.();
        if (
          state === ConnectionStateType.ConnectionStateFailed ||
          reason === ConnectionChangedReasonType.ConnectionChangedTokenExpired
        ) {
          callbacks.onError?.(new Error("Agora connection failed"));
        }
      },
      onTokenPrivilegeWillExpire: () => {
        void renewToken().catch((err) => callbacks.onError?.(err));
      },
      onRequestToken: () => {
        void renewToken().catch((err) => callbacks.onError?.(err));
      },
      onError: (err) => callbacks.onError?.(err)
    };

    try {
      engine.initialize({ appId, areaCode: 4 });
      engine.registerEventHandler(handler);
      engine.setChannelProfile(ChannelProfileType.ChannelProfileCommunication);
      engine.setClientRole(ClientRoleType.ClientRoleBroadcaster);
      engine.enableAudio();
      engine.enableLocalAudio(true);
      engine.joinChannel(agora.token, agora.channelName, agora.uid, {
        channelProfile: ChannelProfileType.ChannelProfileCommunication,
        clientRoleType: ClientRoleType.ClientRoleBroadcaster,
        publishMicrophoneTrack: true,
        publishCameraTrack: false,
        autoSubscribeAudio: true,
        autoSubscribeVideo: false
      });
      current = { callId, agora, engine, handler, callbacks };
      return true;
    } catch (err) {
      callbacks.onError?.(err);
      try {
        engine.unregisterEventHandler(handler);
        engine.release();
      } catch {
        // ignore cleanup failures
      }
      return false;
    }
  },

  toggleMute(micEnabled: boolean): void {
    current?.engine.muteLocalAudioStream(!micEnabled);
  },

  toggleSpeaker(enabled: boolean): void {
    current?.engine.setEnableSpeakerphone(enabled);
  },

  async cleanup(): Promise<void> {
    const active = current;
    current = null;
    if (!active) return;
    try {
      active.engine.leaveChannel();
    } catch {
      // ignore
    }
    try {
      active.engine.unregisterEventHandler(active.handler);
      active.engine.release();
    } catch {
      // ignore
    }
  },

  isActive(): boolean {
    return current !== null;
  }
};
