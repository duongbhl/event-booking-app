import { Response } from 'express';
import Event from '../models/event.model';
import Ticket from '../models/ticket.model';
import Payment from '../models/payment.model';


export const bookTicket = async (req: any, res: Response) => {
    const { eventId, seatInfo, method = 'wallet' } = req.body as { eventId: string; seatInfo?: string; method?: 'credit' | 'paypal' | 'wallet' };
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });


    const sold = await Ticket.countDocuments({ event: eventId, paymentStatus: 'paid' });
    if (sold >= event.capacity) return res.status(400).json({ message: 'Sold out' });


    const ticket = await Ticket.create({
        user: req.user!._id,
        event: eventId,
        price: event.price,
        seatInfo,
        paymentStatus: 'pending',
    });


    const payment = await Payment.create({
        user: req.user!._id,
        event: eventId,
        ticket: ticket._id,
        amount: event.price,
        method,
        status: 'pending',
        transactionId: `TX-${Date.now()}`,
    });


    res.status(201).json({ ticket, payment });
};


export const confirmPayment = async (req: any, res: Response) => {
    const { paymentId, success = true } = req.body as { paymentId: string; success?: boolean };
    const payment = await Payment.findById(paymentId).populate('ticket');
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    if (String(payment.user) !== String(req.user!._id)) return res.status(403).json({ message: 'Forbidden' });


    payment.status = success ? 'success' : 'failed';
    await payment.save();


    // @ts-expect-error populated
    payment.ticket.paymentStatus = success ? 'paid' : 'failed';
    // @ts-expect-error populated
    await payment.ticket.save();

    res.json({ payment, ticket: payment.ticket });
};


export const myTickets = async (req: any, res: Response) => {
    const tickets = await Ticket.find({ user: req.user!._id }).populate('event');
    res.json(tickets);
};