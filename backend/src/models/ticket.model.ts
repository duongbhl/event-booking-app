import mongoose, { Document, Model } from 'mongoose';


export interface ITicket extends Document {
    user: mongoose.Types.ObjectId;
    event: mongoose.Types.ObjectId;
    price: number;
    ticketType: 'VIP' | 'Economy';
    seatInfo?: string;
    qrCode?: string;
    paymentStatus: 'pending' | 'paid' | 'failed';
    bookedAt: Date;
}



const schema = new mongoose.Schema<ITicket>(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
        price: { type: Number, required: true },

        // 🔥 NEW
        ticketType: {
            type: String,
            enum: ['VIP', 'Economy'],
            required: true,
        },

        seatInfo: String,
        qrCode: String,
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'failed'],
            default: 'pending',
        },
        bookedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);


schema.index({ user: 1, event: 1 });


const Ticket: Model<ITicket> = mongoose.model('Ticket', schema);
export default Ticket;