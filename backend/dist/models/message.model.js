"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const schema = new mongoose_1.default.Schema({
    room: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'ChatRoom', required: true },
    sender: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    content: String,
    type: { type: String, enum: ['text', 'image', 'file'], default: 'text' },
    attachments: [{ type: String }],
    readBy: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', default: [] }],
}, { timestamps: true });
schema.index({ room: 1, createdAt: -1 });
const Message = mongoose_1.default.model('Message', schema);
exports.default = Message;
