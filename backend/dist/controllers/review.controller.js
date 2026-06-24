"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listReviews = exports.addReview = void 0;
const review_model_1 = __importDefault(require("../models/review.model"));
const event_model_1 = __importDefault(require("../models/event.model"));
const addReview = async (req, res) => {
    const { eventId } = req.params;
    const { rating, comment } = req.body;
    const review = await review_model_1.default.create({ user: req.user._id, event: eventId, rating, comment });
    const agg = await review_model_1.default.aggregate([
        { $match: { event: review.event } },
        { $group: { _id: '$event', avg: { $avg: '$rating' } } },
    ]);
    await event_model_1.default.findByIdAndUpdate(eventId, { rating: Math.round((agg[0]?.avg || 0) * 10) / 10 });
    res.status(201).json(review);
};
exports.addReview = addReview;
const listReviews = async (req, res) => {
    const { eventId } = req.params;
    const reviews = await review_model_1.default.find({ event: eventId }).populate('user', 'name avatar');
    res.json(reviews);
};
exports.listReviews = listReviews;
