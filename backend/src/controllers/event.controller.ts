import { Request,Response } from 'express';
import Event from '../models/event.model';
import Ticket from '../models/ticket.model';
import User from '../models/user.model';
import Notification from '../models/notification.model';
import { sendPushNotification, sendPushNotifications } from '../utils/pushNotification';
import { generateEventContentSuggestion } from '../services/openaiEventSuggestion.service';


// List Events with filtering and pagination
export const listEvents = async (req: Request, res: Response) => {
    try {
        const {
            page = "1",
            limit = "100",
            q,
            category,
            status,
            minPrice,
            maxPrice,
        } = req.query as Record<string, string>;

        const filter: Record<string, any> = {};

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
            Event.find(filter)
                .sort({ startDate: 1 })
                .skip(skip)
                .limit(limitNumber)
                .populate("organizer", "name avatar"),
            Event.countDocuments(filter),
        ]);

        res.json({
            items,
            total,
            page: pageNumber,
            pages: Math.ceil(total / limitNumber),
        });
    } catch (error) {
        console.error("List events error:", error);
        res.status(500).json({ message: "Failed to fetch events" });
    }
};


// Get a single Event by ID
export const getEvent = async (req: any, res: Response) => {
    const event = await Event.findById(req.params.id).populate('organizer', 'name avatar');
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
};

// Get my events (events created by current user)
export const getMyEvents = async (req: any, res: Response) => {
    try {
        const events = await Event.find({ organizer: req.user._id }).populate('organizer', 'name avatar');
        res.json(events);
    } catch (error) {
        console.error("Get my events error:", error);
        res.status(500).json({ message: 'Failed to fetch my events' });
    }
};

// Get events by organizer ID
export const getOrganizerEvents = async (req: any, res: Response) => {
    try {
        const { organizerId } = req.params;
        const events = await Event.find({ organizer: organizerId }).populate('organizer', 'name avatar');
        res.json(events);
    } catch (error) {
        console.error("Get organizer events error:", error);
        res.status(500).json({ message: 'Failed to fetch organizer events' });
    }
};

/**
 * Create new event
 */
export const createEvent = async (req: any, res: Response) => {
  const {
    title,
    description,
    category,
    price,
    date,
    time,
    member,
    location,
    images,
    ticketTiers,
  } = req.body;

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

  const event = await Event.create({
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
    ticketTiers: ticketTiers.map((tier: any) => ({
      name: tier.name,
      price: tier.price,
      quota: tier.quota,
      sold: 0,
    })),
  });

  res.status(201).json(event);
};

export const suggestEventContent = async (req: any, res: Response) => {
  try {
    const {
      category,
      location,
      date,
      title,
      description,
      prompt,
      language,
    } = req.body;

    if (!category) {
      return res.status(400).json({
        message: "Category is required to generate event content",
      });
    }

    const suggestion = await generateEventContentSuggestion({
      category,
      location,
      date,
      existingTitle: title,
      existingDescription: description,
      userPrompt: prompt,
      language,
    });

    res.json(suggestion);
  } catch (error: any) {
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


/**
 * Update event
 */
export const updateEvent = async (req: any, res: Response) => {
  const event = await Event.findOneAndUpdate(
    { _id: req.params.id, organizer: req.user._id },
    req.body,
    { new: true }
  );

  if (!event) {
    return res.status(404).json({
      message: "Event not found or you are not the owner",
    });
  }

  res.json(event);
};


/**
 * Delete event
 */
export const deleteEvent = async (req: any, res: Response) => {
  const event = await Event.findOneAndDelete({
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

/**
 * Get all pending events (for admin)
 */
export const getPendingEvents = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    const filter: Record<string, any> = { approvalStatus: "PENDING" };

    if (q) {
      filter.title = { $regex: q, $options: "i" };
    }

    const events = await Event.find(filter)
      .populate("organizer", "name avatar")
      .sort({ createdAt: -1 });

    res.json(events);
  } catch (error) {
    console.error("Get pending events error:", error);
    res.status(500).json({ message: "Failed to fetch pending events" });
  }
};

/**
 * Approve event (admin)
 */
export const approveEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const event = await Event.findByIdAndUpdate(
      id,
      { approvalStatus: "ACCEPTED" },
      { new: true }
    ).populate("organizer", "name avatar");

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event);
  } catch (error) {
    console.error("Approve event error:", error);
    res.status(500).json({ message: "Failed to approve event" });
  }
};

/**
 * Reject event (admin)
 */
export const rejectEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const event = await Event.findByIdAndUpdate(
      id,
      { approvalStatus: "REJECTED" },
      { new: true }
    ).populate("organizer", "name avatar");

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event);
  } catch (error) {
    console.error("Reject event error:", error);
    res.status(500).json({ message: "Failed to reject event" });
  }
};

/**
 * Auto reject expired pending events
 */
export const autoRejectExpiredEvents = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const result = await Event.updateMany(
      {
        approvalStatus: "PENDING",
        date: { $lt: now },
      },
      { approvalStatus: "REJECTED" }
    );

    res.json({
      success: true,
      modifiedCount: result.modifiedCount,
      message: `${result.modifiedCount} expired pending events rejected`,
    });
  } catch (error) {
    console.error("Auto reject expired events error:", error);
    res.status(500).json({ message: "Failed to auto reject expired events" });
  }
};
