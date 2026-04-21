import { useEffect, useMemo, useState } from "react";
import { Badge, Button, Card, SecondaryButton } from "../../components/ui";
import { connectReporterSocket } from "../../lib/socket";
import { useWebRtcAudioCall } from "./useWebRtcAudioCall";

export const CallReporterWidget = ({ incidentId, ownerUserId }: { incidentId: string; ownerUserId: string }) => {
  const socket = useMemo(() => connectReporterSocket(incidentId), [incidentId]);
  const [callId, setCallId] = useState("");
  const [ownerSocketId, setOwnerSocketId] = useState("");
  const [connectionState, setConnectionState] = useState("connected");
  const { status, seconds, error, remoteAudioRef, setStatus, createOffer, applyAnswer, addIce, teardown } = useWebRtcAudioCall(socket);

  useEffect(() => {
    const onCallRequested = ({ callId: incomingCallId }: { callId: string }) => {
      setCallId(incomingCallId);
      setStatus("ringing");
    };
    const onCallAccepted = (payload: { callId: string; ownerSocketId: string }) => {
      setCallId(payload.callId);
      setOwnerSocketId(payload.ownerSocketId);
      createOffer(payload.ownerSocketId, payload.callId).catch(() => setStatus("missed"));
    };
    const onCallRejected = () => setStatus("rejected");
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
    socket.on("call_requested", onCallRequested);
    socket.on("call_accepted", onCallAccepted);
    socket.on("call_rejected", onCallRejected);
    socket.on("webrtc_answer", onWebRtcAnswer);
    socket.on("webrtc_ice_candidate", onWebRtcCandidate);
    socket.on("call_ended", onCallEnded);
    socket.on("connect_error", onConnectError);
    socket.on("reconnect", onReconnect);
    socket.on("connect", onConnect);
    return () => {
      socket.off("call_requested", onCallRequested);
      socket.off("call_accepted", onCallAccepted);
      socket.off("call_rejected", onCallRejected);
      socket.off("webrtc_answer", onWebRtcAnswer);
      socket.off("webrtc_ice_candidate", onWebRtcCandidate);
      socket.off("call_ended", onCallEnded);
      socket.off("connect_error", onConnectError);
      socket.off("reconnect", onReconnect);
      socket.off("connect", onConnect);
    };
  }, [addIce, applyAnswer, createOffer, setStatus, socket, teardown]);

  useEffect(
    () => () => {
      socket.disconnect();
    },
    [socket]
  );

  const requestCall = () => {
    socket.emit("call_requested", {
      incidentId,
      ownerUserId
    });
    setStatus("ringing");
  };

  return (
    <Card>
      <h3 className="text-lg font-semibold">Call owner</h3>
      <div className="mt-1">
        <Badge label={status} tone={status === "connected" ? "success" : status === "rejected" || status === "missed" ? "danger" : "info"} />
      </div>
      {connectionState !== "connected" ? <p className="mt-1 text-xs text-amber-700">Realtime connection interrupted. Retrying...</p> : null}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {status === "connected" && <p className="text-sm">Timer: {seconds}s</p>}
      <audio ref={remoteAudioRef} autoPlay />
      <div className="mt-3 flex gap-2">
        <Button onClick={requestCall}>Start web call</Button>
        {callId && ownerSocketId && (
          <SecondaryButton
            onClick={() => {
              socket.emit("call_end", { callId, targetSocketId: ownerSocketId });
              teardown();
            }}
          >
            End
          </SecondaryButton>
        )}
      </div>
    </Card>
  );
};
