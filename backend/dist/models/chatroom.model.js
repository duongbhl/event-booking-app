"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const schema = new mongoose_1.default.Schema({
    event: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Event' },
    isGroup: { type: Boolean, default: false },
    members: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });
schema.index({ members: 1 });
const ChatRoom = mongoose_1.default.model('ChatRoom', schema);
exports.default = ChatRoom;
