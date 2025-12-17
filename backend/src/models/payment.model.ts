import mongoose, { Document, Model } from 'mongoose';


export interface IPayment extends Document {
    user: mongoose.Types.ObjectId;
    event: mongoose.Types.ObjectId;
    tickets: mongoose.Types.ObjectId[];
    amount: number;
    method: 'credit' | 'paypal' | 'wallet';
    status: 'pending' | 'success' | 'failed';
    transactionId?: string;
    createdAt?: Date;
    updatedAt?: Date;
}


const schema = new mongoose.Schema<IPayment>(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
        tickets: [
            { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true }
        ],
        amount: { type: Number, required: true },
        method: { type: String, enum: ['credit', 'paypal', 'wallet'], required: true },
        status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
        transactionId: String,
    },
    { timestamps: true }
);


const Payment: Model<IPayment> = mongoose.model('Payment', schema);
export default Payment;