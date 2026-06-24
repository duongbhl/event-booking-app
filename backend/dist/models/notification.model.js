"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const schema = new mongoose_1.default.Schema({
    user: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    fromUser: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' },
    event: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Event' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['reminder', 'chat', 'payment', 'system', 'invitation'], default: 'system' },
    isRead: { type: Boolean, default: false },
}, { timestamps: true });
const Notification = mongoose_1.default.model('Notification', schema);
exports.default = Notification;
