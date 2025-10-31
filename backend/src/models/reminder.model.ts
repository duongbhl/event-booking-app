import mongoose, { Document, Model } from 'mongoose';


export interface IReminder extends Document {
    user: mongoose.Types.ObjectId;
    event: mongoose.Types.ObjectId;
    remindAt: Date;
    sent: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}


const schema = new mongoose.Schema<IReminder>(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
        remindAt: { type: Date, required: true },
        sent: { type: Boolean, default: false },
    },
    { timestamps: true }
);


const Reminder: Model<IReminder> = mongoose.model('Reminder', schema);
export default Reminder;