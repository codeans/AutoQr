import { io, type Socket } from "socket.io-client";
import { socketBaseUrl } from "./runtimeConfig";

const baseOptions = {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 8,
  reconnectionDelay: 1000,
  transports: ["websocket", "polling"] as ("websocket" | "polling")[]
};

export const connectAuthSocket = (token: string) =>
  io(socketBaseUrl, {
    ...baseOptions,
    auth: { token }
  });

export const connectReporterSocket = (incidentToken: string): Socket =>
  io(socketBaseUrl, {
    ...baseOptions,
    auth: { incidentToken }
  });
