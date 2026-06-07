import { Router } from "express";
import express from 'express';
import { protect } from '../middleware/auth.middleware';
import { listNotifications, markRead, markSelectedRead, sendInvitation, deleteNotification } from '../controllers/notification.controller';


export const notificationRoutes = Router();
notificationRoutes.get('/me', protect, listNotifications);
notificationRoutes.post('/read', protect, markRead);
notificationRoutes.post('/read-selected', protect, markSelectedRead);
notificationRoutes.post('/invite', protect, sendInvitation);
notificationRoutes.delete('/:notificationId', protect, deleteNotification);
