import mongoose, { Document, Model } from 'mongoose';


export interface IMessage extends Document {
    room: mongoose.Types.ObjectId;
    sender: mongoose.Types.ObjectId;
    content?: string;
    type: 'text' | 'image' | 'file';
    attachments?: string[];
    createdAt?: Date;
    updatedAt?: Date;
}


const schema = new mongoose.Schema<IMessage>(
    {
        room: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatRoom', required: true },
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        content: String,
        type: { type: String, enum: ['text', 'image', 'file'], default: 'text' },
        attachments: [{ type: String }],
    },
    { timestamps: true }
);


schema.index({ room: 1, createdAt: -1 });


const Message: Model<IMessage> = mongoose.model('Message', schema);
export default Message;