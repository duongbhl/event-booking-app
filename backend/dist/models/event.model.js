"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const EventSchema = new mongoose_1.default.Schema({
    title: { type: String, required: true },
    description: String,
    category: { type: String, required: true },
    price: { type: Number, default: 0 },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    location: { type: String, required: true },
    coordinates: {
        latitude: { type: Number },
        longitude: { type: Number },
    },
    images: String,
    member: { type: Number, default: 0 },
    attendees: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    status: {
        type: String,
        enum: ["upcoming", "ongoing", "finished", "cancelled"],
        default: "upcoming",
    },
    approvalStatus: {
        type: String,
        enum: ["PENDING", "ACCEPTED", "REJECTED"],
        default: "PENDING",
    },
    // ✅ organizer đúng nghĩa
    organizer: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    // ✅ Ticket tiers
    ticketTiers: [
        {
            name: { type: String, required: true },
            price: { type: Number, required: true },
            quota: { type: Number, required: true },
            sold: { type: Number, default: 0 },
        },
    ],
}, { timestamps: true });
const Event = mongoose_1.default.model("Event", EventSchema);
exports.default = Event;
