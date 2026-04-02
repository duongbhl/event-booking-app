import { Response } from 'express';
import Event from '../models/event.model';
import Ticket from '../models/ticket.model';
import Payment from '../models/payment.model';
import { generateTicketQRCode, parseQRCodeData } from '../utils/generateQRCode';

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

        //  Find the tier
        const tier = event.ticketTiers?.find(t => t.name === tierName);
        if (!tier) {
            return res.status(400).json({ message: 'Invalid ticket tier' });
        }

        //  Validate price
        const expectedTotal = tier.price * quantity;
        if (price !== expectedTotal) {
            return res.status(400).json({ message: 'Invalid ticket price' });
        }

        //  Check for quota
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

        //  If payment successful, update tier sold count and event member
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

            // 🎟️ Generate QR codes for all tickets
            for (const ticket of tickets) {
                try {
                    const qrCode = await generateTicketQRCode(
                        String(ticket._id),
                        String(payment.event)
                    );
                    // Save QR code to ticket
                    await Ticket.findByIdAndUpdate(
                        ticket._id,
                        { qrCode },
                        { new: true }
                    );
                } catch (qrError) {
                    console.error(`Failed to generate QR code for ticket ${ticket._id}:`, qrError);
                    // Continue with other tickets even if one fails
                }
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

/**
 * Check in a ticket by scanning QR code
 * Only organizers can check in tickets for their events
 */
export const checkInTicket = async (req: any, res: Response) => {
    try {
        const { qrCode, eventId } = req.body as {
            qrCode: string;
            eventId: string;
        };

        console.log('[checkInTicket] Received QR code:', JSON.stringify(qrCode));
        console.log('[checkInTicket] QR code length:', qrCode?.length);
        console.log('[checkInTicket] Event ID:', eventId);

        if (!qrCode || !eventId) {
            return res.status(400).json({ message: "QR code and event ID are required" });
        }

        // Verify user is the organizer of this event
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        if (String(event.organizer) !== String(req.user!._id)) {
            return res.status(403).json({ message: "You are not the organizer of this event" });
        }

        // Parse QR code data
        const qrData = parseQRCodeData(qrCode);
        if (!qrData) {
            console.warn('[checkInTicket] Failed to parse QR code:', qrCode);
            return res.status(400).json({ 
                message: "Invalid QR code format",
                status: "INVALID_FORMAT",
                received: qrCode
            });
        }

        const { ticketId, eventId: qrEventId } = qrData;

        // Verify QR code belongs to this event
        if (qrEventId !== eventId) {
            return res.status(400).json({ 
                message: "QR code does not belong to this event",
                status: "WRONG_EVENT"
            });
        }

        // Check if ticket exists and belongs to this event
        const ticket = await Ticket.findById(ticketId)
            .populate('user', 'name email')
            .populate('event', 'title');

        if (!ticket) {
            return res.status(404).json({ 
                message: "Ticket not found",
                status: "TICKET_NOT_FOUND"
            });
        }

        if (String(ticket.event._id) !== eventId) {
            return res.status(400).json({ 
                message: "Ticket does not belong to this event",
                status: "WRONG_EVENT"
            });
        }

        // Check if ticket is valid (payment must be successful)
        if (ticket.paymentStatus !== 'paid') {
            return res.status(400).json({ 
                message: "Ticket has not been paid yet",
                status: "PAYMENT_PENDING"
            });
        }

        //  Check if already checked in
        if (ticket.checked) {
            return res.status(400).json({ 
                message: "Ticket has already been checked in",
                status: "ALREADY_CHECKED",
                checkedAt: ticket.checkedAt,
                checkedByUser: ticket.checkedBy
            });
        }

        //  Mark ticket as checked in
        const updatedTicket = await Ticket.findByIdAndUpdate(
            ticketId,
            {
                checked: true,
                checkedAt: new Date(),
                checkedBy: req.user!._id,
            },
            { new: true }
        ).populate('user', 'name email')
            .populate('event', 'title organizer');

        res.json({
            message: "Ticket checked in successfully",
            status: "SUCCESS",
            ticket: updatedTicket,
        });
    } catch (error) {
        console.error("Check in ticket error:", error);
        res.status(500).json({ message: "Failed to check in ticket" });
    }
};