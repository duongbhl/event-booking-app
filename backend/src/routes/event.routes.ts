import { Router } from "express";
import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware';
import { createEvent, deleteEvent, getEvent, getMyEvents, getOrganizerEvents, listEvents, updateEvent, getPendingEvents, approveEvent, rejectEvent, autoRejectExpiredEvents } from '../controllers/event.controller';

export const eventRoutes = express.Router()


eventRoutes.get('/', listEvents);

eventRoutes.get('/admin/pending', getPendingEvents);

eventRoutes.post('/admin/auto-reject-expired', autoRejectExpiredEvents);

eventRoutes.put('/admin/approve/:id', approveEvent);

eventRoutes.put('/admin/reject/:id', rejectEvent);

eventRoutes.get('/me', protect, getMyEvents);

eventRoutes.get('/organizer/:organizerId', getOrganizerEvents);

eventRoutes.get('/:id', getEvent);

eventRoutes.post('/', protect, authorize('user'), createEvent);

eventRoutes.put('/:id', protect, authorize('user'), updateEvent);

eventRoutes.delete('/:id', protect, authorize('user'), deleteEvent);
export default eventRoutes;