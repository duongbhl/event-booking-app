import {Response } from 'express';
import ChatRoom from '../models/chatroom.model';
import Message from '../models/message.model';



export const createRoom = async (req: any, res: Response) => {
    const { memberIds = [], eventId, isGroup = false } = req.body as { memberIds?: string[]; eventId?: string; isGroup?: boolean };
    const members = Array.from(new Set([String(req.user!._id), ...memberIds])).map((id) => id);
    const room = await ChatRoom.create({ members, event: eventId, isGroup });
    res.status(201).json(room);
};


export const myRooms = async (req: any, res: Response) => {
    const rooms = await ChatRoom.find({ members: req.user!._id }).populate('event');
    res.json(rooms);
};


export const sendMessage = async (req: any, res: Response) => {
    const { roomId } = req.params as { roomId: string };
    const { content, type = 'text', attachments = [] } = req.body as { content?: string; type?: 'text' | 'image' | 'file'; attachments?: string[] };
    const message = await Message.create({ room: roomId, sender: req.user!._id, content, type, attachments });
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