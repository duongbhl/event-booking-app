import api from "./api";
import { authHeader } from "./auHeader";

/**
 * Search users by name or email
 */
export const searchUsers = async (query: string, token: string) => {
  const res = await api.get(`/chat/search?query=${query}`, authHeader(token));
  return res.data;
};

/**
 * Get all chat rooms for current user
 */
export const getMyRooms = async (token: string) => {
  const res = await api.get("/chat/rooms", authHeader(token));
  return res.data;
};

/**
 * Create or get chat room with another user
 */
export const createRoom = async (
  data: {
    memberIds?: string[];
    eventId?: string;
    isGroup?: boolean;
  },
  token: string
) => {
  const res = await api.post("/chat/rooms", data, authHeader(token));
  return res.data;
};

/**
 * Get messages in a chat room
 */
export const getMessages = async (
  roomId: string,
  token: string,
  page: number = 1,
  limit: number = 20
) => {
  const res = await api.get(
    `/chat/rooms/${roomId}/messages?page=${page}&limit=${limit}`,
    authHeader(token)
  );
  return res.data;
};

/**
 * Send message to a room
 */
export const sendMessage = async (
  roomId: string,
  data: {
    content: string;
    type?: "text" | "image" | "file";
    attachments?: string[];
  },
  token: string
) => {
  const res = await api.post(
    `/chat/rooms/${roomId}/messages`,
    data,
    authHeader(token)
  );
  return res.data;
};

/**
 * Get unread message count across all rooms
 */
export const getUnreadMessageCount = async (token: string) => {
  try {
    const rooms = await getMyRooms(token);
    const unreadCount = rooms.reduce((count: number, room: any) => {
      return count + (room.unreadCount || 0);
    }, 0);
    return unreadCount;
  } catch (error) {
    return 0;
  }
};

/**
 * Mark a specific room as read
 */
export const markRoomAsRead = async (
  roomId: string,
  token: string
) => {
  const res = await api.post(
    `/chat/rooms/${roomId}/read`,
    {},
    authHeader(token)
  );
  return res.data;
};
