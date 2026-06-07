import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { Server as HTTPServer } from "http";
import { Server, Socket } from "socket.io";
import User from "./models/user.model";
import { JWTPayload } from "./middleware/auth.middleware";

dotenv.config();

let chatIO: Server | null = null;

type AuthenticatedSocket = Socket & {
  data: {
    user?: {
      _id: string;
    };
  };
};

export const initializeChatSocket = (httpServer: HTTPServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS,
      methods: ["GET", "POST"],
    },
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token || typeof token !== "string") {
      return next(new Error("Unauthorized"));
    }

    try {
      const decoded = jwt.verify(token, process.env.SECRET as string) as JWTPayload;
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return next(new Error("User not found"));
      }

      (socket as AuthenticatedSocket).data.user = {
        _id: String(user._id),
      };

      return next();
    } catch (error) {
      return next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket: AuthenticatedSocket) => {
    const userId = socket.data.user?._id;

    if (userId) {
      socket.join(`user:${userId}`);
    }

    socket.on("chat:join_room", (roomId: string) => {
      if (roomId) {
        socket.join(`room:${roomId}`);
      }
    });

    socket.on("chat:leave_room", (roomId: string) => {
      if (roomId) {
        socket.leave(`room:${roomId}`);
      }
    });
  });

  chatIO = io;
  return io;
};

export const emitChatMessage = (roomId: string, message: any) => {
  chatIO?.to(`room:${roomId}`).emit("chat:new_message", {
    roomId,
    message,
  });
};

export const emitRoomUpdate = (memberIds: string[], payload: any) => {
  memberIds.forEach((memberId) => {
    chatIO?.to(`user:${memberId}`).emit("chat:room_updated", payload);
  });
};