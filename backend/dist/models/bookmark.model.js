"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const schema = new mongoose_1.default.Schema({
    user: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    event: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Event', required: true },
}, { timestamps: true });
schema.index({ user: 1, event: 1 }, { unique: true });
const Bookmark = mongoose_1.default.model('Bookmark', schema);
exports.default = Bookmark;
