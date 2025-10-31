import { Response } from 'express';
import Event from '../models/event.model';
import Ticket from '../models/ticket.model';



export const createEvent = async (req: any, res: Response) => {
    const payload = { ...req.body, organizer: req.user!._id };
    const event = await Event.create(payload);
    res.status(201).json(event);
};


export const listEvents = async (req: any, res: Response) => {
    const { page = '1', limit = '10', q, category, minPrice, maxPrice, status } = req.query as Record<string, string>;
    const filter: Record<string, any> = {};
    if (q) filter.title = { $regex: q, $options: 'i' };
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (minPrice || maxPrice) filter.price = { ...(minPrice && { $gte: +minPrice }), ...(maxPrice && { $lte: +maxPrice }) };


    const [items, total] = await Promise.all([
        Event.find(filter).sort({ startDate: 1 }).skip((+page - 1) * +limit).limit(+limit).populate('organizer', 'name avatar'),
        Event.countDocuments(filter),
    ]);
    res.json({ items, total, page: +page, pages: Math.ceil(total / +limit) });
};


export const getEvent = async (req: any, res: Response) => {
    const event = await Event.findById(req.params.id).populate('organizer', 'name avatar');
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
};


export const updateEvent = async (req: any, res: Response) => {
    const event = await Event.findOneAndUpdate({ _id: req.params.id, organizer: req.user!._id }, req.body, { new: true });
    if (!event) return res.status(404).json({ message: 'Event not found or not owner' });
    res.json(event);
};


export const deleteEvent = async (req: any, res: Response) => {
    const hasTickets = await Ticket.exists({ event: req.params.id });
    if (hasTickets) return res.status(400).json({ message: 'Cannot delete event with tickets' });
    await Event.deleteOne({ _id: req.params.id, organizer: req.user!._id });
    res.json({ success: true });
};