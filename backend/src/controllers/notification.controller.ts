import { Request, Response } from 'express';
import Notification from '../models/notification.model';



export const listNotifications = async (req: any, res: Response) => {
    const items = await Notification.find({ user: req.user!._id }).sort('-createdAt');
    res.json(items);
};


export const markRead = async (req: any, res: Response) => {
    await Notification.updateMany({ user: req.user!._id, isRead: false }, { isRead: true });
    res.json({ success: true });
};