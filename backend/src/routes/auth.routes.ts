import { Router } from "express";
import { body } from 'express-validator';
import { login, me, register } from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware'


export const authRoutes = Router();
authRoutes.post('/register', [body('name').notEmpty(), body('email').isEmail(), body('password').isLength({ min: 6 })], register);
authRoutes.post('/login', login);
authRoutes.get('/me', protect, me);
