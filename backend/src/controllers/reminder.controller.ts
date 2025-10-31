import { Request, Response } from 'express';
import Reminder from '../models/reminder.model';



export const createReminder = async (req: any, res: Response) => {
    const { eventId, remindAt } = req.body as { eventId: string; remindAt: string };
    const reminder = await Reminder.create({ user: req.user!._id, event: eventId, remindAt });
    res.status(201).json(reminder);
};


export const listReminders = async (req: any, res: Response) => {
    const items = await Reminder.find({ user: req.user!._id }).sort('remindAt');
    res.json(items);
};