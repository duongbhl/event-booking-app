import { Response } from 'express';
import Event from '../models/event.model';
import Ticket from '../models/ticket.model';
import Payment from '../models/payment.model';

export const bookTicket = async (req: any, res: Response) => {
    const {
        eventId,
        ticketType,
        quantity,
        price,
        seatInfo,
        method = 'wallet',
    } = req.body as {
        eventId: string;
        ticketType: 'VIP' | 'Economy';
        quantity: number;
        price: number;
        seatInfo?: string;
        method?: 'credit' | 'paypal' | 'wallet';
    };

    if (!quantity || quantity < 1) {
        return res.status(400).json({ message: 'Invalid quantity' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
        return res.status(404).json({ message: 'Event not found' });
    }

    /** 🔒 Validate giá */
    const unitPrice =
        ticketType === 'VIP' ? event.price * 50 : event.price;

    const expectedTotal = unitPrice * quantity;

    if (price !== expectedTotal) {
        return res.status(400).json({ message: 'Invalid ticket price' });
    }

    /** 🔒 Check sold out */
    const sold = await Ticket.countDocuments({
        event: eventId,
        paymentStatus: 'paid',
    });

    if (sold + quantity > event.member) {
        return res.status(400).json({ message: 'Not enough seats' });
    }

    /** 🎫 Create multiple tickets */
    const tickets = await Ticket.insertMany(
        Array.from({ length: quantity }).map((_, index) => ({
            user: req.user!._id,
            event: eventId,
            ticketType,
            price: unitPrice,
            seatInfo: seatInfo
                ? `${seatInfo}-${index + 1}`
                : `${ticketType}-${index + 1}`,
            paymentStatus: 'pending',
        }))
    );

    /** 💳 Create ONE payment */
    const payment = await Payment.create({
        user: req.user!._id,
        event: eventId,
        tickets: tickets.map((t) => t._id), // 👈 sửa type
        amount: price,
        method,
        status: 'pending',
        transactionId: `TX-${Date.now()}`,
    });

    res.status(201).json({ tickets, payment });
};


export const confirmPayment = async (req: any, res: Response) => {
    const { paymentId, success = true } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
    }

    if (String(payment.user) !== String(req.user!._id)) {
        return res.status(403).json({ message: "Forbidden" });
    }

    payment.status = success ? "success" : "failed";
    await payment.save();

    /** 🔥 Update ticket status */
    await Ticket.updateMany(
        { _id: { $in: payment.tickets } },
        { paymentStatus: success ? "paid" : "failed" }
    );

    /** 🔥 FETCH LẠI TICKETS ĐẦY ĐỦ */
    const tickets = await Ticket.find({
        _id: { $in: payment.tickets },
    }).populate("event");

    res.json({
        payment,
        tickets, // ✅ Ticket[] thật
    });
};


export const myTickets = async (req: any, res: Response) => {
    const tickets = await Ticket.find({ user: req.user!._id }).populate('event');
    res.json(tickets);
};