import {Response } from 'express';
import ChatRoom from '../models/chatroom.model';
import Message from '../models/message.model';
import User from '../models/user.model';
import { sendPushNotification } from '../utils/pushNotification';
import { emitChatMessage, emitRoomUpdate } from '../socket';


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
    
    // Get unread senders count for each room (instead of message count)
    const roomsWithUnread = await Promise.all(
        rooms.map(async (room: any) => {
            // Find all messages from others that current user hasn't read
            const unreadMessages = await Message.find({
                room: room._id,
                sender: { $ne: req.user!._id },
                readBy: { $nin: [req.user!._id] } // Messages where current user hasn't marked as read
            }).select('sender');
            
            // Get distinct senders of unread messages
            const unreadSenders = new Set<string>();
            unreadMessages.forEach((msg: any) => {
                unreadSenders.add(msg.sender.toString());
            });
            
            return { ...room.toObject(), unreadCount: unreadSenders.size };
        })
    );
    
    res.json(roomsWithUnread);
};


export const sendMessage = async (req: any, res: Response) => {
    const { roomId } = req.params as { roomId: string };
    const { content, type = 'text', attachments = [] } = req.body as { content?: string; type?: 'text' | 'image' | 'file'; attachments?: string[] };
    
    // Create message WITHOUT marking as read - only mark as read when user opens the chat
    const message = await Message.create({ 
        room: roomId, 
        sender: req.user!._id, 
        content, 
        type, 
        attachments,
        readBy: [] // Empty at first - will be filled when recipient opens chat
    });
    
    await message.populate('sender', 'name avatar');

    const room = await ChatRoom.findByIdAndUpdate(
        roomId,
        { updatedAt: new Date() },
        { new: true }
    ).populate('members', '_id name expoPushToken');

    if (room) {
        emitChatMessage(String(roomId), message);
        emitRoomUpdate(
            room.members.map((member: any) => String(member._id)),
            {
                roomId: String(roomId),
                message,
            }
        );
    }

    // Send push notification to other room members
    try {
        if (room) {
            const senderInfo = await User.findById(req.user!._id).select('name');

            for (const member of room.members) {
                // Don't send to sender
                if (String(member._id) !== String(req.user!._id) && (member as any).expoPushToken) {
                    await sendPushNotification({
                        to: (member as any).expoPushToken,
                        title: senderInfo?.name || 'New Message',
                        body: content || '[' + type + ']',
                        data: { roomId, messageId: String(message._id) }
                    });
                }
            }
        }
    } catch (pushError) {
        console.error('Failed to send push notification:', pushError);
        // Don't fail the message send if push notification fails
    }
    
    res.status(201).json(message);
};


export const getMessages = async (req: any, res: Response) => {
    const { roomId } = req.params as { roomId: string };
    const { page = '1', limit = '20' } = req.query as Record<string, string>;
    const items = await Message.find({ room: roomId })
        .sort({ createdAt: -1 })
        .skip((+page - 1) * +limit)
        .limit(+limit)
        .populate('sender', 'name avatar')
        .populate('readBy', 'name avatar email'); // Populate readBy with user details
    res.json(items);
};

export const markRoomAsRead = async (req: any, res: Response) => {
    const { roomId } = req.params as { roomId: string };
    
    try {
        // Mark all messages in this room as read by the current user
        await Message.updateMany(
            {
                room: roomId,
                sender: { $ne: req.user!._id }, // Only mark messages from others
                readBy: { $nin: [req.user!._id] } // Only update if not already read by this user
            },
            {
                $addToSet: { readBy: req.user!._id } // Add current user to readBy array
            }
        );
        
        res.json({ success: true });
    } catch (error) {
        console.error('Mark room as read error:', error);
        res.status(500).json({ message: 'Failed to mark room as read' });
    }
};