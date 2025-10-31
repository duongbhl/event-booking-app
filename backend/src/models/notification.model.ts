import mongoose, { Document, Model } from 'mongoose';


export interface INotification extends Document {
    user: mongoose.Types.ObjectId;
    title: string;
    message: string;
    type: 'reminder' | 'chat' | 'payment' | 'system' | 'invitation';
    isRead: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}


const schema = new mongoose.Schema<INotification>(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        title: { type: String, required: true },
        message: { type: String, required: true },
        type: { type: String, enum: ['reminder', 'chat', 'payment', 'system', 'invitation'], default: 'system' },
        isRead: { type: Boolean, default: false },
    },
    { timestamps: true }
);


const Notification: Model<INotification> = mongoose.model('Notification', schema);
export default Notification;