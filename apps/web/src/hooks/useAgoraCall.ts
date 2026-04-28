import { useCallback, useEffect, useRef, useState } from "react";
import type { AgoraJoinPayload } from "../features/calls/services/callSignaling";
import { api } from "../lib/api";
import { agoraVoiceClient } from "../services/agora/agoraClient";

export type AgoraCallStatus =
  | "idle"
  | "permission_requested"
  | "permission_denied"
  | "connecting"
  | "connected"
  | "ended"
  | "failed";

type TokenRefreshOptions = {
  callId: string;
  reporterSessionToken?: string;
};

export const useAgoraCall = () => {
  const [status, setStatus] = useState<AgoraCallStatus>("idle");
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState("");
  const [muted, setMuted] = useState(false);
  const joinRef = useRef<AgoraJoinPayload | null>(null);
  const refreshRef = useRef<TokenRefreshOptions | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (status !== "connected") return;
    setSeconds(0);
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [status]);

  const fetchToken = useCallback(async (options: TokenRefreshOptions) => {
    const current = joinRef.current;
    const { data } = await api.post<{ agora: AgoraJoinPayload; ok: boolean }>("/agora/token", {
      callId: options.callId,
      channelName: current?.channelName,
      uid: current?.uid,
      role: current?.role ?? "publisher",
      reporterSessionToken: options.reporterSessionToken
    });
    return data.agora;
  }, []);

  const refreshToken = useCallback(async () => {
    if (!refreshRef.current) return;
    const agora = await fetchToken(refreshRef.current);
    joinRef.current = agora;
    await agoraVoiceClient.renewToken(agora.token);
  }, [fetchToken]);

  const ensureMicrophone = useCallback(async () => {
    setStatus((current) => (current === "idle" ? "permission_requested" : current));
    try {
      await agoraVoiceClient.ensureMicrophone();
    } catch (err) {
      setStatus("permission_denied");
      setError(
        err instanceof Error && err.name === "NotAllowedError"
          ? "Microphone permission denied. Please allow mic access and try again."
          : "Microphone unavailable. Please check your device and retry."
      );
      throw err;
    }
  }, []);

  const join = useCallback(
    async (agora: AgoraJoinPayload, options: TokenRefreshOptions) => {
      joinRef.current = agora;
      refreshRef.current = options;
      setStatus("connecting");
      setError("");
      try {
        await agoraVoiceClient.join(
          {
            appId: agora.appId,
            token: agora.token,
            channelName: agora.channelName,
            uid: agora.uid
          },
          {
            onConnected: () => setStatus("connected"),
            onReconnecting: () => setStatus("connecting"),
            onTokenWillExpire: () => void refreshToken(),
            onTokenExpired: () => void refreshToken(),
            onError: (err) => {
              setStatus("failed");
              setError(err instanceof Error ? err.message : "Agora voice connection failed.");
            }
          }
        );
      } catch (err) {
        setStatus("failed");
        setError(err instanceof Error ? err.message : "Could not join the Agora voice call.");
        throw err;
      }
    },
    [refreshToken]
  );

  const toggleMute = useCallback(() => {
    setMuted((current) => {
      const next = !current;
      agoraVoiceClient.setMuted(next);
      return next;
    });
  }, []);

  const teardown = useCallback(() => {
    void agoraVoiceClient.leave();
    joinRef.current = null;
    refreshRef.current = null;
    setMuted(false);
    setStatus((current) => (current === "permission_denied" || current === "failed" ? current : "ended"));
  }, []);

  const reset = useCallback(() => {
    teardown();
    setStatus("idle");
    setSeconds(0);
    setError("");
  }, [teardown]);

  useEffect(() => () => teardown(), [teardown]);

  return {
    status,
    setStatus,
    seconds,
    error,
    setError,
    muted,
    toggleMute,
    remoteAudioRef,
    ensureMicrophone,
    join,
    teardown,
    reset
  };
};
