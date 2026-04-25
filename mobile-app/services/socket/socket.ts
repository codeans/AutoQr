import { io, Socket } from "socket.io-client";
import { AppState, type AppStateStatus } from "react-native";
import { config } from "@/constants/config";
import { getAccessToken, subscribeToAccessToken } from "@/services/api/client";

type ConnectionListener = (connected: boolean) => void;

let socket: Socket | null = null;
const connectionListeners = new Set<ConnectionListener>();
let unsubTokenWatcher: (() => void) | null = null;
let appStateSub: { remove: () => void } | null = null;
let lastAppState: AppStateStatus = AppState.currentState;

function notifyConnection(connected: boolean): void {
  connectionListeners.forEach((cb) => cb(connected));
}

function createSocket(token: string): Socket {
  const instance = io(config.socketUrl, {
    transports: ["websocket"],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1500,
    reconnectionDelayMax: 10000,
    timeout: 15000,
    auth: { token }
  });

  instance.on("connect", () => notifyConnection(true));
  instance.on("connect", () => {
    console.info("[AutoQr] socket connected", { url: config.socketUrl });
    console.info("[AutoQr] joined owner room");
  });
  instance.on("disconnect", () => notifyConnection(false));
  instance.on("connect_error", () => notifyConnection(false));

  return instance;
}

function ensureAppStateWatcher(): void {
  if (appStateSub) return;
  appStateSub = AppState.addEventListener("change", (next) => {
    // On return to foreground, kick the socket to reconnect if it dropped in background
    const wasBackground = lastAppState.match(/inactive|background/);
    const isForeground = next === "active";
    lastAppState = next;
    if (wasBackground && isForeground && socket && !socket.connected) {
      socket.connect();
    }
  });
}

export function connectSocket(): Socket | null {
  const token = getAccessToken();
  if (!token) return null;
  if (socket && socket.connected) return socket;
  if (socket) {
    socket.auth = { token };
    socket.connect();
    ensureAppStateWatcher();
    return socket;
  }
  socket = createSocket(token);
  ensureAppStateWatcher();

  if (!unsubTokenWatcher) {
    unsubTokenWatcher = subscribeToAccessToken((next) => {
      if (!next) {
        disconnectSocket();
      } else if (socket) {
        // Token rotated — reconnect with new token
        socket.auth = { token: next };
        if (!socket.connected) socket.connect();
      }
    });
  }

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
  if (appStateSub) {
    appStateSub.remove();
    appStateSub = null;
  }
  if (unsubTokenWatcher) {
    unsubTokenWatcher();
    unsubTokenWatcher = null;
  }
  notifyConnection(false);
}

export function getSocket(): Socket | null {
  return socket;
}

export function onConnectionChange(listener: ConnectionListener): () => void {
  connectionListeners.add(listener);
  listener(Boolean(socket?.connected));
  return () => {
    connectionListeners.delete(listener);
  };
}

/**
 * Register a set of socket event handlers in one call, returning a single cleanup function that
 * removes every listener it registered. This prevents duplicate listener bugs in useEffect teardown.
 */
export function registerSocketHandlers(
  handlers: Record<string, (payload: any) => void>
): () => void {
  const sock = getSocket();
  if (!sock) return () => undefined;
  const entries = Object.entries(handlers);
  entries.forEach(([event, handler]) => sock.on(event, handler));
  return () => {
    entries.forEach(([event, handler]) => sock.off(event, handler));
  };
}
