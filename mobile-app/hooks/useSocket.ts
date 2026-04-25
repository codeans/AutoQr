import { useEffect, useState } from "react";
import { connectSocket, disconnectSocket, onConnectionChange } from "@/services/socket/socket";
import { useAuthStore } from "@/stores/auth.store";

export function useSocket(): { connected: boolean } {
  const [connected, setConnected] = useState(false);
  const status = useAuthStore((s) => s.status);

  useEffect(() => {
    if (status !== "authenticated") {
      disconnectSocket();
      setConnected(false);
      return;
    }
    connectSocket();
    const unsub = onConnectionChange(setConnected);
    return () => {
      unsub();
    };
  }, [status]);

  return { connected };
}
