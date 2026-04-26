import { useEffect } from "react";
import { router } from "expo-router";
import { useAuthStore } from "@/stores/auth.store";
import { useCallStore } from "@/stores/call.store";
import { useCallActions } from "@/hooks/useCallActions";
import { callsService } from "@/services/api/calls.service";
import { nativeCallService } from "@/services/calls/nativeCallService";
import type { IncomingCall } from "@/types/call";

async function hydrateIncoming(callId: string): Promise<IncomingCall | null> {
  const current = useCallStore.getState().incoming;
  if (current?.callId === callId) return current;
  try {
    const { call } = await callsService.get(callId);
    if (!call?.callId) return null;
    useCallStore.getState().setIncoming(call);
    return call;
  } catch {
    return null;
  }
}

export function useNativeCallHandlers(): void {
  const status = useAuthStore((s) => s.status);
  const { acceptIncoming, rejectIncoming, end } = useCallActions();

  useEffect(() => {
    if (status !== "authenticated") return;
    nativeCallService.setupNativeCalling().catch(() => undefined);
    nativeCallService.registerNativeTokens().catch(() => undefined);

    return nativeCallService.registerEventHandlers({
      onIncomingPayload: (incoming) => {
        useCallStore.getState().setIncoming(incoming);
      },
      onAnswer: (callId) => {
        hydrateIncoming(callId)
          .then((incoming) => {
            if (!incoming) return;
            router.push("/call/active");
            return acceptIncoming(incoming);
          })
          .catch(() => undefined);
      },
      onEnd: (callId) => {
        const state = useCallStore.getState();
        const current = state.incoming?.callId === callId ? state.incoming : null;
        if (state.status === "ringing" && current) {
          rejectIncoming(current, "owner_rejected");
          return;
        }
        end();
      }
    });
  }, [acceptIncoming, end, rejectIncoming, status]);
}
