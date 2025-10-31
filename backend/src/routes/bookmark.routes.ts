import { Router } from "express";
import express from 'express';
import { protect } from '../middleware/auth.middleware';
import { myBookmarks, toggleBookmark } from '../controllers/bookmark.controller';


export const bookmarkRoutes = Router()
bookmarkRoutes.get('/me', protect, myBookmarks);
bookmarkRoutes.post('/toggle', protect, toggleBookmark);
