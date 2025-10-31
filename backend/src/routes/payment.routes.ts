import { Router } from "express";
import express from 'express';
import { protect } from '../middleware/auth.middleware';
import { listPayments } from '../controllers/payment.controller';


export const paymentRoutes = Router()
paymentRoutes.get('/me', protect, listPayments);
