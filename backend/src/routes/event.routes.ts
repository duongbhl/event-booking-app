import { Router } from "express";
import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware';
import { createEvent, deleteEvent, getEvent, listEvents, updateEvent } from '../controllers/event.controller';

export const eventRoutes = express.Router()


eventRoutes.get('/', listEvents);

eventRoutes.get('/:id', getEvent);

eventRoutes.post('/', protect, authorize('user'), createEvent);

eventRoutes.put('/:id', protect, authorize('user'), updateEvent);

eventRoutes.delete('/:id', protect, authorize('user'), deleteEvent);
export default eventRoutes;