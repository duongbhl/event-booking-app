import { Request, Response } from 'express';
import Bookmark from '../models/bookmark.model';



export const toggleBookmark = async (req: any, res: Response) => {
    const { eventId } = req.body as { eventId: string };
    const found = await Bookmark.findOne({ user: req.user!._id, event: eventId });
    if (found) {
        await found.deleteOne();
        return res.json({ bookmarked: false });
    }
    await Bookmark.create({ user: req.user!._id, event: eventId });
    res.json({ bookmarked: true });
};


export const myBookmarks = async (req: any, res: Response) => {
    const items = await Bookmark.find({ user: req.user!._id }).populate('event');
    res.json(items);
};