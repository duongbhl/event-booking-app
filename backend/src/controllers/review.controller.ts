import { Request, Response } from 'express';
import Review from '../models/review.model';
import Event from '../models/event.model';



export const addReview = async (req: any, res: Response) => {
    const { eventId } = req.params as { eventId: string };
    const { rating, comment } = req.body as { rating: number; comment?: string };
    const review = await Review.create({ user: req.user!._id, event: eventId, rating, comment });


    const agg = await Review.aggregate<{ _id: string; avg: number }>([
        { $match: { event: review.event } },
        { $group: { _id: '$event', avg: { $avg: '$rating' } } },
    ]);
    await Event.findByIdAndUpdate(eventId, { rating: Math.round((agg[0]?.avg || 0) * 10) / 10 });


    res.status(201).json(review);
};


export const listReviews = async (req: any, res: Response) => {
    const { eventId } = req.params as { eventId: string };
    const reviews = await Review.find({ event: eventId }).populate('user', 'name avatar');
    res.json(reviews)
}