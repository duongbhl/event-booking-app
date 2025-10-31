import mongoose, { Document, Model } from 'mongoose';


export interface IChatRoom extends Document {
    event?: mongoose.Types.ObjectId;
    isGroup: boolean;
    members: mongoose.Types.ObjectId[];
    createdAt?: Date;
    updatedAt?: Date;
}


const schema = new mongoose.Schema<IChatRoom>(
    {
        event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
        isGroup: { type: Boolean, default: false },
        members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    },
    { timestamps: true }
);


schema.index({ members: 1 });


const ChatRoom: Model<IChatRoom> = mongoose.model('ChatRoom', schema);
export default ChatRoom;