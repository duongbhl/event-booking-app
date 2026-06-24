"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendInvitation = exports.deleteNotification = exports.markSelectedRead = exports.markRead = exports.listNotifications = void 0;
const notification_model_1 = __importDefault(require("../models/notification.model"));
const event_model_1 = __importDefault(require("../models/event.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const pushNotification_1 = require("../utils/pushNotification");
const listNotifications = async (req, res) => {
    const items = await notification_model_1.default.find({ user: req.user._id })
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
exports.listNotifications = listNotifications;
const markRead = async (req, res) => {
    await notification_model_1.default.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
    res.json({ success: true });
};
exports.markRead = markRead;
const markSelectedRead = async (req, res) => {
    try {
        const { notificationIds = [] } = req.body;
        if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
            return res.status(400).json({ message: 'notificationIds are required' });
        }
        await notification_model_1.default.updateMany({
            _id: { $in: notificationIds },
            user: req.user._id,
        }, { isRead: true });
        res.json({ success: true });
    }
    catch (error) {
        console.error('Mark selected notifications read error:', error);
        res.status(500).json({ message: 'Failed to mark selected notifications as read' });
    }
};
exports.markSelectedRead = markSelectedRead;
const deleteNotification = async (req, res) => {
    const { notificationId } = req.params;
    try {
        const notification = await notification_model_1.default.findById(notificationId);
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        if (String(notification.user) !== String(req.user._id)) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        await notification_model_1.default.findByIdAndDelete(notificationId);
        res.json({ success: true });
    }
    catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({ message: 'Failed to delete notification' });
    }
};
exports.deleteNotification = deleteNotification;
const sendInvitation = async (req, res) => {
    try {
        const { userIds = [], eventId } = req.body;
        if (!eventId || userIds.length === 0) {
            return res.status(400).json({ message: 'eventId and userIds are required' });
        }
        const event = await event_model_1.default.findById(eventId).select('title organizer');
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        // Create notifications for each invited user
        const notifications = await notification_model_1.default.insertMany(userIds.map((userId) => ({
            user: userId,
            fromUser: req.user._id,
            event: eventId,
            title: 'Event Invitation',
            message: `${req.user.name} invited you to "${event.title}"`,
            type: 'invitation',
            isRead: false,
        })));
        // Send push notifications to invited users
        const invitedUsers = await user_model_1.default.find({
            _id: { $in: userIds },
            notificationsEnabled: true,
            expoPushToken: { $exists: true, $ne: null }
        });
        for (const user of invitedUsers) {
            if (user.expoPushToken) {
                await (0, pushNotification_1.sendPushNotification)({
                    to: user.expoPushToken,
                    title: 'Event Invitation',
                    body: `${req.user.name} invited you to "${event.title}"`,
                    data: { eventId, notificationType: 'invitation' }
                });
            }
        }
        res.status(201).json(notifications);
    }
    catch (error) {
        console.error('Send invitation error:', error);
        res.status(500).json({ message: 'Failed to send invitation' });
    }
};
exports.sendInvitation = sendInvitation;
