"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const schema = new mongoose_1.default.Schema({
    user: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    event: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Event', required: true },
    remindAt: { type: Date, required: true },
    sent: { type: Boolean, default: false },
}, { timestamps: true });
const Reminder = mongoose_1.default.model('Reminder', schema);
exports.default = Reminder;
