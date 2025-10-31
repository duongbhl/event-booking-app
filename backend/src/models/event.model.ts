import mongoose, { Document, Model } from 'mongoose';


export interface IEvent extends Document {
    organizer: mongoose.Types.ObjectId;
    title: string;
    description?: string;
    category?: string;
    price: number;
    startDate: Date;
    endDate: Date;
    location?: string;
    images?: string[];
    capacity: number;
    rating: number;
    status: 'upcoming' | 'ongoing' | 'finished' | 'cancelled';
    createdAt?: Date;
    updatedAt?: Date;
}


const schema = new mongoose.Schema<IEvent>(
    {
        organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        title: { type: String, required: true },
        description: String,
        category: String,
        price: { type: Number, default: 0 },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        location: String,
        images: [{ type: String }],
        capacity: { type: Number, default: 0 },
        rating: { type: Number, default: 0 },
        status: { type: String, enum: ['upcoming', 'ongoing', 'finished', 'cancelled'], default: 'upcoming' },
    },
    { timestamps: true }
);


const Event: Model<IEvent> = mongoose.model('Event', schema);
export default Event;