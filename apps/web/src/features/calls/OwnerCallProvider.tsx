import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { useAuth } from "../../context/AuthContext";
import { createOwnerCallSocket, signaling, type AgoraJoinPayload, type IncomingCallPayload } from "./services/callSignaling";
import { useAgoraCall } from "../../hooks/useAgoraCall";
import { api } from "../../lib/api";

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

  const [incoming, setIncoming] = useState<IncomingCallPayload | null>(null);
  const [activeCallId, setActiveCallId] = useState("");
  const [state, setState] = useState<OwnerCallState>("idle");
  const [connectionState, setConnectionState] = useState<"connected" | "reconnecting" | "offline">("offline");
  const [missed, setMissed] = useState<OwnerMissedEntry[]>([]);

  const {
    status: agoraStatus,
    seconds,
    muted,
    error,
    setError,
    toggleMute,
    remoteAudioRef,
    join,
    teardown,
    reset
  } = useAgoraCall();

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
      setIncoming({
        ...payload,
        carId: payload.carId ?? payload.vehicleId,
        carLabel: payload.carLabel ?? payload.vehiclePlate,
        imageCount: payload.imageCount ?? payload.incidentImages?.length ?? 0,
        reporterPhoneMasked: payload.reporterPhoneMasked ?? payload.callerPhone
      });
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
    sock.on("call:incoming", onCallRinging);
    sock.on("callback:incoming", onCallRinging);
    sock.on("call_ringing", onCallRinging);
    sock.on("call_cancelled", onCallCancelled);
    sock.on("call:ended", onCallEnded);
    sock.on("call_ended", onCallEnded);

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
      sock.off("call:incoming", onCallRinging);
      sock.off("callback:incoming", onCallRinging);
      sock.off("call_ringing", onCallRinging);
      sock.off("call_cancelled", onCallCancelled);
      sock.off("call:ended", onCallEnded);
      sock.off("call_ended", onCallEnded);
    };
  }, [activeCallId, incoming?.callId, socketVersion, teardown]);

  useEffect(() => {
    if (agoraStatus === "connected") setState("connected");
    if (agoraStatus === "failed") setState("failed");
    if (agoraStatus === "permission_denied") {
      setState("failed");
    }
  }, [agoraStatus]);

  const acceptCall = useCallback(() => {
    const sock = socketRef.current;
    if (!sock || !incoming) return;
    setState("accepting");
    void api
      .post<{ ok: boolean; call: { callId: string; agora?: AgoraJoinPayload } }>(`/calls/${incoming.callId}/accept`, {
        platform: "web",
        ownerSocketId: sock.id
      })
      .then(async ({ data }) => {
        const agora = data.call.agora;
        if (!agora) throw new Error("Missing Agora token");
        setState("connecting");
        await join(agora, { callId: incoming.callId });
        setState("connected");
      })
      .catch((err) => {
        setState("failed");
        setError(err instanceof Error ? err.message : "Could not connect the call. Please try again.");
      });
  }, [incoming, join, setError]);

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
    signaling.endCall(sock, activeCallId, undefined, "owner_ended");
    void api.post("/calls/end", { callId: activeCallId, reason: "owner_ended" }).catch(() => undefined);
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
