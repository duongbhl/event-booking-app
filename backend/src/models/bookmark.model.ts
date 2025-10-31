import mongoose, { Document, Model } from 'mongoose';


export interface IBookmark extends Document {
    user: mongoose.Types.ObjectId;
    event: mongoose.Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}


const schema = new mongoose.Schema<IBookmark>(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    },
    { timestamps: true }
);


schema.index({ user: 1, event: 1 }, { unique: true });


const Bookmark: Model<IBookmark> = mongoose.model('Bookmark', schema);
export default Bookmark;