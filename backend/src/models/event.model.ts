import mongoose, { Document, Model } from "mongoose";

export interface IEvent extends Document {
  title: string;
  description?: string;
  category: string;
  price: number;
  date: Date;
  time: string;
  location: string;
  images?: string;
  member: number;
  attendees?: number;
  rating?: number;
  status: "upcoming" | "ongoing" | "finished" | "cancelled";
  approvalStatus: "PENDING" | "ACCEPTED" | "REJECTED";
  organizer: mongoose.Types.ObjectId;
}

const EventSchema = new mongoose.Schema<IEvent>(
  {
    title: { type: String, required: true },
    description: String,

    category: { type: String, required: true },

    price: { type: Number, default: 0 },

    date: { type: Date, required: true },
    time: { type: String, required: true },

    location: { type: String, required: true },

    images: String,

    member: { type: Number, default: 0 },
    attendees: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["upcoming", "ongoing", "finished", "cancelled"],
      default: "upcoming",
    },

    approvalStatus: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED"],
      default: "PENDING",
    },

    // ✅ organizer đúng nghĩa
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Event: Model<IEvent> = mongoose.model("Event", EventSchema);
export default Event;
