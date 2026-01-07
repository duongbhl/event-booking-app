import { Request, Response } from 'express';
import Bookmark from '../models/bookmark.model';
import Event from '../models/event.model';


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
    const items = await Bookmark.find({ user: req.user!._id }).populate({
        path: 'event',
        populate: {
            path: 'organizer',
            select: 'name avatar'
        }
    });
    res.json(items);
};

// Get followers count: number of unique users who bookmarked my events
export const getMyFollowers = async (req: any, res: Response) => {
    try {
        const myEvents = await Event.find({ organizer: req.user._id });
        const myEventIds = myEvents.map(e => e._id);
        
        const followers = await Bookmark.countDocuments({
            event: { $in: myEventIds }
        });
        
        res.json({ followers });
    } catch (error) {
        console.error("Get followers error:", error);
        res.status(500).json({ message: 'Failed to fetch followers' });
    }
};

// Get followers count for a specific organizer
export const getOrganizerFollowers = async (req: any, res: Response) => {
    try {
        const { organizerId } = req.params;
        
        const organizerEvents = await Event.find({ organizer: organizerId });
        const eventIds = organizerEvents.map(e => e._id);
        
        const followers = await Bookmark.countDocuments({
            event: { $in: eventIds }
        });
        
        res.json({ followers });
    } catch (error) {
        console.error("Get organizer followers error:", error);
        res.status(500).json({ message: 'Failed to fetch organizer followers' });
    }
};