import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  CheckCircle2,
  Info,
  Loader2,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  ShieldCheck,
  Volume2,
  WifiOff,
  X
} from "lucide-react";
import clsx from "clsx";
import { formatGermanPhoneDisplay } from "@autoqr/shared";
import { createReporterCallSocket, signaling } from "./services/callSignaling";
import { fetchReporterIncident, type ReporterIncidentView } from "./services/incidentApi";
import { useWebRtcAudioCall } from "./useWebRtcAudioCall";
import { assetBaseUrl } from "../../lib/runtimeConfig";

type ReporterStatus =
  | "loading"
  | "idle"
  | "requesting_mic"
  | "mic_denied"
  | "connecting"
  | "ringing"
  | "in_call"
  | "ended"
  | "rejected"
  | "missed"
  | "error";

const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

const resolveImageUrl = (path: string) => (path.startsWith("http") ? path : `${assetBaseUrl}${path}`);

export const ReporterCallScreen = () => {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const incidentId = params.get("incidentId") || "";
  const ownerUserId = params.get("ownerUserId") || "";
  const sessionToken = params.get("sessionToken") || "";
  const phoneHint = params.get("phone") || "";
  const autoStart = params.get("autoStart") === "1";
  const autoStartedRef = useRef(false);
  const requestingCallRef = useRef(false);

  const [view, setView] = useState<ReporterIncidentView | null>(null);
  const [reporterStatus, setReporterStatus] = useState<ReporterStatus>("loading");
  const [callId, setCallId] = useState("");
  const [ownerSocketId, setOwnerSocketId] = useState("");
  const [connectionState, setConnectionState] = useState<"connected" | "reconnecting">("connected");
  const [errorMessage, setErrorMessage] = useState("");
  const [galleryOpen, setGalleryOpen] = useState(false);

  const socket = useMemo(() => {
    if (!incidentId || !sessionToken) return null;
    return createReporterCallSocket(incidentId, sessionToken);
  }, [incidentId, sessionToken]);

  const { status: webrtcStatus, setStatus, seconds, error, muted, toggleMute, remoteAudioRef, ensureMicrophone, createOffer, applyAnswer, addIce, teardown, reset } = useWebRtcAudioCall(socket);

  const signalingRef = useRef({ createOffer, applyAnswer, addIce, teardown, t });
  signalingRef.current = { createOffer, applyAnswer, addIce, teardown, t };

  useEffect(() => {
    if (!incidentId || !sessionToken) {
      setReporterStatus("error");
      setErrorMessage(t("call.reporter.missingCredentials"));
      return;
    }
    fetchReporterIncident(incidentId, sessionToken)
      .then((data) => {
        setView(data);
        setReporterStatus("idle");
      })
      .catch(() => {
        setReporterStatus("error");
        setErrorMessage(t("call.reporter.couldNotLoadIncident"));
      });
  }, [incidentId, sessionToken, t]);

  useEffect(() => {
    if (!socket) return;
    const onCallRequested = ({ callId: id }: { callId: string; ownerOnline?: boolean }) => {
      setCallId(id);
      setReporterStatus("ringing");
      requestingCallRef.current = false;
    };
    const onCallAccepted = (payload: { callId: string; ownerSocketId: string }) => {
      setCallId(payload.callId);
      setOwnerSocketId(payload.ownerSocketId);
      setReporterStatus("connecting");
      if (!payload.ownerSocketId) {
        setReporterStatus("error");
        setErrorMessage(signalingRef.current.t("call.reporter.couldNotNegotiate"));
        return;
      }
      const { createOffer: offer, t: tr } = signalingRef.current;
      offer(payload.ownerSocketId, payload.callId).catch(() => {
        setReporterStatus("error");
        setErrorMessage(tr("call.reporter.couldNotNegotiate"));
      });
    };
    const onCallStarted = () => setReporterStatus("in_call");
    const onCallRejected = () => {
      setReporterStatus("rejected");
      signalingRef.current.teardown();
    };
    const onCallMissed = () => {
      setReporterStatus("missed");
      signalingRef.current.teardown();
    };
    const onCallCancelled = () => {
      setReporterStatus("ended");
      signalingRef.current.teardown();
    };
    const onWebRtcAnswer = ({ answer }: { answer: RTCSessionDescriptionInit }) => {
      void signalingRef.current.applyAnswer(answer).then(() => {
        setReporterStatus((s) => (s === "connecting" ? "in_call" : s));
      });
    };
    const onWebRtcCandidate = ({ candidate }: { candidate: RTCIceCandidateInit }) => {
      void signalingRef.current.addIce(candidate);
    };
    const onCallEnded = () => {
      signalingRef.current.teardown();
      setReporterStatus("ended");
    };
    const onConnectError = () => setConnectionState("reconnecting");
    const onReconnect = () => setConnectionState("connected");
    const onConnect = () => setConnectionState("connected");

    socket.on("call_requested", onCallRequested);
    socket.on("call_accepted", onCallAccepted);
    socket.on("call_started", onCallStarted);
    socket.on("call_rejected", onCallRejected);
    socket.on("call_missed", onCallMissed);
    socket.on("call_cancelled", onCallCancelled);
    socket.on("call_ended", onCallEnded);
    socket.on("webrtc_answer", onWebRtcAnswer);
    socket.on("webrtc_ice_candidate", onWebRtcCandidate);
    socket.on("connect_error", onConnectError);
    socket.on("disconnect", onConnectError);
    socket.on("reconnect", onReconnect);
    socket.on("connect", onConnect);

    const connectTimer = window.setTimeout(() => {
      if (!socket.connected) socket.connect();
      else setConnectionState("connected");
    }, 0);

    return () => {
      window.clearTimeout(connectTimer);
      socket.off("call_requested", onCallRequested);
      socket.off("call_accepted", onCallAccepted);
      socket.off("call_started", onCallStarted);
      socket.off("call_rejected", onCallRejected);
      socket.off("call_missed", onCallMissed);
      socket.off("call_cancelled", onCallCancelled);
      socket.off("call_ended", onCallEnded);
      socket.off("webrtc_answer", onWebRtcAnswer);
      socket.off("webrtc_ice_candidate", onWebRtcCandidate);
      socket.off("connect_error", onConnectError);
      socket.off("disconnect", onConnectError);
      socket.off("reconnect", onReconnect);
      socket.off("connect", onConnect);
    };
  }, [socket]);

  useEffect(
    () => () => {
      socket?.disconnect();
    },
    [socket]
  );

  const startCall = async () => {
    if (!socket) return;
    if (requestingCallRef.current) return;
    if (reporterStatus === "ringing" || reporterStatus === "connecting" || reporterStatus === "in_call") return;
    requestingCallRef.current = true;
    setErrorMessage("");
    setReporterStatus("requesting_mic");
    try {
      await ensureMicrophone();
    } catch {
      setReporterStatus("mic_denied");
      requestingCallRef.current = false;
      return;
    }
    setReporterStatus("connecting");
    signaling.requestCall(socket, { ownerUserId, incidentId, platform: "web" });
    window.setTimeout(() => {
      requestingCallRef.current = false;
    }, 1000);
  };

  useEffect(() => {
    if (!autoStart || autoStartedRef.current || reporterStatus !== "idle" || !view) return;
    autoStartedRef.current = true;
    void startCall();
  }, [autoStart, reporterStatus, view]);

  const endCall = () => {
    requestingCallRef.current = false;
    if (socket && callId) {
      if (reporterStatus === "ringing") {
        signaling.cancelCall(socket, callId);
      } else {
        signaling.endCall(socket, callId, ownerSocketId || undefined, "reporter_ended");
      }
    }
    teardown();
    setReporterStatus("ended");
  };

  const retry = () => {
    requestingCallRef.current = false;
    reset();
    setStatus("idle");
    setErrorMessage("");
    setReporterStatus("idle");
    setCallId("");
    setOwnerSocketId("");
  };

  const closeWindow = () => {
    try {
      window.close();
    } catch {
      /* ignore */
    }
  };

  const phoneDisplay = view?.incident.reporterPhone
    ? formatGermanPhoneDisplay(view.incident.reporterPhone)
    : phoneHint
    ? formatGermanPhoneDisplay(phoneHint)
    : "";

  const carLabel = view?.incident.car
    ? [view.incident.car.nickname, [view.incident.car.make, view.incident.car.model].filter(Boolean).join(" ")]
        .filter(Boolean)
        .join(" · ")
    : t("call.reporter.vehicleOwnerFallback");

  const callStateBadge = (() => {
    switch (reporterStatus) {
      case "loading":
        return { text: t("call.reporter.statusPreparing"), tone: "info" as const };
      case "idle":
        return { text: t("call.reporter.statusReady"), tone: "neutral" as const };
      case "requesting_mic":
        return { text: t("call.reporter.statusWaitingMic"), tone: "warn" as const };
      case "mic_denied":
        return { text: t("call.reporter.statusMicBlocked"), tone: "error" as const };
      case "connecting":
        return { text: t("call.reporter.statusConnecting"), tone: "info" as const };
      case "ringing":
        return { text: t("call.reporter.statusRinging"), tone: "info" as const };
      case "in_call":
        return {
          text: t("call.reporter.statusInCall", { duration: formatDuration(seconds) }),
          tone: "success" as const
        };
      case "ended":
        return { text: t("call.reporter.statusEnded"), tone: "neutral" as const };
      case "rejected":
        return { text: t("call.reporter.statusOwnerUnable"), tone: "warn" as const };
      case "missed":
        return { text: t("call.reporter.statusOwnerUnavailable"), tone: "warn" as const };
      case "error":
        return { text: t("call.reporter.statusError"), tone: "error" as const };
    }
  })();

  return (
    <main className="min-h-[100dvh] bg-ink-950 bg-noise text-fog-50">
      <audio ref={remoteAudioRef} autoPlay playsInline />

      <div className="mx-auto flex min-h-[100dvh] max-w-xl flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-white/5 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-accent/15 text-accent">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-fog-400">{t("call.reporter.header")}</p>
              <p className="text-sm font-semibold text-fog-100">{t("call.reporter.subheader")}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeWindow}
            aria-label={t("call.reporter.closeAria")}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-fog-300 transition hover:border-white/20 hover:text-fog-100"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <section className="flex flex-1 flex-col items-center justify-start gap-6 px-5 py-8 sm:px-8 sm:py-10">
          <CallAvatar status={reporterStatus} />

          <div className="text-center">
            <p className="text-[12px] uppercase tracking-[0.22em] text-fog-400">{t("call.reporter.connectingTo")}</p>
            <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-fog-50 sm:text-3xl">
              {carLabel}
            </h1>
            {phoneDisplay && (
              <p className="mt-1 text-[13px] text-fog-400">{t("call.reporter.fromPhone", { phone: phoneDisplay })}</p>
            )}
          </div>

          <StatusPill text={callStateBadge.text} tone={callStateBadge.tone} />

          {connectionState !== "connected" && (
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-[12px] text-amber-200">
              <WifiOff className="h-3.5 w-3.5" /> {t("call.reporter.reconnecting")}
            </div>
          )}

          {(error || errorMessage) && (
            <div className="w-full rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-[13px] text-red-200">
              {error || errorMessage}
            </div>
          )}

          {view && (
            <div className="w-full space-y-3">
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-fog-400">{t("call.reporter.yourReport")}</p>
                <p className="mt-2 whitespace-pre-wrap text-[13.5px] leading-relaxed text-fog-200">
                  {view.incident.message}
                </p>
                {view.incident.images.length > 0 && (
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => setGalleryOpen(true)}
                      className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[12.5px] text-fog-200 transition hover:border-white/20"
                    >
                      {view.incident.images.length === 1
                        ? t("call.reporter.viewPhotoOne")
                        : t("call.reporter.viewPhotoMany", { count: view.incident.images.length })}
                    </button>
                    <div className="mt-3 flex gap-2 overflow-x-auto">
                      {view.incident.images.map((img, idx) => (
                        <button
                          key={img + idx}
                          type="button"
                          onClick={() => setGalleryOpen(true)}
                          className="h-16 w-16 flex-none overflow-hidden rounded-lg border border-white/10 bg-white/[0.05]"
                        >
                          <img
                            src={resolveImageUrl(img)}
                            alt={t("call.reporter.incidentPhotoAlt", { index: idx + 1 })}
                            className="h-full w-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        <footer className="sticky bottom-0 border-t border-white/5 bg-ink-950/90 px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-5 backdrop-blur sm:px-8">
          <ReporterCallControls
            status={reporterStatus}
            muted={muted}
            onStart={startCall}
            onEnd={endCall}
            onToggleMute={toggleMute}
            onRetry={retry}
            onClose={closeWindow}
          />
        </footer>
      </div>

      {galleryOpen && view && (
        <GalleryOverlay images={view.incident.images.map(resolveImageUrl)} onClose={() => setGalleryOpen(false)} />
      )}
    </main>
  );
};

const StatusPill = ({ text, tone }: { text: string; tone: "neutral" | "info" | "success" | "warn" | "error" }) => {
  const toneMap: Record<string, string> = {
    neutral: "border-white/10 bg-white/[0.03] text-fog-200",
    info: "border-sky-400/30 bg-sky-400/10 text-sky-200",
    success: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
    warn: "border-amber-400/30 bg-amber-400/10 text-amber-200",
    error: "border-red-500/30 bg-red-500/10 text-red-200"
  };
  return <span className={clsx("inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium", toneMap[tone])}>{text}</span>;
};

const CallAvatar = ({ status }: { status: ReporterStatus }) => {
  const pulsing = status === "ringing" || status === "connecting" || status === "requesting_mic";
  const connected = status === "in_call";
  return (
    <div className="relative mt-2">
      {pulsing && (
        <>
          <span className="absolute inset-0 -m-4 animate-ping rounded-full bg-accent/20" />
          <span className="absolute inset-0 -m-2 animate-pulse rounded-full bg-accent/30" />
        </>
      )}
      {connected && <span className="absolute inset-0 -m-3 rounded-full bg-emerald-400/20 blur-md" />}
      <div
        className={clsx(
          "relative grid h-28 w-28 place-items-center rounded-full border text-accent shadow-glow transition sm:h-32 sm:w-32",
          connected ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300" : "border-accent/30 bg-accent/5"
        )}
      >
        <Phone className="h-12 w-12" />
      </div>
    </div>
  );
};

const ReporterCallControls = ({
  status,
  muted,
  onStart,
  onEnd,
  onToggleMute,
  onRetry,
  onClose
}: {
  status: ReporterStatus;
  muted: boolean;
  onStart: () => void;
  onEnd: () => void;
  onToggleMute: () => void;
  onRetry: () => void;
  onClose: () => void;
}) => {
  const { t } = useTranslation();
  if (status === "idle") {
    return (
      <div className="space-y-3">
        <button
          type="button"
          onClick={onStart}
          className="flex w-full items-center justify-center gap-3 rounded-2xl bg-emerald-500 px-5 py-4 text-[15px] font-semibold text-white shadow-premium transition hover:bg-emerald-600"
        >
          <Phone className="h-5 w-5" /> {t("call.reporter.connectToVehicleOwner")}
        </button>
        <p className="flex items-start gap-2 text-center text-[12px] text-fog-400">
          <Info className="mt-0.5 h-3.5 w-3.5 flex-none" />
          <span>{t("call.reporter.micNotice")}</span>
        </p>
      </div>
    );
  }

  if (status === "requesting_mic" || status === "loading" || status === "connecting") {
    return (
      <div className="flex items-center justify-center gap-3 rounded-2xl bg-white/[0.04] px-5 py-4 text-[14px] text-fog-200">
        <Loader2 className="h-5 w-5 animate-spin" />
        {status === "requesting_mic"
          ? t("call.reporter.waitingMicPermission")
          : status === "loading"
          ? t("call.reporter.preparing")
          : t("call.reporter.connectingShort")}
      </div>
    );
  }

  if (status === "mic_denied") {
    return (
      <div className="space-y-3">
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-[13px] text-red-100">
          <p className="font-semibold">{t("call.reporter.micRequiredTitle")}</p>
          <p className="mt-1 text-red-200/80">{t("call.reporter.micRequiredBody")}</p>
        </div>
        <button
          type="button"
          onClick={onRetry}
          className="flex w-full items-center justify-center gap-3 rounded-2xl bg-emerald-500 px-5 py-4 text-[15px] font-semibold text-white shadow-premium transition hover:bg-emerald-600"
        >
          <Phone className="h-5 w-5" /> {t("call.reporter.tryAgain")}
        </button>
      </div>
    );
  }

  if (status === "ringing") {
    return (
      <button
        type="button"
        onClick={onEnd}
        className="flex w-full items-center justify-center gap-3 rounded-2xl bg-red-600 px-5 py-4 text-[15px] font-semibold text-white shadow-premium transition hover:bg-red-700"
      >
        <PhoneOff className="h-5 w-5" /> {t("call.reporter.cancelCall")}
      </button>
    );
  }

  if (status === "in_call") {
    return (
      <div className="grid grid-cols-3 gap-3">
        <button
          type="button"
          onClick={onToggleMute}
          className={clsx(
            "flex flex-col items-center justify-center gap-1 rounded-2xl border px-3 py-3 text-[12px] font-semibold transition",
            muted
              ? "border-amber-400/40 bg-amber-400/10 text-amber-100"
              : "border-white/10 bg-white/[0.04] text-fog-100 hover:border-white/20"
          )}
        >
          {muted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          {muted ? t("call.reporter.unmute") : t("call.reporter.mute")}
        </button>
        <button
          type="button"
          onClick={onEnd}
          className="col-span-1 flex flex-col items-center justify-center gap-1 rounded-2xl bg-red-600 px-3 py-3 text-[12px] font-semibold text-white shadow-premium transition hover:bg-red-700"
        >
          <PhoneOff className="h-5 w-5" />
          {t("call.reporter.end")}
        </button>
        <div className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3 text-[12px] font-semibold text-fog-100">
          <Volume2 className="h-5 w-5" />
          <span>{t("call.reporter.speaker")}</span>
        </div>
      </div>
    );
  }

  // ended / rejected / missed / error
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-[13px] text-fog-200">
        <CheckCircle2 className="h-4 w-4 text-accent" />
        {status === "rejected"
          ? t("call.reporter.rejectedBody")
          : status === "missed"
          ? t("call.reporter.missedBody")
          : status === "error"
          ? t("call.reporter.errorBody")
          : t("call.reporter.endedBody")}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onRetry}
          className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-[14px] font-semibold text-fog-100 transition hover:border-white/25"
        >
          {t("call.reporter.callAgain")}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-2xl bg-emerald-500 px-4 py-3 text-[14px] font-semibold text-white shadow-premium transition hover:bg-emerald-600"
        >
          {t("call.reporter.close")}
        </button>
      </div>
    </div>
  );
};

const GalleryOverlay = ({ images, onClose }: { images: string[]; onClose: () => void }) => {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/90 p-4">
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/[0.05] text-white hover:bg-white/[0.1]"
        aria-label={t("call.reporter.closeGalleryAria")}
      >
        <X className="h-5 w-5" />
      </button>
      <div className="grid max-h-[90vh] w-full max-w-3xl gap-3 overflow-y-auto">
        {images.map((img, idx) => (
          <img
            key={idx}
            src={img}
            alt={t("call.reporter.incidentPhotoFullAlt", { index: idx + 1 })}
            className="w-full rounded-xl border border-white/10"
          />
        ))}
      </div>
    </div>
  );
};
