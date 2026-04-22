import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { useAuth } from "../../context/AuthContext";
import { createOwnerCallSocket, signaling, type IncomingCallPayload } from "./services/callSignaling";
import { useWebRtcAudioCall } from "./useWebRtcAudioCall";

export type OwnerCallState =
  | "idle"
  | "ringing"
  | "accepting"
  | "connecting"
  | "connected"
  | "ended"
  | "rejected"
  | "missed"
  | "failed";

export type OwnerMissedEntry = {
  callId: string;
  incidentId: string;
  reporterPhoneMasked?: string;
  carLabel?: string;
  at: number;
};

type OwnerCallContextShape = {
  state: OwnerCallState;
  incoming: IncomingCallPayload | null;
  activeCallId: string;
  duration: number;
  muted: boolean;
  error: string;
  connectionState: "connected" | "reconnecting" | "offline";
  missed: OwnerMissedEntry[];
  acceptCall: () => void;
  rejectCall: (reason?: string) => void;
  endCall: () => void;
  toggleMute: () => void;
  dismissEnded: () => void;
  dismissMissed: (callId: string) => void;
  remoteAudioRef: React.MutableRefObject<HTMLAudioElement | null>;
};

const OwnerCallContext = createContext<OwnerCallContextShape | null>(null);

