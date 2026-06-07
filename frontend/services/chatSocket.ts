import { io, Socket } from "socket.io-client";
import { API_BASE_URL } from "./api";

export type ChatNewMessageEvent = {
  roomId: string;
  message: any;
};

export type ChatRoomUpdatedEvent = {
  roomId: string;
  message: any;
};

let socket: Socket | null = null;
let activeToken: string | null = null;

export const getChatSocket = (token: string) => {
  if (!socket || activeToken !== token) {
    if (socket) {
      socket.disconnect();
    }

    socket = io(API_BASE_URL, {
      autoConnect: false,
      transports: ["websocket"],
      auth: {
        token,
      },
      reconnection: true,
      reconnectionAttempts: 5,
    });

    activeToken = token;
  }

  if (!socket.connected) {
    socket.connect();
  }

  return socket;
};

export const resetChatSocket = () => {
  socket?.disconnect();
  socket = null;
  activeToken = null;
};