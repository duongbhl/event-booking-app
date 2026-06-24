"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const schema = new mongoose_1.default.Schema({
    user: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    event: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Event', required: true },
    tickets: [
        { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Ticket', required: true }
    ],
    amount: { type: Number, required: true },
    method: { type: String, enum: ['credit', 'paypal', 'wallet'], required: true },
    status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
    transactionId: String,
}, { timestamps: true });
const Payment = mongoose_1.default.model('Payment', schema);
exports.default = Payment;
