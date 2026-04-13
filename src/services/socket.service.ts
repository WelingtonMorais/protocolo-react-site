import { io, Socket } from "socket.io-client";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? "https://requestwm.vps-kinghost.net/api";

const SOCKET_URL = API_BASE_URL.replace("/api", "");

let socket: Socket | null = null;

export const socketService = {
  connect: (): Socket => {
    if (socket?.connected) return socket;

    const token = localStorage.getItem("token");
    socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      autoConnect: true,
    });

    socket.on("connect", () => {
      if (token) {
        socket?.emit("authenticate", { token });
      }
    });

    return socket;
  },

  disconnect: (): void => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  getSocket: (): Socket | null => socket,

  onPackageCreated: (callback: (data: unknown) => void): void => {
    socket?.on("package:created", callback);
  },

  onPackageDelivered: (callback: (data: unknown) => void): void => {
    socket?.on("package:delivered", callback);
  },

  offPackageCreated: (): void => {
    socket?.off("package:created");
  },

  offPackageDelivered: (): void => {
    socket?.off("package:delivered");
  },
};
