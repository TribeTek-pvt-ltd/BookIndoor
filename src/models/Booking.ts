import mongoose, { Schema, Document } from "mongoose";

export interface IBookingSlot {
  timeSlot: string; // e.g., "06:00-07:00"
  status: "reserved" | "confirmed"; // reserved = advanced paid, confirmed = fully paid
}

export interface IBooking extends Document {
  user: mongoose.Types.ObjectId;
  ground: mongoose.Types.ObjectId;
  sport: string;
  date: string; // YYYY-MM-DD
  slots: IBookingSlot[];
  paymentStatus: "advanced_paid" | "full_paid";
  createdAt: Date;
}

const BookingSlotSchema = new Schema<IBookingSlot>(
  {
    timeSlot: { type: String, required: true },
    status: {
      type: String,
      enum: ["reserved", "confirmed"],
      default: "reserved",
    },
  },
  { _id: false }
);

const BookingSchema = new Schema<IBooking>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    ground: { type: Schema.Types.ObjectId, ref: "Ground", required: true },
    sport: { type: String, required: true },
    date: { type: String, required: true },
    slots: { type: [BookingSlotSchema], required: true },
    paymentStatus: {
      type: String,
      enum: ["advanced_paid", "full_paid"],
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent double booking for same ground + sport + date + slot
BookingSchema.index(
  { ground: 1, sport: 1, date: 1, "slots.timeSlot": 1 },
  { unique: true }
);

export default mongoose.models.Booking ||
  mongoose.model<IBooking>("Booking", BookingSchema);
