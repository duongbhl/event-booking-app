"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startEventReminderScheduler = exports.scheduleEventReminders = void 0;
const event_model_1 = __importDefault(require("../models/event.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const notification_model_1 = __importDefault(require("../models/notification.model"));
const ticket_model_1 = __importDefault(require("../models/ticket.model"));
const pushNotification_1 = require("./pushNotification");
const sentNotifications = new Map(); // Track sent notifications to avoid duplicates
const getEventStartDateTime = (event) => {
    const eventStart = new Date(event.date);
    if (event.time) {
        const timeParts = event.time.split(':').map((part) => Number(part));
        const [hours = 0, minutes = 0, seconds = 0] = timeParts;
        if (Number.isFinite(hours) &&
            Number.isFinite(minutes) &&
            Number.isFinite(seconds)) {
            eventStart.setHours(hours, minutes, seconds, 0);
        }
    }
    return eventStart;
};
/**
 * Send event reminders for upcoming events
 * Checks for events that are:
 * - 1 day (1440 minutes) before
 * - 1 hour (60 minutes) before
 */
const scheduleEventReminders = async () => {
    try {
        const now = new Date();
        // Define reminder intervals (in minutes)
        const reminderIntervals = [1440, 60]; // 1 day, 1 hour
        for (const minutes of reminderIntervals) {
            const startTime = new Date(now.getTime() + minutes * 60 * 1000);
            const endTime = new Date(now.getTime() + minutes * 60 * 1000 + 5 * 60 * 1000); // 5 minute window
            // Query a wider date window first, then compare against the actual start datetime.
            const events = await event_model_1.default.find({
                date: {
                    $gte: new Date(startTime.getTime() - 24 * 60 * 60 * 1000),
                    $lt: new Date(endTime.getTime() + 24 * 60 * 60 * 1000)
                },
                approvalStatus: 'ACCEPTED'
            });
            for (const event of events) {
                const eventStart = getEventStartDateTime(event);
                if (eventStart < startTime || eventStart >= endTime) {
                    continue;
                }
                const notificationKey = `${event._id}-${minutes}`;
                // Skip if already sent in this window
                if (sentNotifications.has(notificationKey)) {
                    continue;
                }
                // Prepare notification message
                const timeLabel = minutes === 1440 ? '1 day' : '1 hour';
                const title = `Upcoming Event: ${event.title}`;
                const body = `Event starts in ${timeLabel}! Don't miss it.`;
                const paidTicketUserIds = await ticket_model_1.default.distinct('user', {
                    event: event._id,
                    paymentStatus: 'paid'
                });
                const recipientIds = Array.from(new Set([
                    String(event.organizer),
                    ...paidTicketUserIds.map((userId) => String(userId))
                ]));
                if (recipientIds.length === 0) {
                    sentNotifications.set(notificationKey, now);
                    continue;
                }
                // Check DB to avoid sending duplicates across scheduler restarts.
                const existingNotifications = await notification_model_1.default.find({
                    user: { $in: recipientIds },
                    event: event._id,
                    type: 'reminder',
                    title,
                    message: body,
                }).select('user');
                const notifiedUserIds = new Set(existingNotifications.map((notification) => String(notification.user)));
                const pendingRecipientIds = recipientIds.filter((userId) => !notifiedUserIds.has(userId));
                if (pendingRecipientIds.length > 0) {
                    const users = await user_model_1.default.find({
                        _id: { $in: pendingRecipientIds }
                    }).select('_id expoPushToken');
                    const tokens = users
                        .map((user) => user.expoPushToken)
                        .filter((token) => Boolean(token));
                    if (tokens.length > 0) {
                        await (0, pushNotification_1.sendPushNotifications)(tokens, title, body, {
                            eventId: String(event._id),
                            notificationType: 'reminder',
                            reminderType: `${minutes}min`
                        });
                    }
                    await notification_model_1.default.insertMany(pendingRecipientIds.map((userId) => ({
                        user: userId,
                        event: event._id,
                        title,
                        message: body,
                        type: 'reminder',
                        isRead: false
                    })));
                }
                // Mark as sent
                sentNotifications.set(notificationKey, now);
            }
        }
        // Clean up old entries from sentNotifications map (older than 1 hour)
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        for (const [key, value] of sentNotifications.entries()) {
            if (value < oneHourAgo) {
                sentNotifications.delete(key);
            }
        }
    }
    catch (error) {
        console.error('Error scheduling event reminders:', error);
    }
};
exports.scheduleEventReminders = scheduleEventReminders;
/**
 * Start the event reminder scheduler
 * Runs every 5 minutes
 */
const startEventReminderScheduler = () => {
    console.log('Starting event reminder scheduler...');
    // Run immediately on start
    (0, exports.scheduleEventReminders)().catch(console.error);
    // Run every 5 minutes
    setInterval(() => {
        (0, exports.scheduleEventReminders)().catch(console.error);
    }, 5 * 60 * 1000);
};
exports.startEventReminderScheduler = startEventReminderScheduler;
