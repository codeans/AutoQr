import { useEffect, useMemo, useState } from "react";
import { Badge, Button, Card, SecondaryButton } from "../../components/ui";
import { connectAuthSocket } from "../../lib/socket";
import { useWebRtcAudioCall } from "./useWebRtcAudioCall";

export const OwnerIncomingCallWidget = ({ token }: { token: string }) => {
  const socket = useMemo(() => (token ? connectAuthSocket(token) : null), [token]);
  const [incoming, setIncoming] = useState<{ callId: string; incidentId: string; reporterSocketId: string } | null>(null);
  const [connectionState, setConnectionState] = useState("connected");
  const { status, error, seconds, remoteAudioRef, acceptOffer, applyAnswer, addIce, teardown } = useWebRtcAudioCall(socket);

  useEffect(() => {
    if (!socket) return;
    const onCallRinging = (payload: { callId: string; incidentId: string; reporterSocketId: string }) => setIncoming(payload);
    const onWebRtcOffer = ({ offer, fromSocketId, callId }: { offer: RTCSessionDescriptionInit; fromSocketId: string; callId: string }) => {
      void acceptOffer(fromSocketId, offer, callId);
    };
    const onWebRtcAnswer = ({ answer }: { answer: RTCSessionDescriptionInit }) => {
      void applyAnswer(answer);
    };
    const onWebRtcCandidate = ({ candidate }: { candidate: RTCIceCandidateInit }) => {
      void addIce(candidate);
    };
    const onCallEnded = () => teardown();
    const onConnectError = () => setConnectionState("disconnected");
    const onReconnect = () => setConnectionState("connected");
    const onConnect = () => setConnectionState("connected");
    socket.on("call_ringing", onCallRinging);
    socket.on("webrtc_offer", onWebRtcOffer);
    socket.on("webrtc_answer", onWebRtcAnswer);
    socket.on("webrtc_ice_candidate", onWebRtcCandidate);
    socket.on("call_ended", onCallEnded);
    socket.on("connect_error", onConnectError);
    socket.on("reconnect", onReconnect);
    socket.on("connect", onConnect);
    return () => {
      socket.off("call_ringing", onCallRinging);
      socket.off("webrtc_offer", onWebRtcOffer);
      socket.off("webrtc_answer", onWebRtcAnswer);
      socket.off("webrtc_ice_candidate", onWebRtcCandidate);
      socket.off("call_ended", onCallEnded);
      socket.off("connect_error", onConnectError);
      socket.off("reconnect", onReconnect);
      socket.off("connect", onConnect);
    };
  }, [acceptOffer, addIce, applyAnswer, socket, teardown]);

  useEffect(
    () => () => {
      if (!socket) return;
      socket.disconnect();
    },
    [socket]
  );

  if (!token || !incoming || !socket) return null;

  return (
    <Card className="border-action">
      <h3 className="text-lg font-semibold">Incoming call request</h3>
      <Badge label={status} tone={status === "connected" ? "success" : "warning"} />
      {connectionState !== "connected" ? <p className="mt-1 text-xs text-amber-700">Realtime connection interrupted. Retrying...</p> : null}
      <p className="mt-1 text-xs text-slate-500">Incident ID: {incoming.incidentId}</p>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {status === "connected" && <p className="text-sm">Call timer: {seconds}s</p>}
      <audio ref={remoteAudioRef} autoPlay />
      <div className="mt-3 flex gap-2">
        <Button onClick={() => socket.emit("call_accept", { callId: incoming.callId })}>Accept</Button>
        <SecondaryButton onClick={() => socket.emit("call_reject", { callId: incoming.callId, reason: "Owner unavailable" })}>
          Reject
        </SecondaryButton>
      </div>
    </Card>
  );
};
