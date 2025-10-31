import { Router } from "express";
import express from 'express';
import { protect } from '../middleware/auth.middleware';
import { updateProfile } from '../controllers/user.controller.js';


export const userRoutes = Router()


userRoutes.put('/me', protect, updateProfile);
