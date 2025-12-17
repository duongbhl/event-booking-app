import mongoose, { Document, Model } from "mongoose";

export interface ICard extends Document {
  user: mongoose.Types.ObjectId;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isPrimary: boolean;
  createdAt?: Date;
}

const cardSchema = new mongoose.Schema<ICard>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    brand: { type: String, required: true },
    last4: { type: String, required: true },
    expMonth: { type: Number, required: true },
    expYear: { type: Number, required: true },
    isPrimary: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Card: Model<ICard> = mongoose.model("Card", cardSchema);
export default Card;
