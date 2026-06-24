"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrganizerFollowers = exports.getMyFollowers = exports.myBookmarks = exports.toggleBookmark = void 0;
const bookmark_model_1 = __importDefault(require("../models/bookmark.model"));
const event_model_1 = __importDefault(require("../models/event.model"));
const toggleBookmark = async (req, res) => {
    const { eventId } = req.body;
    const found = await bookmark_model_1.default.findOne({ user: req.user._id, event: eventId });
    if (found) {
        await found.deleteOne();
        return res.json({ bookmarked: false });
    }
    await bookmark_model_1.default.create({ user: req.user._id, event: eventId });
    res.json({ bookmarked: true });
};
exports.toggleBookmark = toggleBookmark;
const myBookmarks = async (req, res) => {
    const items = await bookmark_model_1.default.find({ user: req.user._id }).populate({
        path: 'event',
        populate: {
            path: 'organizer',
            select: 'name avatar'
        }
    });
    res.json(items);
};
exports.myBookmarks = myBookmarks;
// Get followers count: number of unique users who bookmarked my events
const getMyFollowers = async (req, res) => {
    try {
        const myEvents = await event_model_1.default.find({ organizer: req.user._id });
        const myEventIds = myEvents.map(e => e._id);
        const followers = await bookmark_model_1.default.countDocuments({
            event: { $in: myEventIds }
        });
        res.json({ followers });
    }
    catch (error) {
        console.error("Get followers error:", error);
        res.status(500).json({ message: 'Failed to fetch followers' });
    }
};
exports.getMyFollowers = getMyFollowers;
// Get followers count for a specific organizer
const getOrganizerFollowers = async (req, res) => {
    try {
        const { organizerId } = req.params;
        const organizerEvents = await event_model_1.default.find({ organizer: organizerId });
        const eventIds = organizerEvents.map(e => e._id);
        const followers = await bookmark_model_1.default.countDocuments({
            event: { $in: eventIds }
        });
        res.json({ followers });
    }
    catch (error) {
        console.error("Get organizer followers error:", error);
        res.status(500).json({ message: 'Failed to fetch organizer followers' });
    }
};
exports.getOrganizerFollowers = getOrganizerFollowers;
