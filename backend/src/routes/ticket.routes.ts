import { Router } from "express";
import express from 'express';
import { protect } from '../middleware/auth.middleware';
import { bookTicket, confirmPayment, myTickets } from '../controllers/ticket.controller';


export const ticketRoutes = Router()
ticketRoutes.post('/book', protect, bookTicket);

ticketRoutes.post('/confirm', protect, confirmPayment);

ticketRoutes.get('/me', protect, myTickets);
