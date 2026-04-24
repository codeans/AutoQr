import clsx from "clsx";
import {
  AlertTriangle,
  Car,
  CheckCircle2,
  ExternalLink,
  ImageIcon,
  Mic,
  MicOff,
  Phone,
  PhoneIncoming,
  PhoneOff,
  Shield,
  WifiOff,
  X
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOwnerCall } from "./OwnerCallProvider";

const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

export const OwnerCallExperience = () => {
  const {
    state,
    incoming,
    duration,
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
  } = useOwnerCall();

  useIncomingCallRingtone(state === "ringing" && !!incoming);

  return (
    <>
      <audio ref={remoteAudioRef} autoPlay playsInline />

      {connectionState === "reconnecting" && (
        <div className="fixed left-1/2 top-4 z-[70] -translate-x-1/2 rounded-full border border-amber-300/60 bg-amber-50 px-4 py-2 text-[12px] font-medium text-amber-800 shadow-lg">
          <span className="inline-flex items-center gap-2">
            <WifiOff className="h-3.5 w-3.5" /> Reconnecting to call service…
          </span>
        </div>
      )}

      {state === "ringing" && incoming && <IncomingCallBar incoming={incoming} onAccept={acceptCall} onReject={rejectCall} />}

      {(state === "accepting" || state === "connecting" || state === "connected" || state === "ended" || state === "failed" || state === "rejected") && incoming && (
        <ActiveCallOverlay
          state={state}
          duration={duration}
          muted={muted}
          error={error}
          incoming={incoming}
          onEnd={endCall}
          onToggleMute={toggleMute}
          onDismiss={dismissEnded}
        />
      )}

      {missed.length > 0 && <MissedCallTray items={missed} onDismiss={dismissMissed} />}
    </>
  );
};

const useIncomingCallRingtone = (enabled: boolean) => {
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) return;

    const audioContext = audioContextRef.current ?? new AudioContextCtor();
    audioContextRef.current = audioContext;
    let ringTimer: number | undefined;
    let stopped = false;

    const playTone = () => {
      if (stopped || audioContext.state === "closed") return;

      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(720, audioContext.currentTime + 0.18);
      gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.18, audioContext.currentTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.7);
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.75);
    };

    audioContext
      .resume()
      .then(() => {
        playTone();
        ringTimer = window.setInterval(playTone, 1800);
        navigator.vibrate?.([180, 90, 180]);
      })
      .catch(() => undefined);

    return () => {
      stopped = true;
      if (ringTimer) window.clearInterval(ringTimer);
    };
  }, [enabled]);
};

