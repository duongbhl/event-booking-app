import { Router } from "express";
import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware';
import { createEvent, deleteEvent, getEvent, listEvents, updateEvent } from '../controllers/event.controller';

export const eventRoutes = Router()

const router = express.Router();
router.get('/', listEvents);
router.get('/:id', getEvent);
router.post('/', protect, authorize('user'), createEvent);
router.put('/:id', protect, authorize('user'), updateEvent);
router.delete('/:id', protect, authorize('user'), deleteEvent);
export default router;