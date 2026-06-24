"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markRoomAsRead = exports.getMessages = exports.sendMessage = exports.myRooms = exports.createRoom = exports.searchUsers = void 0;
const chatroom_model_1 = __importDefault(require("../models/chatroom.model"));
const message_model_1 = __importDefault(require("../models/message.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const pushNotification_1 = require("../utils/pushNotification");
const socket_1 = require("../socket");
const searchUsers = async (req, res) => {
    const { query } = req.query;
    if (!query) {
        return res.json([]);
    }
    const users = await user_model_1.default.find({
        $and: [
            { _id: { $ne: req.user._id } },
            { $or: [
                    { name: { $regex: query, $options: 'i' } },
                    { email: { $regex: query, $options: 'i' } }
                ] }
        ]
    }).select('_id name avatar email').limit(10);
    res.json(users);
};
exports.searchUsers = searchUsers;
const createRoom = async (req, res) => {
    const { memberIds = [], eventId, isGroup = false } = req.body;
    const members = Array.from(new Set([String(req.user._id), ...memberIds])).map((id) => id);
    // Check if room already exists for 1-on-1 chat
    if (!isGroup && memberIds.length === 1) {
        const existingRoom = await chatroom_model_1.default.findOne({
            isGroup: false,
            members: { $all: members }
        }).populate('members', 'name avatar');
        if (existingRoom) {
            return res.json(existingRoom);
        }
    }
    const room = await chatroom_model_1.default.create({ members, event: eventId, isGroup });
    await room.populate('members', 'name avatar');
    res.status(201).json(room);
};
exports.createRoom = createRoom;
const myRooms = async (req, res) => {
    const rooms = await chatroom_model_1.default.find({ members: req.user._id })
        .populate('members', 'name avatar email')
        .populate('event', 'title')
        .sort({ updatedAt: -1 });
    // Get unread senders count for each room (instead of message count)
    const roomsWithUnread = await Promise.all(rooms.map(async (room) => {
        // Find all messages from others that current user hasn't read
        const unreadMessages = await message_model_1.default.find({
            room: room._id,
            sender: { $ne: req.user._id },
            readBy: { $nin: [req.user._id] } // Messages where current user hasn't marked as read
        }).select('sender');
        // Get distinct senders of unread messages
        const unreadSenders = new Set();
        unreadMessages.forEach((msg) => {
            unreadSenders.add(msg.sender.toString());
        });
        return { ...room.toObject(), unreadCount: unreadSenders.size };
    }));
    res.json(roomsWithUnread);
};
exports.myRooms = myRooms;
const sendMessage = async (req, res) => {
    const { roomId } = req.params;
    const { content, type = 'text', attachments = [] } = req.body;
    // Create message WITHOUT marking as read - only mark as read when user opens the chat
    const message = await message_model_1.default.create({
        room: roomId,
        sender: req.user._id,
        content,
        type,
        attachments,
        readBy: [] // Empty at first - will be filled when recipient opens chat
    });
    await message.populate('sender', 'name avatar');
    const room = await chatroom_model_1.default.findByIdAndUpdate(roomId, { updatedAt: new Date() }, { new: true }).populate('members', '_id name expoPushToken');
    if (room) {
        (0, socket_1.emitChatMessage)(String(roomId), message);
        (0, socket_1.emitRoomUpdate)(room.members.map((member) => String(member._id)), {
            roomId: String(roomId),
            message,
        });
    }
    // Send push notification to other room members
    try {
        if (room) {
            const senderInfo = await user_model_1.default.findById(req.user._id).select('name');
            for (const member of room.members) {
                // Don't send to sender
                if (String(member._id) !== String(req.user._id) && member.expoPushToken) {
                    await (0, pushNotification_1.sendPushNotification)({
                        to: member.expoPushToken,
                        title: senderInfo?.name || 'New Message',
                        body: content || '[' + type + ']',
                        data: { roomId, messageId: String(message._id) }
                    });
                }
            }
        }
    }
    catch (pushError) {
        console.error('Failed to send push notification:', pushError);
        // Don't fail the message send if push notification fails
    }
    res.status(201).json(message);
};
exports.sendMessage = sendMessage;
const getMessages = async (req, res) => {
    const { roomId } = req.params;
    const { page = '1', limit = '20' } = req.query;
    const items = await message_model_1.default.find({ room: roomId })
        .sort({ createdAt: -1 })
        .skip((+page - 1) * +limit)
        .limit(+limit)
        .populate('sender', 'name avatar')
        .populate('readBy', 'name avatar email'); // Populate readBy with user details
    res.json(items);
};
exports.getMessages = getMessages;
const markRoomAsRead = async (req, res) => {
    const { roomId } = req.params;
    try {
        // Mark all messages in this room as read by the current user
        await message_model_1.default.updateMany({
            room: roomId,
            sender: { $ne: req.user._id }, // Only mark messages from others
            readBy: { $nin: [req.user._id] } // Only update if not already read by this user
        }, {
            $addToSet: { readBy: req.user._id } // Add current user to readBy array
        });
        res.json({ success: true });
    }
    catch (error) {
        console.error('Mark room as read error:', error);
        res.status(500).json({ message: 'Failed to mark room as read' });
    }
};
exports.markRoomAsRead = markRoomAsRead;
