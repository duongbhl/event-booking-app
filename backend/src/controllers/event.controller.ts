import { Request,Response } from 'express';
import Event from '../models/event.model';
import Ticket from '../models/ticket.model';


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
  } = req.body;

  if (!title || !category || !date || !location) {
    return res.status(400).json({
      message: "Title, category, date and location are required",
    });
  }

  const eventDate = new Date(date);

  const event = await Event.create({
    title,
    description,
    category,
    price: price || "$0",
    date: eventDate,
    time,
    member: member || 0,
    location,
    images,
    organizer: req.user._id, // ✅ chính là bản thân user
    status: "upcoming",
  });

  res.status(201).json(event);
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
