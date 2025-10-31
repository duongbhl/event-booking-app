import mongoose, { Document, Model } from 'mongoose';


export interface IReview extends Document {
    user: mongoose.Types.ObjectId;
    event: mongoose.Types.ObjectId;
    rating: number; // 1..5
    comment?: string;
    createdAt?: Date;
    updatedAt?: Date;
}


const schema = new mongoose.Schema<IReview>(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
        rating: { type: Number, min: 1, max: 5, required: true },
        comment: String,
    },
    { timestamps: true }
);


schema.index({ user: 1, event: 1 }, { unique: true });


const Review: Model<IReview> = mongoose.model('Review', schema);
export default Review;