import Event from '../models/event.model';
import User from '../models/user.model';
import Notification from '../models/notification.model';
import { sendPushNotifications } from './pushNotification';

interface ScheduledNotification {
  eventId: string;
  timeBeforeMinutes: number;
  lastSentAt?: Date;
}

const sentNotifications = new Map<string, Date>(); // Track sent notifications to avoid duplicates

/**
 * Send event reminders for upcoming events
 * Checks for events that are:
 * - 1 day (1440 minutes) before
 * - 1 hour (60 minutes) before
 */
export const scheduleEventReminders = async () => {
  try {
    const now = new Date();
    
    // Define reminder intervals (in minutes)
    const reminderIntervals = [1440, 60]; // 1 day, 1 hour
    
    for (const minutes of reminderIntervals) {
      const startTime = new Date(now.getTime() + minutes * 60 * 1000);
      const endTime = new Date(now.getTime() + minutes * 60 * 1000 + 5 * 60 * 1000); // 5 minute window
      
      // Find events in this time window
      const events = await Event.find({
        date: {
          $gte: startTime,
          $lt: endTime
        },
        approvalStatus: 'ACCEPTED'
      }).populate('member', 'expoPushToken name');
      
      for (const event of events) {
        const notificationKey = `${event._id}-${minutes}`;
        
        // Skip if already sent in this window
        if (sentNotifications.has(notificationKey)) {
          continue;
        }
        
        // Prepare notification message
        const timeLabel = minutes === 1440 ? '1 day' : '1 hour';
        const title = `Upcoming Event: ${event.title}`;
        const body = `Event starts in ${timeLabel}! Don't miss it.`;
        
        // Get all members' push tokens
        const members = await User.find({
          $or: [
            { _id: event.organizer },
            // Members who bought tickets
            { _id: { $in: event.member || [] } }
          ],
          expoPushToken: { $exists: true, $ne: null }
        }).select('_id expoPushToken');
        
        const tokens = members
          .map(m => (m as any).expoPushToken)
          .filter(t => t);
        
        if (tokens.length > 0) {
          // Send push notifications
          await sendPushNotifications(
            tokens,
            title,
            body,
            { eventId: String(event._id), reminderType: `${minutes}min` }
          );
          
          // Create in-app notifications for all relevant users
          const users = members.map(m => m._id);
          const notifications = users.map(userId => ({
            user: userId,
            event: event._id,
            title,
            message: body,
            type: 'reminder',
            isRead: false
          }));
          
          if (notifications.length > 0) {
            await Notification.insertMany(notifications);
          }
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
    
  } catch (error) {
    console.error('Error scheduling event reminders:', error);
  }
};

/**
 * Start the event reminder scheduler
 * Runs every 5 minutes
 */
export const startEventReminderScheduler = () => {
  console.log('Starting event reminder scheduler...');
  
  // Run immediately on start
  scheduleEventReminders().catch(console.error);
  
  // Run every 5 minutes
  setInterval(() => {
    scheduleEventReminders().catch(console.error);
  }, 5 * 60 * 1000);
};
