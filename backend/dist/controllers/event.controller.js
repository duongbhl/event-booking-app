"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.autoRejectExpiredEvents = exports.rejectEvent = exports.approveEvent = exports.getPendingEvents = exports.deleteEvent = exports.updateEvent = exports.suggestEventContent = exports.createEvent = exports.getOrganizerEvents = exports.getMyEvents = exports.getEvent = exports.listEvents = void 0;
const event_model_1 = __importDefault(require("../models/event.model"));
const openaiEventSuggestion_service_1 = require("../services/openaiEventSuggestion.service");
// List Events with filtering and pagination
const listEvents = async (req, res) => {
    try {
        const { page = "1", limit = "100", q, category, status, minPrice, maxPrice, } = req.query;
        const filter = {};
        // Search by title
        if (q) {
            filter.title = { $regex: q, $options: "i" };
        }
        // Filter by category
        if (category) {
            filter.category = category;
        }
        // Filter by status (upcoming, ongoing, finished, cancelled)
        if (status) {
            filter.status = status;
        }
        // Filter by price range
        if (minPrice || maxPrice) {
            filter.price = {
                ...(minPrice && { $gte: Number(minPrice) }),
                ...(maxPrice && { $lte: Number(maxPrice) }),
            };
        }
        const pageNumber = Number(page);
        const limitNumber = Number(limit);
        const skip = (pageNumber - 1) * limitNumber;
        const [items, total] = await Promise.all([
            event_model_1.default.find(filter)
                .sort({ startDate: 1 })
                .skip(skip)
                .limit(limitNumber)
                .populate("organizer", "name avatar"),
            event_model_1.default.countDocuments(filter),
        ]);
        res.json({
            items,
            total,
            page: pageNumber,
            pages: Math.ceil(total / limitNumber),
        });
    }
    catch (error) {
        console.error("List events error:", error);
        res.status(500).json({ message: "Failed to fetch events" });
    }
};
exports.listEvents = listEvents;
// Get a single Event by ID
const getEvent = async (req, res) => {
    const event = await event_model_1.default.findById(req.params.id).populate('organizer', 'name avatar');
    if (!event)
        return res.status(404).json({ message: 'Event not found' });
    res.json(event);
};
exports.getEvent = getEvent;
// Get my events (events created by current user)
const getMyEvents = async (req, res) => {
    try {
        const events = await event_model_1.default.find({ organizer: req.user._id }).populate('organizer', 'name avatar');
        res.json(events);
    }
    catch (error) {
        console.error("Get my events error:", error);
        res.status(500).json({ message: 'Failed to fetch my events' });
    }
};
exports.getMyEvents = getMyEvents;
// Get events by organizer ID
const getOrganizerEvents = async (req, res) => {
    try {
        const { organizerId } = req.params;
        const events = await event_model_1.default.find({ organizer: organizerId }).populate('organizer', 'name avatar');
        res.json(events);
    }
    catch (error) {
        console.error("Get organizer events error:", error);
        res.status(500).json({ message: 'Failed to fetch organizer events' });
    }
};
exports.getOrganizerEvents = getOrganizerEvents;
/**
 * Create new event
 */
