import { Router } from "express";
import express from 'express';
import { protect } from '../middleware/auth.middleware';
import { updateProfile, getMyProfile } from "../controllers/user.controller";



export const userRoutes = Router()

// Test endpoint
userRoutes.get('/test', (req, res) => {
  res.json({ message: "User routes working" });
});

userRoutes.get('/me', protect, getMyProfile);
userRoutes.put('/me', protect, updateProfile);
