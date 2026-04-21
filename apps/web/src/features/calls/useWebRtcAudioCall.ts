import { useCallback, useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { webRtcIceServers } from "../../lib/runtimeConfig";

const rtcConfig: RTCConfiguration = {
  iceServers: webRtcIceServers
};

export const useWebRtcAudioCall = (socket: Socket | null) => {
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const [status, setStatus] = useState<"idle" | "ringing" | "connected" | "ended" | "rejected" | "missed" | "error">("idle");
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status !== "connected") return;
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [status]);

  const createPeer = useCallback(
    async (targetSocketId: string, callId: string) => {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch {
        setStatus("error");
        setError("Microphone permission denied or unavailable.");
        throw new Error("Mic permission denied");
      }
      streamRef.current = stream;
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
      peerRef.current = peer;
      return peer;
    },
    [socket]
  );

  const createOffer = useCallback(
    async (targetSocketId: string, callId: string) => {
      const peer = await createPeer(targetSocketId, callId);
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      socket?.emit("webrtc_offer", { targetSocketId, offer, callId });
      setStatus("ringing");
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
    await peerRef.current?.addIceCandidate(candidate);
  }, []);

  const teardown = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    remoteStreamRef.current = null;
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }
    peerRef.current?.close();
    peerRef.current = null;
    setStatus("ended");
  }, []);

  useEffect(() => {
    return () => {
      teardown();
    };
  }, [teardown]);

  return { status, seconds, error, remoteAudioRef, setStatus, createOffer, acceptOffer, applyAnswer, addIce, teardown };
};