export const OwnerCallProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, token } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [socketVersion, setSocketVersion] = useState(0);
  const socket = socketRef.current;

  const [incoming, setIncoming] = useState<IncomingCallPayload | null>(null);
  const [activeCallId, setActiveCallId] = useState("");
  const [state, setState] = useState<OwnerCallState>("idle");
  const [connectionState, setConnectionState] = useState<"connected" | "reconnecting" | "offline">("offline");
  const [missed, setMissed] = useState<OwnerMissedEntry[]>([]);

  const {
    status: webrtcStatus,
    seconds,
    muted,
    error,
    setError,
    toggleMute,
    remoteAudioRef,
    acceptOffer,
    addIce,
    teardown,
    reset
  } = useWebRtcAudioCall(socket);

  useEffect(() => {
    if (!user || user.role !== "owner" || !token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setConnectionState("offline");
      return;
    }
    const instance = createOwnerCallSocket(token);
    socketRef.current = instance;
    setSocketVersion((v) => v + 1);
    return () => {
      instance.disconnect();
      socketRef.current = null;
    };
  }, [token, user]);

  useEffect(() => {
    const sock = socketRef.current;
    if (!sock) return;

    const onConnect = () => setConnectionState("connected");
    const onDisconnect = () => setConnectionState("reconnecting");
    const onConnectError = () => setConnectionState("reconnecting");
    const onReconnect = () => setConnectionState("connected");

    const onCallRinging = (payload: IncomingCallPayload) => {
      setIncoming(payload);
      setState("ringing");
      setActiveCallId(payload.callId);
    };

    const onCallCancelled = ({ callId }: { callId: string }) => {
      if (activeCallId === callId || incoming?.callId === callId) {
        setIncoming(null);
        setActiveCallId("");
        setState("idle");
        teardown();
      }
    };

    const onWebRtcOffer = ({ offer, fromSocketId, callId }: { offer: RTCSessionDescriptionInit; fromSocketId: string; callId: string }) => {
      setState("connecting");
      acceptOffer(fromSocketId, offer, callId)
        .then(() => setState("connected"))
        .catch(() => {
          setState("failed");
          setError("Could not connect the call. Please try again.");
        });
    };

    const onWebRtcCandidate = ({ candidate }: { candidate: RTCIceCandidateInit }) => {
      void addIce(candidate);
    };

    const onCallEnded = ({ callId }: { callId: string }) => {
      if (activeCallId === callId || incoming?.callId === callId) {
        setState("ended");
        teardown();
        window.setTimeout(() => {
          setIncoming(null);
          setActiveCallId("");
        }, 3000);
      }
    };

    sock.on("connect", onConnect);
    sock.on("disconnect", onDisconnect);
    sock.on("connect_error", onConnectError);
    sock.on("reconnect", onReconnect);
    sock.on("call_ringing", onCallRinging);
    sock.on("call_cancelled", onCallCancelled);
    sock.on("call_ended", onCallEnded);
    sock.on("webrtc_offer", onWebRtcOffer);
    sock.on("webrtc_ice_candidate", onWebRtcCandidate);

    const connectTimer = window.setTimeout(() => {
      if (!sock.connected) sock.connect();
      else setConnectionState("connected");
    }, 0);

    return () => {
      window.clearTimeout(connectTimer);
      sock.off("connect", onConnect);
      sock.off("disconnect", onDisconnect);
      sock.off("connect_error", onConnectError);
      sock.off("reconnect", onReconnect);
      sock.off("call_ringing", onCallRinging);
      sock.off("call_cancelled", onCallCancelled);
      sock.off("call_ended", onCallEnded);
      sock.off("webrtc_offer", onWebRtcOffer);
      sock.off("webrtc_ice_candidate", onWebRtcCandidate);
    };
  }, [acceptOffer, activeCallId, addIce, incoming?.callId, setError, socketVersion, teardown]);

  useEffect(() => {
    if (webrtcStatus === "connected") setState("connected");
    if (webrtcStatus === "failed") setState("failed");
    if (webrtcStatus === "permission_denied") {
      setState("failed");
    }
  }, [webrtcStatus]);

  const acceptCall = useCallback(() => {
    const sock = socketRef.current;
    if (!sock || !incoming) return;
    setState("accepting");
    signaling.accept(sock, incoming.callId);
  }, [incoming]);

  const rejectCall = useCallback(
    (reason?: string) => {
      const sock = socketRef.current;
      if (!sock || !incoming) return;
      signaling.reject(sock, incoming.callId, reason);
      setMissed((prev) => {
        if (prev.find((m) => m.callId === incoming.callId)) return prev;
        return [
          {
            callId: incoming.callId,
            incidentId: incoming.incidentId,
            reporterPhoneMasked: incoming.reporterPhoneMasked,
            carLabel: incoming.carLabel,
            at: Date.now()
          },
          ...prev
        ].slice(0, 10);
      });
      setState("rejected");
      teardown();
      window.setTimeout(() => {
        setIncoming(null);
        setActiveCallId("");
        setState("idle");
      }, 1500);
    },
    [incoming, teardown]
  );

  const endCall = useCallback(() => {
    const sock = socketRef.current;
    if (!sock || !activeCallId) return;
    signaling.endCall(sock, activeCallId, incoming?.reporterSocketId, "owner_ended");
    teardown();
    setState("ended");
    window.setTimeout(() => {
      setIncoming(null);
      setActiveCallId("");
      setState("idle");
    }, 2000);
  }, [activeCallId, incoming?.reporterSocketId, teardown]);

  const dismissEnded = useCallback(() => {
    reset();
    setIncoming(null);
    setActiveCallId("");
    setState("idle");
  }, [reset]);

  const dismissMissed = useCallback((callId: string) => {
    setMissed((prev) => prev.filter((m) => m.callId !== callId));
  }, []);

  const value = useMemo<OwnerCallContextShape>(
    () => ({
      state,
      incoming,
      activeCallId,
      duration: seconds,
      muted,
      error,
      connectionState,
      missed,
      acceptCall,
      rejectCall,
      endCall,
      toggleMute,
      dismissEnded,
      dismissMissed,
      remoteAudioRef
    }),
    [
      state,
      incoming,
      activeCallId,
      seconds,
      muted,
      error,
      connectionState,
      missed,
      acceptCall,
      rejectCall,
      endCall,
      toggleMute,
      dismissEnded,
      dismissMissed,
      remoteAudioRef
    ]
  );

  return <OwnerCallContext.Provider value={value}>{children}</OwnerCallContext.Provider>;
};

export const useOwnerCall = () => {
  const ctx = useContext(OwnerCallContext);
  if (!ctx) throw new Error("useOwnerCall must be used within OwnerCallProvider");
  return ctx;
};