const createEvent = async (req, res) => {
    const { title, description, category, price, date, time, member, location, images, ticketTiers, } = req.body;
    if (!title || !category || !date || !location) {
        return res.status(400).json({
            message: "Title, category, date and location are required",
        });
    }
    // Validate ticket tiers
    if (!ticketTiers || !Array.isArray(ticketTiers) || ticketTiers.length === 0) {
        return res.status(400).json({
            message: "At least one ticket tier is required",
        });
    }
    // Validate each tier
    for (const tier of ticketTiers) {
        if (!tier.name || tier.price === undefined || !tier.quota) {
            return res.status(400).json({
                message: "Each ticket tier must have name, price, and quota",
            });
        }
        if (typeof tier.price !== "number" || tier.price < 0) {
            return res.status(400).json({
                message: "Ticket price must be a positive number",
            });
        }
        if (typeof tier.quota !== "number" || tier.quota <= 0) {
            return res.status(400).json({
                message: "Ticket quota must be a positive number",
            });
        }
    }
    const eventDate = new Date(date);
    const event = await event_model_1.default.create({
        title,
        description,
        category,
        price: price || ticketTiers[0].price, // Use first tier price as default
        date: eventDate,
        time,
        member: member || 0,
        location,
        images,
        organizer: req.user._id,
        status: "upcoming",
        approvalStatus: "PENDING",
        ticketTiers: ticketTiers.map((tier) => ({
            name: tier.name,
            price: tier.price,
            quota: tier.quota,
            sold: 0,
        })),
    });
    res.status(201).json(event);
};
exports.createEvent = createEvent;
const suggestEventContent = async (req, res) => {
    try {
        const { category, location, date, title, description, prompt, language, } = req.body;
        if (!category) {
            return res.status(400).json({
                message: "Category is required to generate event content",
            });
        }
        const suggestion = await (0, openaiEventSuggestion_service_1.generateEventContentSuggestion)({
            category,
            location,
            date,
            existingTitle: title,
            existingDescription: description,
            userPrompt: prompt,
            language,
        });
        res.json(suggestion);
    }
    catch (error) {
        console.error("Suggest event content error:", error?.response?.data || error);
        if (error.message === "OPENAI_API_KEY is missing") {
            return res.status(500).json({
                message: "OPENAI_API_KEY is not configured on the server",
            });
        }
        res.status(500).json({
            message: "Failed to generate event content",
        });
    }
};
exports.suggestEventContent = suggestEventContent;
/**
 * Update event
 */
const updateEvent = async (req, res) => {
    const event = await event_model_1.default.findOneAndUpdate({ _id: req.params.id, organizer: req.user._id }, req.body, { new: true });
    if (!event) {
        return res.status(404).json({
            message: "Event not found or you are not the owner",
        });
    }
    res.json(event);
};
exports.updateEvent = updateEvent;
/**
 * Delete event
 */
const deleteEvent = async (req, res) => {
    const event = await event_model_1.default.findOneAndDelete({
        _id: req.params.id,
        organizer: req.user._id,
    });
    if (!event) {
        return res.status(404).json({
            message: "Event not found or you are not the owner",
        });
    }
    res.json({ success: true });
};
exports.deleteEvent = deleteEvent;
/**
 * Get all pending events (for admin)
 */
const getPendingEvents = async (req, res) => {
    try {
        const { q } = req.query;
        const filter = { approvalStatus: "PENDING" };
        if (q) {
            filter.title = { $regex: q, $options: "i" };
        }
        const events = await event_model_1.default.find(filter)
            .populate("organizer", "name avatar")
            .sort({ createdAt: -1 });
        res.json(events);
    }
    catch (error) {
        console.error("Get pending events error:", error);
        res.status(500).json({ message: "Failed to fetch pending events" });
    }
};
exports.getPendingEvents = getPendingEvents;
/**
 * Approve event (admin)
 */
const approveEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const event = await event_model_1.default.findByIdAndUpdate(id, { approvalStatus: "ACCEPTED" }, { new: true }).populate("organizer", "name avatar");
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }
        res.json(event);
    }
    catch (error) {
        console.error("Approve event error:", error);
        res.status(500).json({ message: "Failed to approve event" });
    }
};
exports.approveEvent = approveEvent;
/**
 * Reject event (admin)
 */
const rejectEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const event = await event_model_1.default.findByIdAndUpdate(id, { approvalStatus: "REJECTED" }, { new: true }).populate("organizer", "name avatar");
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }
        res.json(event);
    }
    catch (error) {
        console.error("Reject event error:", error);
        res.status(500).json({ message: "Failed to reject event" });
    }
};
exports.rejectEvent = rejectEvent;
/**
 * Auto reject expired pending events
 */
const autoRejectExpiredEvents = async (req, res) => {
    try {
        const now = new Date();
        const result = await event_model_1.default.updateMany({
            approvalStatus: "PENDING",
            date: { $lt: now },
        }, { approvalStatus: "REJECTED" });
        res.json({
            success: true,
            modifiedCount: result.modifiedCount,
            message: `${result.modifiedCount} expired pending events rejected`,
        });
    }
    catch (error) {
        console.error("Auto reject expired events error:", error);
        res.status(500).json({ message: "Failed to auto reject expired events" });
    }
};
exports.autoRejectExpiredEvents = autoRejectExpiredEvents;
