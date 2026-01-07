import { Request, Response } from 'express';
import Notification from '../models/notification.model';
import Event from '../models/event.model';



export const listNotifications = async (req: any, res: Response) => {
    const items = await Notification.find({ user: req.user!._id })
        .populate('fromUser', 'name avatar')
        .populate({
            path: 'event',
            select: 'title images date location price description member status organizer',
            populate: {
                path: 'organizer',
                select: 'name avatar email'
            }
        })
        .sort('-createdAt');
    res.json(items);
};


export const markRead = async (req: any, res: Response) => {
    await Notification.updateMany({ user: req.user!._id, isRead: false }, { isRead: true });
    res.json({ success: true });
};


export const deleteNotification = async (req: any, res: Response) => {
    const { notificationId } = req.params as { notificationId: string };

    try {
        const notification = await Notification.findById(notificationId);
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        if (String(notification.user) !== String(req.user!._id)) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        await Notification.findByIdAndDelete(notificationId);
        res.json({ success: true });
    } catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({ message: 'Failed to delete notification' });
    }
};


export const sendInvitation = async (req: any, res: Response) => {
    try {
        const { userIds = [], eventId } = req.body as { userIds: string[]; eventId: string };

        if (!eventId || userIds.length === 0) {
            return res.status(400).json({ message: 'eventId and userIds are required' });
        }

        const event = await Event.findById(eventId).select('title organizer');
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Create notifications for each invited user
        const notifications = await Notification.insertMany(
            userIds.map((userId) => ({
                user: userId,
                fromUser: req.user!._id,
                event: eventId,
                title: 'Event Invitation',
                message: `${req.user!.name} invited you to "${event.title}"`,
                type: 'invitation',
                isRead: false,
            }))
        );

        res.status(201).json(notifications);
    } catch (error) {
        console.error('Send invitation error:', error);
        res.status(500).json({ message: 'Failed to send invitation' });
    }
};