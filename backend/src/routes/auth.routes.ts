import { Router } from "express";
import { body } from 'express-validator';
import { forgotPassword, login, me, register, resetPassword } from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware'


export const authRoutes = Router();

authRoutes.post('/register', [body('name').notEmpty(), body('email').isEmail(), body('password').isLength({ min: 6 })], register);

authRoutes.post('/login', login);

authRoutes.post('/forgot-password', [body('email').isEmail()], forgotPassword);

authRoutes.post(
    '/reset-password',
    [
        body('email').isEmail(),
        body('code').isLength({ min: 4, max: 6 }),
        body('newPassword').isLength({ min: 6 }),
    ],
    resetPassword
);

authRoutes.get('/me', protect, me);
