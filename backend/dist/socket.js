"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitRoomUpdate = exports.emitChatMessage = exports.initializeChatSocket = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const socket_io_1 = require("socket.io");
const user_model_1 = __importDefault(require("./models/user.model"));
dotenv_1.default.config();
let chatIO = null;
const allowedOrigins = (process.env.CORS || "*")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
const initializeChatSocket = (httpServer) => {
    const io = new socket_io_1.Server(httpServer, {
        cors: {
            origin(origin, callback) {
                if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
                    return callback(null, true);
                }
                return callback(new Error("Not allowed by CORS"));
            },
            methods: ["GET", "POST"],
        },
    });
    io.use(async (socket, next) => {
        const token = socket.handshake.auth?.token;
        if (!token || typeof token !== "string") {
            return next(new Error("Unauthorized"));
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.SECRET);
            const user = await user_model_1.default.findById(decoded.id).select("-password");
            if (!user) {
                return next(new Error("User not found"));
            }
            socket.data.user = {
                _id: String(user._id),
            };
            return next();
        }
        catch (error) {
            return next(new Error("Unauthorized"));
        }
    });
    io.on("connection", (socket) => {
        const userId = socket.data.user?._id;
        if (userId) {
            socket.join(`user:${userId}`);
        }
        socket.on("chat:join_room", (roomId) => {
            if (roomId) {
                socket.join(`room:${roomId}`);
            }
        });
        socket.on("chat:leave_room", (roomId) => {
            if (roomId) {
                socket.leave(`room:${roomId}`);
            }
        });
    });
    chatIO = io;
    return io;
};
exports.initializeChatSocket = initializeChatSocket;
const emitChatMessage = (roomId, message) => {
    chatIO?.to(`room:${roomId}`).emit("chat:new_message", {
        roomId,
        message,
    });
};
exports.emitChatMessage = emitChatMessage;
const emitRoomUpdate = (memberIds, payload) => {
    memberIds.forEach((memberId) => {
        chatIO?.to(`user:${memberId}`).emit("chat:room_updated", payload);
    });
};
exports.emitRoomUpdate = emitRoomUpdate;
