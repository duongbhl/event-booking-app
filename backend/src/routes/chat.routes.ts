import { Router } from "express";
import express from 'express';
import { protect } from '../middleware/auth.middleware';
import { createRoom, getMessages, myRooms, sendMessage } from '../controllers/chat.controller';


export const chatRoutes = Router()
chatRoutes.get('/rooms', protect, myRooms);
chatRoutes.post('/rooms', protect, createRoom);
chatRoutes.get('/rooms/:roomId/messages', protect, getMessages);
chatRoutes.post('/rooms/:roomId/messages', protect, sendMessage);