const IncomingCallBar = ({
  incoming,
  onAccept,
  onReject
}: {
  incoming: NonNullable<ReturnType<typeof useOwnerCall>["incoming"]>;
  onAccept: () => void;
  onReject: (reason?: string) => void;
}) => {
  const navigate = useNavigate();
  const phoneDisplay = incoming.reporterPhoneMasked || "Private reporter";

  return (
    <div
      role="dialog"
      aria-live="assertive"
      className="fixed inset-x-0 top-0 z-[80] px-3 pt-3 sm:left-auto sm:right-6 sm:top-6 sm:px-0"
    >
      <div className="mx-auto w-full max-w-md overflow-hidden rounded-2xl border border-emerald-400/30 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white shadow-2xl ring-1 ring-white/10 backdrop-blur">
        <div className="relative px-5 pb-4 pt-5">
          <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-emerald-400/20 blur-3xl" />
          <div className="pointer-events-none absolute -left-24 -bottom-24 h-48 w-48 rounded-full bg-sky-400/10 blur-3xl" />

          <div className="relative flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <span className="absolute inset-0 animate-ping rounded-2xl bg-emerald-400/40" />
                <span className="absolute inset-0 animate-pulse rounded-2xl bg-emerald-400/20" />
                <div className="relative grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500 text-white shadow-lg">
                  <PhoneIncoming className="h-6 w-6" />
                </div>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-200">Incoming incident call</p>
                <p className="mt-0.5 text-[15px] font-semibold">{phoneDisplay || "Unknown caller"}</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-[12px] text-white/60">
                  <Shield className="h-3 w-3" /> Verified via AutoQR tag
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onReject("Dismissed")}
              aria-label="Dismiss incoming call"
              className="rounded-lg p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {(incoming.carLabel || incoming.imageCount) && (
            <div className="relative mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-[12.5px]">
              {incoming.carLabel && (
                <span className="inline-flex items-center gap-1.5 text-white/90">
                  <Car className="h-3.5 w-3.5 text-emerald-300" /> {incoming.carLabel}
                </span>
              )}
              {incoming.imageCount ? (
                <span className="inline-flex items-center gap-1.5 text-white/70">
                  <ImageIcon className="h-3.5 w-3.5" /> {incoming.imageCount} photo{incoming.imageCount === 1 ? "" : "s"}
                </span>
              ) : null}
            </div>
          )}

          {incoming.message && (
            <p className="relative mt-3 line-clamp-2 rounded-xl bg-white/[0.04] px-3 py-2 text-[12.5px] text-white/80">
              “{incoming.message}”
            </p>
          )}

          <div className="relative mt-5 grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => onReject("Owner declined")}
              className="flex items-center justify-center gap-2 rounded-xl bg-white/[0.06] px-4 py-3 text-[14px] font-semibold text-white transition hover:bg-white/[0.12]"
            >
              <PhoneOff className="h-4 w-4" /> Decline
            </button>
            <button
              type="button"
              onClick={onAccept}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-[14px] font-semibold text-white shadow-premium transition hover:bg-emerald-600"
            >
              <Phone className="h-4 w-4" /> Accept
            </button>
          </div>

          {incoming.incidentId && (
            <button
              type="button"
              onClick={() => navigate(`/dashboard/incidents`)}
              className="relative mt-3 inline-flex items-center gap-1.5 text-[12px] text-white/70 transition hover:text-white"
            >
              <ExternalLink className="h-3.5 w-3.5" /> View incident details
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const ActiveCallOverlay = ({
  state,
  duration,
  muted,
  error,
  incoming,
  onEnd,
  onToggleMute,
  onDismiss
}: {
  state: string;
  duration: number;
  muted: boolean;
  error: string;
  incoming: NonNullable<ReturnType<typeof useOwnerCall>["incoming"]>;
  onEnd: () => void;
  onToggleMute: () => void;
  onDismiss: () => void;
}) => {
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    if (state === "ended") setCollapsed(false);
  }, [state]);

  const phoneDisplay = incoming.reporterPhoneMasked || "Caller";

  const stateLabel = (() => {
    switch (state) {
      case "accepting":
        return "Connecting…";
      case "connecting":
        return "Establishing secure line…";
      case "connected":
        return `In call · ${formatDuration(duration)}`;
      case "ended":
        return "Call ended";
      case "rejected":
        return "Call declined";
      case "failed":
        return "Call failed";
      default:
        return "";
    }
  })();

  if (collapsed && state === "connected") {
    return (
      <div className="fixed bottom-4 left-1/2 z-[75] -translate-x-1/2 sm:bottom-6 sm:left-auto sm:right-6 sm:translate-x-0">
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className="group flex items-center gap-3 rounded-full border border-emerald-300/30 bg-emerald-500/95 px-4 py-2.5 text-white shadow-2xl backdrop-blur transition hover:bg-emerald-500"
        >
          <span className="relative grid h-6 w-6 place-items-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-white/50" />
            <Phone className="relative h-4 w-4" />
          </span>
          <span className="text-[13px] font-semibold tabular-nums">{formatDuration(duration)}</span>
          <span className="text-[12px] opacity-80">{phoneDisplay}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-[75] px-3 pb-3 sm:bottom-6 sm:left-auto sm:right-6 sm:px-0">
      <div className="mx-auto w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white shadow-2xl ring-1 ring-white/5 backdrop-blur">
        <div className="flex items-center justify-between border-b border-white/5 px-5 py-3">
          <div className="flex items-center gap-2.5">
            <span
              className={clsx(
                "relative grid h-9 w-9 place-items-center rounded-xl",
                state === "connected" ? "bg-emerald-500 text-white" : "bg-white/[0.06] text-white/80"
              )}
            >
              {state === "connected" && <span className="absolute inset-0 animate-pulse rounded-xl bg-emerald-400/40" />}
              <Phone className="relative h-4 w-4" />
            </span>
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-white/50">Active call</p>
              <p className="text-sm font-semibold">{phoneDisplay}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {state === "connected" && (
              <button
                type="button"
                onClick={() => setCollapsed(true)}
                className="rounded-lg px-2 py-1 text-[12px] text-white/70 transition hover:bg-white/10 hover:text-white"
                title="Minimize"
              >
                Minimize
              </button>
            )}
            {(state === "ended" || state === "rejected" || state === "failed") && (
              <button
                type="button"
                onClick={onDismiss}
                className="rounded-lg p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[12px] font-medium text-white/80">
              {stateLabel}
            </span>
            {incoming.carLabel && (
              <span className="inline-flex items-center gap-1.5 text-[12px] text-white/60">
                <Car className="h-3.5 w-3.5" /> {incoming.carLabel}
              </span>
            )}
          </div>

          {error && (
            <p className="mt-3 inline-flex items-start gap-2 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-[12.5px] text-red-100">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-none" /> {error}
            </p>
          )}

          {(state === "connecting" || state === "accepting") && (
            <p className="mt-3 text-[12.5px] text-white/60">Audio is being set up. Please keep your microphone allowed.</p>
          )}

          {state === "ended" && (
            <p className="mt-3 inline-flex items-center gap-2 text-[12.5px] text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5" /> Call completed · {formatDuration(duration)}
            </p>
          )}

          {state !== "ended" && state !== "rejected" && state !== "failed" && (
            <div className="mt-4 grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={onToggleMute}
                className={clsx(
                  "flex flex-col items-center justify-center gap-1 rounded-xl border px-3 py-2.5 text-[11.5px] font-semibold transition",
                  muted
                    ? "border-amber-400/40 bg-amber-400/10 text-amber-100"
                    : "border-white/10 bg-white/[0.04] text-white/90 hover:border-white/20"
                )}
              >
                {muted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                {muted ? "Unmute" : "Mute"}
              </button>
              <button
                type="button"
                onClick={onEnd}
                className="col-span-1 flex flex-col items-center justify-center gap-1 rounded-xl bg-red-600 px-3 py-2.5 text-[11.5px] font-semibold text-white shadow-premium transition hover:bg-red-700"
              >
                <PhoneOff className="h-4 w-4" />
                End call
              </button>
              <a
                href={`/dashboard/incidents`}
                className="flex flex-col items-center justify-center gap-1 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-center text-[11.5px] font-semibold text-white/90 transition hover:border-white/20"
              >
                <ImageIcon className="h-4 w-4" />
                Incident
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MissedCallTray = ({
  items,
  onDismiss
}: {
  items: ReturnType<typeof useOwnerCall>["missed"];
  onDismiss: (id: string) => void;
}) => (
  <div className="fixed right-4 top-24 z-[60] flex w-full max-w-xs flex-col gap-2 sm:top-24">
    {items.map((m) => (
      <div
        key={m.callId}
        className="flex items-start gap-3 rounded-xl border border-red-200 bg-white px-3 py-2.5 text-[12.5px] shadow-lg"
      >
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-red-100 text-red-600">
          <PhoneOff className="h-4 w-4" />
        </span>
        <div className="flex-1">
          <p className="font-semibold text-slate-900">Missed incident call</p>
          <p className="text-slate-600">
            {m.reporterPhoneMasked || "Unknown caller"}
          </p>
          {m.carLabel && <p className="text-[11.5px] text-slate-500">{m.carLabel}</p>}
        </div>
        <button
          type="button"
          onClick={() => onDismiss(m.callId)}
          className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          aria-label="Dismiss missed-call notice"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    ))}
  </div>
);
