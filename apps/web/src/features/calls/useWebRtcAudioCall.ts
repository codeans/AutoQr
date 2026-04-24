import { useCallback, useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { webRtcIceServers } from "../../lib/runtimeConfig";

export type WebRtcCallStatus =
  | "idle"
  | "permission_requested"
  | "permission_denied"
  | "connecting"
  | "ringing"
  | "incoming"
  | "accepted"
  | "connected"
  | "rejected"
  | "missed"
  | "ended"
  | "failed";

const rtcConfig: RTCConfiguration = {
  iceServers: webRtcIceServers
};

export const useWebRtcAudioCall = (socket: Socket | null) => {
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const [status, setStatus] = useState<WebRtcCallStatus>("idle");
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState("");
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    if (status !== "connected") return;
    setSeconds(0);
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [status]);

  const ensureMicrophone = useCallback(async () => {
    if (streamRef.current) return streamRef.current;
    try {
      setStatus((s) => (s === "idle" ? "permission_requested" : s));
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      return stream;
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

  const createPeer = useCallback(
    async (targetSocketId: string, callId: string) => {
      const stream = await ensureMicrophone();
      const peer = new RTCPeerConnection(rtcConfig);
      remoteStreamRef.current = new MediaStream();
      stream.getTracks().forEach((track) => peer.addTrack(track, stream));
      peer.ontrack = (event) => {
        event.streams[0]?.getTracks().forEach((track) => remoteStreamRef.current?.addTrack(track));
        if (remoteAudioRef.current && remoteStreamRef.current) {
          remoteAudioRef.current.srcObject = remoteStreamRef.current;
          void remoteAudioRef.current.play().catch(() => undefined);
        }
      };
      peer.onicecandidate = (event) => {
        if (event.candidate && socket) {
          socket.emit("webrtc_ice_candidate", { targetSocketId, candidate: event.candidate, callId });
        }
      };
      peer.onconnectionstatechange = () => {
        if (peer.connectionState === "failed") {
          setStatus("failed");
          setError("Call connection failed — please try again.");
        }
      };
      peerRef.current = peer;
      return peer;
    },
    [ensureMicrophone, socket]
  );

  const createOffer = useCallback(
    async (targetSocketId: string, callId: string) => {
      const peer = await createPeer(targetSocketId, callId);
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      socket?.emit("webrtc_offer", { targetSocketId, offer, callId });
    },
    [createPeer, socket]
  );

  const acceptOffer = useCallback(
    async (targetSocketId: string, offer: RTCSessionDescriptionInit, callId: string) => {
      const peer = await createPeer(targetSocketId, callId);
      await peer.setRemoteDescription(offer);
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      socket?.emit("webrtc_answer", { targetSocketId, answer, callId });
      setStatus("connected");
    },
    [createPeer, socket]
  );

  const applyAnswer = useCallback(async (answer: RTCSessionDescriptionInit) => {
    await peerRef.current?.setRemoteDescription(answer);
    setStatus("connected");
  }, []);

  const addIce = useCallback(async (candidate: RTCIceCandidateInit) => {
    try {
      await peerRef.current?.addIceCandidate(candidate);
    } catch {
      /* candidate may arrive before remote description — safe to ignore */
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (!streamRef.current) return;
    const next = !muted;
    streamRef.current.getAudioTracks().forEach((track) => {
      track.enabled = !next;
    });
    setMuted(next);
  }, [muted]);

  const teardown = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    remoteStreamRef.current = null;
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }
    peerRef.current?.close();
    peerRef.current = null;
    setMuted(false);
    setStatus((prev) =>
      prev === "rejected" || prev === "missed" || prev === "permission_denied" || prev === "failed" ? prev : "ended"
    );
  }, []);

  const reset = useCallback(() => {
    teardown();
    setStatus("idle");
    setSeconds(0);
    setError("");
  }, [teardown]);

  useEffect(() => {
    return () => {
      teardown();
    };
  }, [teardown]);

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
    createOffer,
    acceptOffer,
    applyAnswer,
    addIce,
    teardown,
    reset
  };
};
