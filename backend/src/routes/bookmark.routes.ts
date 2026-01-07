import { Router } from "express";
import express from 'express';
import { protect } from '../middleware/auth.middleware';
import { getMyFollowers, getOrganizerFollowers, myBookmarks, toggleBookmark } from '../controllers/bookmark.controller';


export const bookmarkRoutes = Router()
bookmarkRoutes.get('/me', protect, myBookmarks);
bookmarkRoutes.get('/me/followers', protect, getMyFollowers);
bookmarkRoutes.get('/organizer/:organizerId/followers', getOrganizerFollowers);
bookmarkRoutes.post('/toggle', protect, toggleBookmark);
