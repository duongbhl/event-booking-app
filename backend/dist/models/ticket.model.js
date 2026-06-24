"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const schema = new mongoose_1.default.Schema({
    user: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    event: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Event', required: true },
    price: { type: Number, required: true },
    // Support both old format (VIP/Economy) and new tier-based format
    ticketType: {
        type: String,
        required: true,
    },
    // ✅ Link to ticket tier name
    tierName: String,
    seatInfo: String,
    qrCode: String,
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending',
    },
    checked: {
        type: Boolean,
        default: false,
    },
    checkedAt: Date,
    checkedBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' },
    bookedAt: { type: Date, default: Date.now },
}, { timestamps: true });
schema.index({ user: 1, event: 1 });
const Ticket = mongoose_1.default.model('Ticket', schema);
exports.default = Ticket;
