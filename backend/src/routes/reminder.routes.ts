
import express, { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import { createReminder, listReminders } from '../controllers/reminder.controller'


export const reminderRoutes = Router()
reminderRoutes.get('/me', protect, listReminders);
reminderRoutes.post('/', protect, createReminder);




