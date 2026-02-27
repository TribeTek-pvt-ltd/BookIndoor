import mongoose, { Schema, Document, Types } from "mongoose";

export interface ITimeSlot {
  startTime: string; // "10:00"
}

export interface IBooking extends Document {
  ground: Types.ObjectId;
  sportName: string;
  user?: Types.ObjectId; // admin user if logged in
  guest?: {
    name: string;
    email?: string;
    phone: string;
    nicNumber: string;
  };
  date: string; // "YYYY-MM-DD"
  timeSlots: ITimeSlot[];
  status: "reserved" | "confirmed" | "cancelled";
  paymentStatus: "pending" | "advanced_paid" | "full_paid";
  paymentGroupId?: string;
  payherePaymentId?: string; // ✅ Track PayHere transaction ID
  paidAmount?: number; // ✅ Track actual amount paid
  totalAmount: number;
  createdAt: Date;
}

const TimeSlotSchema = new Schema<ITimeSlot>(
  {
    startTime: { type: String, required: true },
  },
  { _id: false }
);

const BookingSchema = new Schema<IBooking>(
  {
    ground: { type: Schema.Types.ObjectId, ref: "Ground", required: true },
    sportName: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: "User" }, // optional if admin
    guest: {
      name: { type: String },
      email: { type: String },
      phone: { type: String, required: true },
      nicNumber: { type: String, required: false },
    },
    date: { type: String, required: true },
    timeSlots: { type: [TimeSlotSchema], required: true },
    status: {
      type: String,
      enum: ["reserved", "confirmed", "cancelled"],
      default: "reserved",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "advanced_paid", "full_paid"],
      default: "advanced_paid",
    },
    paymentGroupId: { type: String }, // ✅ ID to group bookings for single payment
    payherePaymentId: { type: String }, // ✅ Track PayHere transaction ID
    paidAmount: { type: Number }, // ✅ Track actual amount paid
    totalAmount: { type: Number, required: true },
  },
  { timestamps: true }
);

// Prevent Mongoose overwrite warning in development
if (mongoose.models.Booking) {
  delete mongoose.models.Booking;
}

export default mongoose.model<IBooking>("Booking", BookingSchema);
