"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkInTicket = exports.myTickets = exports.confirmPayment = exports.bookTicket = void 0;
const event_model_1 = __importDefault(require("../models/event.model"));
const ticket_model_1 = __importDefault(require("../models/ticket.model"));
const payment_model_1 = __importDefault(require("../models/payment.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const notification_model_1 = __importDefault(require("../models/notification.model"));
const generateQRCode_1 = require("../utils/generateQRCode");
const pushNotification_1 = require("../utils/pushNotification");
const bookTicket = async (req, res) => {
    try {
        const { eventId, tierName, quantity, price, seatInfo, method = 'wallet', } = req.body;
        if (!quantity || quantity < 1) {
            return res.status(400).json({ message: 'Invalid quantity' });
        }
        if (!tierName) {
            return res.status(400).json({ message: 'Tier name is required' });
        }
        const event = await event_model_1.default.findById(eventId);
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
        const tickets = await ticket_model_1.default.insertMany(Array.from({ length: quantity }).map((_, index) => ({
            user: req.user._id,
            event: eventId,
            ticketType: tierName,
            tierName: tierName,
            price: tier.price,
            seatInfo: seatInfo
                ? `${seatInfo}-${index + 1}`
                : `${tierName}-${index + 1}`,
            paymentStatus: 'pending',
        })));
        // 💳 Create ONE payment
        const payment = await payment_model_1.default.create({
            user: req.user._id,
            event: eventId,
            tickets: tickets.map((t) => t._id),
            amount: price,
            method,
            status: 'pending',
            transactionId: `TX-${Date.now()}`,
        });
        res.status(201).json({ tickets, payment });
    }
    catch (error) {
        console.error("Book ticket error:", error);
        res.status(500).json({ message: "Failed to book ticket" });
    }
};
exports.bookTicket = bookTicket;
const confirmPayment = async (req, res) => {
    try {
        const { paymentId, success = true } = req.body;
        if (!paymentId) {
            return res.status(400).json({ message: "Payment ID is required" });
        }
        const payment = await payment_model_1.default.findById(paymentId);
        if (!payment) {
            return res.status(404).json({ message: "Payment not found" });
        }
        if (String(payment.user) !== String(req.user._id)) {
            return res.status(403).json({ message: "Forbidden" });
        }
        payment.status = success ? "success" : "failed";
        await payment.save();
        // 🔥 Update ticket status
        await ticket_model_1.default.updateMany({ _id: { $in: payment.tickets } }, { paymentStatus: success ? "paid" : "failed" });
        //  If payment successful, update tier sold count and event member
        if (success) {
            const tickets = await ticket_model_1.default.find({ _id: { $in: payment.tickets } });
            const tierName = tickets[0]?.tierName;
            const quantity = tickets.length;
            if (tierName) {
                // Update tier sold count
                const event = await event_model_1.default.findByIdAndUpdate(payment.event, {
                    $inc: {
                        "ticketTiers.$[tier].sold": quantity
                    }
                }, {
                    arrayFilters: [{ "tier.name": tierName }],
                    new: true
                });
                // Calculate total members = sum of all sold tickets
                const totalSold = event?.ticketTiers?.reduce((sum, tier) => sum + (tier.sold || 0), 0) || 0;
                // Update event member count
                await event_model_1.default.findByIdAndUpdate(payment.event, { member: totalSold }, { new: true });
            }
            // 📢 Send push notification for successful payment
            try {
                const user = await user_model_1.default.findById(req.user._id).select('expoPushToken name');
                const eventData = await event_model_1.default.findById(payment.event).select('title');
                if (user?.expoPushToken) {
                    await (0, pushNotification_1.sendPushNotification)({
                        to: user.expoPushToken,
                        title: 'Payment Successful',
                        body: `Your tickets for "${eventData?.title}" are confirmed! ${quantity} ticket(s) purchased.`,
                        data: { eventId: String(payment.event), paymentId: String(paymentId) }
                    });
                }
                // Create in-app notification
                await notification_model_1.default.create({
                    user: req.user._id,
                    fromUser: null,
                    event: payment.event,
                    title: 'Payment Successful',
                    message: `Your payment for ${quantity} ticket(s) was successful!`,
                    type: 'payment',
                    isRead: false
                });
            }
            catch (error) {
                console.error('Failed to send payment notification:', error);
            }
            // 🎟️ Generate QR codes for all tickets
            for (const ticket of tickets) {
                try {
                    const qrCode = await (0, generateQRCode_1.generateTicketQRCode)(String(ticket._id), String(payment.event));
                    // Save QR code to ticket
                    await ticket_model_1.default.findByIdAndUpdate(ticket._id, { qrCode }, { new: true });
                }
                catch (qrError) {
                    console.error(`Failed to generate QR code for ticket ${ticket._id}:`, qrError);
                    // Continue with other tickets even if one fails
                }
            }
        }
        // 🔥 FETCH full tickets - Optimize with lean()
        const tickets = await ticket_model_1.default.find({
            _id: { $in: payment.tickets },
        }).populate({
            path: "event",
            select: "title location date images price"
        });
        res.json({
            payment,
            tickets,
        });
    }
    catch (error) {
        console.error("Confirm payment error:", error);
        res.status(500).json({ message: "Failed to confirm payment" });
    }
};
exports.confirmPayment = confirmPayment;
const myTickets = async (req, res) => {
    const tickets = await ticket_model_1.default.find({ user: req.user._id }).populate('event');
    res.json(tickets);
};
exports.myTickets = myTickets;
/**
 * Check in a ticket by scanning QR code
 * Only organizers can check in tickets for their events
 */
const checkInTicket = async (req, res) => {
    try {
        const { qrCode, eventId } = req.body;
        console.log('[checkInTicket] Received QR code:', JSON.stringify(qrCode));
        console.log('[checkInTicket] QR code length:', qrCode?.length);
        console.log('[checkInTicket] Event ID:', eventId);
        if (!qrCode || !eventId) {
            return res.status(400).json({ message: "QR code and event ID are required" });
        }
        // Verify user is the organizer of this event
        const event = await event_model_1.default.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }
        if (String(event.organizer) !== String(req.user._id)) {
            return res.status(403).json({ message: "You are not the organizer of this event" });
        }
        // Parse QR code data
        const qrData = (0, generateQRCode_1.parseQRCodeData)(qrCode);
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
        const ticket = await ticket_model_1.default.findById(ticketId)
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
        const updatedTicket = await ticket_model_1.default.findByIdAndUpdate(ticketId, {
            checked: true,
            checkedAt: new Date(),
            checkedBy: req.user._id,
        }, { new: true }).populate('user', 'name email')
            .populate('event', 'title organizer');
        res.json({
            message: "Ticket checked in successfully",
            status: "SUCCESS",
            ticket: updatedTicket,
        });
    }
    catch (error) {
        console.error("Check in ticket error:", error);
        res.status(500).json({ message: "Failed to check in ticket" });
    }
};
exports.checkInTicket = checkInTicket;
