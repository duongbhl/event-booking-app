import { Response } from 'express';
import Event from '../models/event.model';
import Ticket from '../models/ticket.model';
import Payment from '../models/payment.model';

export const bookTicket = async (req: any, res: Response) => {
    try {
        const {
            eventId,
            tierName,
            quantity,
            price,
            seatInfo,
            method = 'wallet',
        } = req.body as {
            eventId: string;
            tierName: string;
            quantity: number;
            price: number;
            seatInfo?: string;
            method?: 'credit' | 'paypal' | 'wallet';
        };

        if (!quantity || quantity < 1) {
            return res.status(400).json({ message: 'Invalid quantity' });
        }

        if (!tierName) {
            return res.status(400).json({ message: 'Tier name is required' });
        }

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // ✅ Find the tier
        const tier = event.ticketTiers?.find(t => t.name === tierName);
        if (!tier) {
            return res.status(400).json({ message: 'Invalid ticket tier' });
        }

        // ✅ Validate price
        const expectedTotal = tier.price * quantity;
        if (price !== expectedTotal) {
            return res.status(400).json({ message: 'Invalid ticket price' });
        }

        // ✅ Check for quota
        if (tier.sold + quantity > tier.quota) {
            return res.status(400).json({ message: 'Not enough tickets available for this tier' });
        }

        // 🎫 Create multiple tickets
        const tickets = await Ticket.insertMany(
            Array.from({ length: quantity }).map((_, index) => ({
                user: req.user!._id,
                event: eventId,
                ticketType: tierName,
                tierName: tierName,
                price: tier.price,
                seatInfo: seatInfo
                    ? `${seatInfo}-${index + 1}`
                    : `${tierName}-${index + 1}`,
                paymentStatus: 'pending',
            }))
        );

        // 💳 Create ONE payment
        const payment = await Payment.create({
            user: req.user!._id,
            event: eventId,
            tickets: tickets.map((t) => t._id),
            amount: price,
            method,
            status: 'pending',
            transactionId: `TX-${Date.now()}`,
        });

        res.status(201).json({ tickets, payment });
    } catch (error) {
        console.error("Book ticket error:", error);
        res.status(500).json({ message: "Failed to book ticket" });
    }
};


export const confirmPayment = async (req: any, res: Response) => {
    try {
        const { paymentId, success = true } = req.body;

        if (!paymentId) {
            return res.status(400).json({ message: "Payment ID is required" });
        }

        const payment = await Payment.findById(paymentId);
        if (!payment) {
            return res.status(404).json({ message: "Payment not found" });
        }

        if (String(payment.user) !== String(req.user!._id)) {
            return res.status(403).json({ message: "Forbidden" });
        }

        payment.status = success ? "success" : "failed";
        await payment.save();

        // 🔥 Update ticket status
        await Ticket.updateMany(
            { _id: { $in: payment.tickets } },
            { paymentStatus: success ? "paid" : "failed" }
        );

        // ✅ If payment successful, update tier sold count and event member
        if (success) {
            const tickets = await Ticket.find({ _id: { $in: payment.tickets } });
            const tierName = tickets[0]?.tierName;
            const quantity = tickets.length;

            if (tierName) {
                // Update tier sold count
                const event = await Event.findByIdAndUpdate(
                    payment.event,
                    {
                        $inc: {
                            "ticketTiers.$[tier].sold": quantity
                        }
                    },
                    {
                        arrayFilters: [{ "tier.name": tierName }],
                        new: true
                    }
                );

                // Calculate total members = sum of all sold tickets
                const totalSold = event?.ticketTiers?.reduce((sum, tier) => sum + (tier.sold || 0), 0) || 0;
                
                // Update event member count
                await Event.findByIdAndUpdate(
                    payment.event,
                    { member: totalSold },
                    { new: true }
                );
            }
        }

        // 🔥 FETCH full tickets - Optimize with lean()
        const tickets = await Ticket.find({
            _id: { $in: payment.tickets },
        }).populate({
            path: "event",
            select: "title location date images price"
        });

        res.json({
            payment,
            tickets,
        });
    } catch (error) {
        console.error("Confirm payment error:", error);
        res.status(500).json({ message: "Failed to confirm payment" });
    }
};


export const myTickets = async (req: any, res: Response) => {
    const tickets = await Ticket.find({ user: req.user!._id }).populate('event');
    res.json(tickets);
};