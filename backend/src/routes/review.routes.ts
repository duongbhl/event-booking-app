import { Router } from "express";
import express from 'express';
import { protect } from '../middleware/auth.middleware';
import { addReview, listReviews } from '../controllers/review.controller';


export const reviewRoutes = Router()
reviewRoutes.get('/:eventId', listReviews);
reviewRoutes.post('/:eventId', protect, addReview);
