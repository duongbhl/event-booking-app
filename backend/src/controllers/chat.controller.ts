import {Response } from 'express';
import ChatRoom from '../models/chatroom.model';
import Message from '../models/message.model';
import User from '../models/user.model';


export const searchUsers = async (req: any, res: Response) => {
    const { query } = req.query as { query: string };
    if (!query) {
        return res.json([]);
    }
    const users = await User.find({
        $and: [
            { _id: { $ne: req.user!._id } },
            { $or: [
                { name: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } }
            ]}
        ]
    }).select('_id name avatar email').limit(10);
    res.json(users);
};

export const createRoom = async (req: any, res: Response) => {
    const { memberIds = [], eventId, isGroup = false } = req.body as { memberIds?: string[]; eventId?: string; isGroup?: boolean };
    const members = Array.from(new Set([String(req.user!._id), ...memberIds])).map((id) => id);
    
    // Check if room already exists for 1-on-1 chat
    if (!isGroup && memberIds.length === 1) {
        const existingRoom = await ChatRoom.findOne({
            isGroup: false,
            members: { $all: members }
        }).populate('members', 'name avatar');
        if (existingRoom) {
            return res.json(existingRoom);
        }
    }
    
    const room = await ChatRoom.create({ members, event: eventId, isGroup });
    await room.populate('members', 'name avatar');
    res.status(201).json(room);
};


export const myRooms = async (req: any, res: Response) => {
    const rooms = await ChatRoom.find({ members: req.user!._id })
        .populate('members', 'name avatar email')
        .populate('event', 'title')
        .sort({ updatedAt: -1 });
    
    // Add unread count for each room
    const roomsWithUnread = await Promise.all(
        rooms.map(async (room: any) => {
            const unreadCount = await Message.countDocuments({
                room: room._id,
                sender: { $ne: req.user!._id },
                // Assuming there's a way to track read status, for now count all messages from others
            });
            return { ...room.toObject(), unreadCount };
        })
    );
    
    res.json(roomsWithUnread);
};


export const sendMessage = async (req: any, res: Response) => {
    const { roomId } = req.params as { roomId: string };
    const { content, type = 'text', attachments = [] } = req.body as { content?: string; type?: 'text' | 'image' | 'file'; attachments?: string[] };
    const message = await Message.create({ room: roomId, sender: req.user!._id, content, type, attachments });
    
    // Update room's updatedAt
    await ChatRoom.findByIdAndUpdate(roomId, { updatedAt: new Date() });
    
    await message.populate('sender', 'name avatar');
    res.status(201).json(message);
};


export const getMessages = async (req: any, res: Response) => {
    const { roomId } = req.params as { roomId: string };
    const { page = '1', limit = '20' } = req.query as Record<string, string>;
    const items = await Message.find({ room: roomId })
        .sort({ createdAt: -1 })
        .skip((+page - 1) * +limit)
        .limit(+limit)
        .populate('sender', 'name avatar');
    res.json(items);
};

export const markRoomAsRead = async (req: any, res: Response) => {
    const { roomId } = req.params as { roomId: string };
    
    try {
        // Mark all messages in this room as read for this user
        // In this simple implementation, we just return success
        // For a proper implementation, we'd need a readBy field in Message model
        res.json({ success: true });
    } catch (error) {
        console.error('Mark room as read error:', error);
        res.status(500).json({ message: 'Failed to mark room as read' });
    }
};